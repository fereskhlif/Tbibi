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
      <div class="p-6 border-b border-gray-200 bg-white">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🤖</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">AI Health Assistant</h1>
            <p class="text-sm text-green-600 flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Powered by Gemma AI • Online
            </p>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50" #messagesContainer>

        <!-- Typing indicator -->
        <ng-container *ngFor="let msg of messages; trackBy: trackById">

          <div [class]="'flex ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')">

            <!-- Typing dots -->
            <div *ngIf="msg.isTyping"
              class="max-w-md px-4 py-3 rounded-2xl bg-white border border-gray-200">
              <span class="typing-dots">
                <span></span><span></span><span></span>
              </span>
            </div>

            <!-- Normal message -->
            <div *ngIf="!msg.isTyping"
              [class]="'max-w-md px-4 py-3 rounded-2xl ' +
                (msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900')">
              <p class="text-sm whitespace-pre-wrap" [innerHTML]="msg.text"></p>
              <p [class]="'text-xs mt-1 ' + (msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400')">
                {{ msg.time }}
              </p>
            </div>

          </div>
        </ng-container>

        <div #scrollAnchor></div>
      </div>

      <!-- Suggestions -->
      <div class="px-6 py-3 bg-white border-t border-gray-200">
        <div class="flex gap-2 overflow-x-auto">
          <button
            *ngFor="let s of suggestions"
            (click)="sendSuggestion(s)"
            [disabled]="isLoading"
            class="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors flex-shrink-0 disabled:opacity-50">
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 bg-white border-t border-gray-200">
        <div class="flex gap-3">
          <input
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            [disabled]="isLoading"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Describe your symptoms..."
          />
          <button
            (click)="sendMessage()"
            [disabled]="isLoading || !newMessage.trim()"
            class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!isLoading">Send</span>
            <span *ngIf="isLoading">...</span>
          </button>
        </div>
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
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      display: inline-block;
      animation: bounce 1.2s ease-in-out infinite;
    }
    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-8px); }
    }

    /* Scrollbar */
    .overflow-y-auto::-webkit-scrollbar { width: 4px; }
    .overflow-y-auto::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
  `]
})
export class AiChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  newMessage = '';
  isLoading = false;
  private msgId = 0;
  private shouldScroll = false;

  suggestions = [
    'Check my symptoms',
    'Medication info',
    'Book an appointment',
    'Emergency help',
    'Diet advice'
  ];

  messages: ChatMessage[] = [
    {
      id: this.msgId++,
      sender: 'ai',
      text: "Hello! I'm your AI Health Assistant powered by <strong>Gemma AI</strong>. " +
            "How can I help you today? You can describe your symptoms, ask about medications, " +
            "or get general health advice.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  constructor(private aiChatService: AiChatService) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  trackById(_: number, msg: ChatMessage): number {
    return msg.id;
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

    // Add typing indicator
    const typingId = this.msgId++;
    this.messages.push({ id: typingId, sender: 'ai', text: '', time: '', isTyping: true });
    this.shouldScroll = true;

    // Call real Gemma AI
    this.aiChatService.ask(text).subscribe({
      next: (answer) => {
        this.messages = this.messages.filter(m => m.id !== typingId);
        this.messages.push({
          id: this.msgId++,
          sender: 'ai',
          text: answer,
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
          text: '⚠️ I had trouble connecting to the AI service. Please try again in a moment.',
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
}
