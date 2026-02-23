import { Component } from '@angular/core';

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
              <span class="w-2 h-2 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        <div *ngFor="let msg of messages" [class]="'flex ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')">
          <div [class]="'max-w-md px-4 py-3 rounded-2xl ' + (msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900')">
            <p class="text-sm">{{msg.text}}</p>
            <p [class]="'text-xs mt-1 ' + (msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400')">{{msg.time}}</p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="px-6 py-3 bg-white border-t border-gray-200">
        <div class="flex gap-2 overflow-x-auto">
          <button *ngFor="let s of suggestions" (click)="sendSuggestion(s)"
            class="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors flex-shrink-0">
            {{s}}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 bg-white border-t border-gray-200">
        <div class="flex gap-3">
          <input
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your symptoms..."
          />
          <button (click)="sendMessage()" class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  `
})
export class AiChatComponent {
    newMessage = '';
    suggestions = ['Check my symptoms', 'Medication info', 'Book an appointment', 'Emergency help', 'Diet advice'];
    messages = [
        { sender: 'ai', text: 'Hello! I\'m your AI Health Assistant. How can I help you today? You can describe your symptoms, ask about medications, or get general health advice.', time: '10:00 AM' },
        { sender: 'user', text: 'I\'ve been having headaches for the past few days', time: '10:01 AM' },
        { sender: 'ai', text: 'I\'m sorry to hear about your headaches. Let me ask a few questions to better understand your situation:\n\n1. Where is the pain located? (front, back, sides)\n2. How would you rate the intensity from 1-10?\n3. Are you experiencing any other symptoms like nausea or sensitivity to light?', time: '10:01 AM' },
        { sender: 'user', text: 'It\'s mainly in the front, around 6/10, and I sometimes feel nauseous', time: '10:02 AM' },
        { sender: 'ai', text: 'Based on your description, this could be a tension-type headache. Here are my recommendations:\n\n• Stay hydrated - drink at least 8 glasses of water daily\n• Ensure adequate sleep (7-9 hours)\n• Take breaks from screen time every 30 minutes\n• Consider over-the-counter pain relief like acetaminophen\n\n⚠️ If headaches persist for more than a week or worsen, I recommend scheduling an appointment with your doctor. Would you like me to help you book one?', time: '10:02 AM' }
    ];

    sendMessage() {
        if (!this.newMessage.trim()) return;
        this.messages.push({ sender: 'user', text: this.newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        const userMsg = this.newMessage;
        this.newMessage = '';
        setTimeout(() => {
            this.messages.push({
                sender: 'ai',
                text: 'Thank you for sharing that. I\'m analyzing your input and will provide recommendations shortly. For any urgent concerns, please contact your healthcare provider directly.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }, 1000);
    }

    sendSuggestion(text: string) {
        this.newMessage = text;
        this.sendMessage();
    }
}
