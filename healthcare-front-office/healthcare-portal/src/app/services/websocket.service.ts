import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private pendingSubscriptions: Array<{ topic: string; callback: (msg: IMessage) => void; resolve: (sub: StompSubscription) => void }> = [];

  constructor(private ngZone: NgZone) {}

  connect(): void {
    if (this.client && this.connected) return;

    this.client = new Client({
      brokerURL: 'ws://localhost:8088/ws/websocket',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP]', str);
      }
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('[WebSocket] Connected');

      // Process any subscriptions that were requested before connection was ready
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
        // Queue subscription for when connection is ready
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
