import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { AiChatService } from '../../services/ai-chat.service';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-ai-chat',
  template: `
    <div class="h-full flex flex-col">

      <!-- Header -->
      <div class="p-5 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span class="text-xl">🤖</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">Tbibi AI Assistant</h1>
              <p class="text-xs text-green-600 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                Online • Medical &amp; Platform Support
              </p>
            </div>
          </div>
          <!-- Clear conversation button -->
          <button
            (click)="clearConversation()"
            [disabled]="isLoading || messages.length <= 1"
            title="Clear conversation"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            🗑️ Clear
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50" #messagesContainer>

        <ng-container *ngFor="let msg of messages; trackBy: trackById">
          <div [class]="'flex ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')">

            <!-- AI avatar -->
            <div *ngIf="msg.sender === 'ai' && !msg.isTyping" class="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
              <span class="text-xs">🤖</span>
            </div>

            <!-- Typing dots -->
            <div *ngIf="msg.isTyping"
              class="max-w-sm px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span class="typing-dots">
                <span></span><span></span><span></span>
              </span>
            </div>

            <!-- Normal message -->
            <div *ngIf="!msg.isTyping"
              [class]="'max-w-lg px-4 py-3 rounded-2xl shadow-sm ' +
                (msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm')">
              <p class="text-sm whitespace-pre-wrap leading-relaxed" [innerHTML]="msg.text"></p>
              <p [class]="'text-[10px] mt-1.5 ' + (msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400')">
                {{ msg.time }}
              </p>
            </div>

          </div>
        </ng-container>

        <div #scrollAnchor></div>
      </div>

      <!-- Quick suggestions -->
      <div class="px-5 py-3 bg-white border-t border-gray-100">
        <p class="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-2">Quick questions</p>
        <div class="flex gap-2 flex-wrap">
          <button
            *ngFor="let s of suggestions"
            (click)="sendSuggestion(s)"
            [disabled]="isLoading"
            class="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-40 border border-indigo-100">
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 bg-white border-t border-gray-200">
        <div class="flex gap-3 items-end">
          <textarea
            [(ngModel)]="newMessage"
            (keydown.enter)="onEnter($event)"
            [disabled]="isLoading"
            rows="1"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none text-sm"
            placeholder="Ask about your health or the Tbibi app..."
            style="min-height: 48px; max-height: 120px;"
          ></textarea>
          <button
            (click)="sendMessage()"
            [disabled]="isLoading || !newMessage.trim()"
            class="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex-shrink-0">
            <span *ngIf="!isLoading">Send ➤</span>
            <span *ngIf="isLoading" class="flex items-center gap-1">
              <span class="animate-spin">⏳</span>
            </span>
          </button>
        </div>
        <p class="text-[10px] text-gray-400 mt-2 text-center">
          Tbibi AI answers questions about the platform &amp; medical health only.
        </p>
      </div>

    </div>
  `,
  styles: [`
    /* Typing animation */
    .typing-dots {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 20px;
    }
    .typing-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #a78bfa;
      display: inline-block;
      animation: bounce 1.2s ease-in-out infinite;
    }
    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-7px); }
    }

    .overflow-y-auto::-webkit-scrollbar { width: 4px; }
    .overflow-y-auto::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
  `]
})
export class AiChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  newMessage   = '';
  isLoading    = false;
  private msgId = 0;
  private shouldScroll = false;

  // Persistent session ID across the page lifetime (stored in sessionStorage)
  sessionId: string = '';

  suggestions = [
    '🏥 How do I book an appointment?',
    '🔄 How does rescheduling work?',
    '🤒 I have a fever — what should I do?',
    '💊 Is ibuprofen safe?',
    '🚨 Emergency numbers in Tunisia',
  ];

  messages: ChatMessage[] = [];

  constructor(private aiChatService: AiChatService) {}

  ngOnInit(): void {
    // Restore or create session ID
    const stored = sessionStorage.getItem('tbibi_chat_session');
    if (stored) {
      this.sessionId = stored;
    } else {
      this.sessionId = this.generateUUID();
      sessionStorage.setItem('tbibi_chat_session', this.sessionId);
    }

    // Welcome message
    this.messages = [{
      id: this.msgId++,
      sender: 'ai',
      text: "👋 Hello! I'm <strong>Tbibi AI</strong>, your personal health and platform assistant.\n\n" +
            "I can help you with:\n" +
            "• 🏥 <strong>Tbibi platform</strong> — booking, rescheduling, notifications...\n" +
            "• 🩺 <strong>Medical questions</strong> — symptoms, medications, when to see a doctor\n\n" +
            "How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  trackById(_: number, msg: ChatMessage): number {
    return msg.id;
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || this.isLoading) return;

    // Add user message
    this.messages.push({
      id: this.msgId++,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.newMessage = '';
    this.isLoading = true;
    this.shouldScroll = true;

    // Show typing indicator
    const typingId = this.msgId++;
    this.messages.push({ id: typingId, sender: 'ai', text: '', time: '', isTyping: true });
    this.shouldScroll = true;

    // Call AI service with session memory
    this.aiChatService.ask(text, this.sessionId).subscribe({
      next: (res) => {
        // Update session ID from server response (in case server auto-generated one)
        if (res.session_id) {
          this.sessionId = res.session_id;
          sessionStorage.setItem('tbibi_chat_session', this.sessionId);
        }
        this.messages = this.messages.filter(m => m.id !== typingId);
        this.messages.push({
          id: this.msgId++,
          sender: 'ai',
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.messages = this.messages.filter(m => m.id !== typingId);
        this.messages.push({
          id: this.msgId++,
          sender: 'ai',
          text: '⚠️ I had trouble connecting to the AI service. Please make sure the Tbibi AI service is running and try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  sendSuggestion(text: string): void {
    this.newMessage = text;
    this.sendMessage();
  }

  clearConversation(): void {
    // Clear memory on server
    this.aiChatService.clearSession(this.sessionId).subscribe();

    // Generate a fresh session ID
    this.sessionId = this.generateUUID();
    sessionStorage.setItem('tbibi_chat_session', this.sessionId);

    // Reset messages to welcome
    this.msgId = 0;
    this.messages = [{
      id: this.msgId++,
      sender: 'ai',
      text: "🧹 Conversation cleared! Let's start fresh.\n\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
