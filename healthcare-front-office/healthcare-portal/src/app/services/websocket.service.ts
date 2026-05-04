import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private pendingSubscriptions: Array<{
    topic: string;
    callback: (msg: IMessage) => void;
    resolve: (sub: StompSubscription) => void
  }> = [];

  // 👇 Add this helper to convert HTTP URL → WebSocket URL
  private getWebSocketUrl(): string {
    let url = environment.baseUrl;

    // Convert protocol: http→ws, https→wss
    if (url.startsWith('https://')) {
      url = 'wss://' + url.substring(8);
    } else if (url.startsWith('http://')) {
      url = 'ws://' + url.substring(7);
    }

    // Ensure /ws/websocket path is appended (avoid duplicates)
    return url.replace(/\/+$/, '') + '/ws/websocket';
  }

  constructor(private ngZone: NgZone) { }

  connect(): void {
    if (this.client && this.connected) return;

    this.client = new Client({
      // 👇 Use dynamic URL instead of hardcoded string
      brokerURL: this.getWebSocketUrl(),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP]', str);
      }
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('[WebSocket] Connected to', this.getWebSocketUrl());
      this.pendingSubscriptions.forEach(({ topic, callback, resolve }) => {
        const sub = this.client!.subscribe(topic, (msg) => {
          this.ngZone.run(() => callback(msg));
        });
        resolve(sub);
      });
      this.pendingSubscriptions = [];
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message']);
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log('[WebSocket] Disconnected');
    };

    this.client.activate();
  }

  subscribe(topic: string, callback: (msg: IMessage) => void): Promise<StompSubscription> {
    return new Promise((resolve) => {
      if (this.client && this.connected) {
        const sub = this.client.subscribe(topic, (msg) => {
          this.ngZone.run(() => callback(msg));
        });
        resolve(sub);
      } else {
        this.pendingSubscriptions.push({ topic, callback, resolve });
      }
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }
} 
