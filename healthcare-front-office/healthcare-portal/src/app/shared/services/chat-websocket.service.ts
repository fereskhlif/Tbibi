import { Injectable } from '@angular/core';
import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

export interface MedicalChatDto {
  id?: number;
  message: string;
  senderId: number;
  receiverId: number;
  fileUrl?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;

  // Transient used for typing indicator
  isTyping?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatWebSocketService {

  private stompClient: Client;
  private messageSubject = new Subject<MedicalChatDto>();
  private typingSubject = new Subject<MedicalChatDto>();
  private connectedStatus = new BehaviorSubject<boolean>(false);
  private currentSubscription?: StompSubscription;
  
  public messages$ = this.messageSubject.asObservable();
  public typing$ = this.typingSubject.asObservable();
  public isConnected$ = this.connectedStatus.asObservable();

  constructor() {
    // Get token and clean it for use
    let token = localStorage.getItem('TokenUserConnect') || localStorage.getItem('token') || '';
    token = token.replace(/^"|"$/g, '').trim();
    
    // Build WebSocket URL with token as query parameter (fallback for SockJS)
    const wsUrl = token 
      ? `http://localhost:8088/ws?Authorization=Bearer%20${encodeURIComponent(token)}` 
      : 'http://localhost:8088/ws';

    this.stompClient = new Client({
      debug: (msg: string) => console.log('STOMP: ' + msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => {
        // Safe instantiation for CommonJS modules in Angular
        const SockJSClass = (SockJS as any).default || SockJS;
        return new SockJSClass(wsUrl) as any;
      }
    });

    this.stompClient.onConnect = (frame) => {
      console.log('STOMP Connected: ', frame);
      this.connectedStatus.next(true);

      const userId = this.getUserId();
      if (userId) {
        // Subscribe to private messages queue
        this.currentSubscription = this.stompClient.subscribe(`/topic/messages/${userId}`, (message: IMessage) => {
          if (message.body) {
            const parsed = JSON.parse(message.body) as MedicalChatDto;
            this.messageSubject.next(parsed);
          }
        });

        // Subscribe to typing indicator queue
        this.stompClient.subscribe(`/topic/typing/${userId}`, (message: IMessage) => {
            if (message.body) {
              const parsed = JSON.parse(message.body) as MedicalChatDto;
              this.typingSubject.next(parsed);
            }
        });
      }
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('STOMP Error: ', error);
      this.connectedStatus.next(false);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
  }

  public connect() {
    // Already connected or no token logic
    if (this.stompClient.active) return;

    let token = localStorage.getItem('TokenUserConnect') || localStorage.getItem('token');
    if (!token) {
        console.warn('⚠️ No token available for WebSocket connection');
        return;
    }
    
    // Clean token
    token = token.replace(/^"|"$/g, '').trim();

    // Set connection headers for Spring Security (for servers that support native headers in STOMP)
    this.stompClient.connectHeaders = {
      Authorization: `Bearer ${token}`
    };

    console.log('🔌 Connecting to WebSocket...');
    this.stompClient.activate();
  }

  public disconnect() {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
    this.stompClient.deactivate();
    this.connectedStatus.next(false);
  }

  public sendMessage(chatDto: MedicalChatDto) {
    if (this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatDto)
      });
    } else {
        console.error("STOMP connection not active. Cannot send message.");
    }
  }

  public sendTypingStatus(receiverId: number, isTyping: boolean) {
    if (this.stompClient.connected) {
      const typingEvent: Partial<MedicalChatDto> = {
        senderId: this.getUserId(),
        receiverId: receiverId,
        isTyping: isTyping
      };
      this.stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(typingEvent)
      });
    }
  }

  private getUserId(): number {
    return Number(localStorage.getItem('userId') || 1);
  }
}
