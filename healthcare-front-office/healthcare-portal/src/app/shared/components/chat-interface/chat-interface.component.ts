import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatWebSocketService, MedicalChatDto } from '../../services/chat-websocket.service';
import { ChatHttpService } from '../../services/chat-http.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface Contact {
  userId: number;
  name: string;
  role: string;
  lastMessage?: string;
  unreadCount: number;
}

@Component({
  selector: 'app-chat-interface',
  template: `
  <div class="flex h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-5">
    
    <!-- LEFT SIDEBAR: Contacts list -->
    <div class="w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col">
      <div class="p-4 bg-white border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-800">Messages</h2>
        <input type="text" placeholder="Search contacts..." 
           class="w-full mt-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2">
        <div *ngIf="contacts.length === 0" class="text-center text-gray-400 p-5 text-sm">
          No recent conversations.
        </div>
        
        <div *ngFor="let contact of contacts" 
             (click)="selectContact(contact)"
             [class.bg-blue-50]="selectedContact?.userId === contact.userId"
             class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors mb-1">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
            {{contact.name.charAt(0) | uppercase}}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-800 text-sm truncate">{{contact.name}}</h3>
            <p class="text-xs text-gray-500 truncate">{{contact.lastMessage || 'Click to chat...'}}</p>
          </div>
          <div *ngIf="contact.unreadCount > 0" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {{contact.unreadCount}}
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDE: Chat Area -->
    <div class="flex-1 flex flex-col bg-white">
      
      <!-- EMPTY STATE -->
      <div *ngIf="!selectedContact" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700">Your Messages</h3>
        <p class="text-sm">Select a contact to start chatting privately.</p>
      </div>

      <!-- ACTIVE CHAT VIEW -->
      <ng-container *ngIf="selectedContact">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
            {{selectedContact.name.charAt(0) | uppercase}}
          </div>
          <div>
            <h3 class="font-bold text-gray-800">{{selectedContact.name}}</h3>
            <p class="text-xs text-green-500 font-medium">Online</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 relative" #scrollMe>
          <div *ngIf="loadingHistory" class="text-center p-4">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          
          <div *ngFor="let msg of activeChatMessages" 
               class="flex flex-col"
               [ngClass]="msg.senderId === currentUserId ? 'items-end' : 'items-start'">
            
            <div class="max-w-[70%] p-3 rounded-2xl shadow-sm break-words relative"
                 [ngClass]="msg.senderId === currentUserId 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'">
              
              <!-- Optional Image Attachment -->
              <img *ngIf="msg.fileUrl" [src]="msg.fileUrl" 
                   class="max-w-full rounded-xl mb-2 object-cover max-h-48 cursor-pointer hover:opacity-90 transition"/>
                   
              <p class="text-[15px] leading-relaxed">{{msg.message}}</p>
              
              <div class="flex items-center justify-end gap-1 mt-1 opacity-70"
                   [ngClass]="msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'">
                <span class="text-[10px]">{{ msg.createdAt | date:'shortTime' }}</span>
                <!-- Read receipt (only show for current user's messages) -->
                <ng-container *ngIf="msg.senderId === currentUserId">
                  <svg *ngIf="!msg.isRead" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <svg *ngIf="msg.isRead" class="text-blue-200" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"></path><path d="m22 10-7.5 7.5L13 16"></path></svg>
                </ng-container>
              </div>
            </div>
          </div>
          
          <!-- Typing Indicator -->
          <div *ngIf="isTyping" class="flex items-start">
             <div class="bg-gray-200 text-gray-500 rounded-2xl rounded-tl-none p-3 px-4 shadow-sm flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                <div class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                <div class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
             </div>
          </div>
        </div>

        <!-- Chat Input Form -->
        <div class="p-3 bg-white border-t border-gray-100">
          <div class="flex items-end gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            
            <!-- Attachment Button -->
            <button (click)="fileInput.click()" class="p-2.5 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden"/>

            <!-- Text Input -->
            <textarea [(ngModel)]="newMessage" 
                      (input)="onTyping()"
                      (keydown.enter)="sendMessage($event)"
                      placeholder="Type your message..." 
                      rows="1"
                      class="flex-1 max-h-32 min-h-[44px] py-3 px-2 bg-transparent resize-none focus:outline-none text-[15px]"></textarea>
            
            <!-- Send Button -->
            <button (click)="sendMessage()" 
                    [disabled]="!newMessage.trim() && !pendingFile"
                    [class.opacity-50]="!newMessage.trim() && !pendingFile"
                    class="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shrink-0 shadow-md flex items-center justify-center">
              <svg *ngIf="!uploading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <div *ngIf="uploading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
          
          <!-- Image preview pill -->
          <div *ngIf="pendingFile" class="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg border border-blue-100">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
             <span class="truncate max-w-[150px]">{{pendingFile.name}}</span>
             <button (click)="pendingFile = null" class="hover:text-red-500 font-bold ml-1">×</button>
          </div>
        </div>
      </ng-container>
    </div>
  </div>
  `,
  styles: [`
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `]
})
export class ChatInterfaceComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  currentUserId: number = 1;
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  activeChatMessages: MedicalChatDto[] = [];
  
  newMessage: string = '';
  pendingFile: File | null = null;
  
  loadingHistory: boolean = false;
  uploading: boolean = false;
  isTyping: boolean = false;
  
  private typingTimeout: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private chatWs: ChatWebSocketService,
    private chatHttp: ChatHttpService
  ) {}

  ngOnInit() {
    this.currentUserId = Number(localStorage.getItem('userId') || 1);
    const role = localStorage.getItem('RoleUserConnect');
    
    console.log('🔧 ChatInterfaceComponent initialized');
    console.log('   Current User ID:', this.currentUserId);
    console.log('   User Role:', role);
    
    // Connect websocket
    this.chatWs.connect();

    // Monitor connection status
    this.subscriptions.add(this.chatWs.isConnected$.subscribe(connected => {
      if (connected) {
        console.log('✅ WebSocket connected');
      } else {
        console.warn('⚠️ WebSocket disconnected');
      }
    }));

    // Listen to incoming messages
    this.subscriptions.add(this.chatWs.messages$.subscribe(msg => {
      // If message belongs to active chat, add it
      if (this.selectedContact && (msg.senderId === this.selectedContact.userId || msg.receiverId === this.selectedContact.userId)) {
        // Prevent duplicates from bouncing back
        if (!this.activeChatMessages.find(m => m.id === msg.id)) {
           this.activeChatMessages.push(msg);
           this.scrollToBottom();
        }
      } else {
        // It's from someone else, update unread badge on their contact card
        this.updateContactBadge(msg.senderId, msg.message);
      }
    }));

    // Listen to typing indicators
    this.subscriptions.add(this.chatWs.typing$.subscribe(event => {
      if (this.selectedContact && event.senderId === this.selectedContact.userId) {
        this.isTyping = event.isTyping || false;
        if (this.isTyping) this.scrollToBottom();
      }
    }));

    // Load available dynamic contacts (For MVP: fetching ALL users of opposite role or just hitting /users)
    this.loadContacts();
  }

  loadContacts() {
    const role = (localStorage.getItem('RoleUserConnect') || '').toUpperCase().trim();
    
    console.log('📋 Loading contacts for role:', role);

    // Patients see doctors; doctors/DOCTEUR see patients
    const isPatient = role.includes('PATIENT');
    const contactsObservable = isPatient
      ? this.chatHttp.getAllDoctors()
      : this.chatHttp.getAllPatients();
    
    this.subscriptions.add(contactsObservable.subscribe({
      next: (users) => {
        console.log('✅ Contacts loaded:', users.length, 'users');
        if (users && users.length > 0) {
          this.contacts = users.map(u => ({
            userId: u.userId,
            name: u.name || 'Unknown User',
            role: (u as any).roleName || u.role || 'User',
            unreadCount: 0
          }));
        } else {
          console.warn('⚠️ No contacts found for role:', role);
          this.contacts = [];
        }
      },
      error: (err) => {
        console.error('❌ Error loading contacts:', err);
        this.contacts = [];
      }
    }));
  }

  updateContactBadge(senderId: number, lastMsg: string) {
    const contact = this.contacts.find(c => c.userId === senderId);
    if (contact) {
      contact.unreadCount++;
      contact.lastMessage = lastMsg;
    }
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
    this.contactRead(contact);
    this.loadingHistory = true;
    this.activeChatMessages = [];

    this.chatHttp.getConversationHistory(this.currentUserId, contact.userId).subscribe({
      next: (msgs) => {
        this.activeChatMessages = msgs;
        this.loadingHistory = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.loadingHistory = false
    });
  }

  contactRead(contact: Contact) {
    contact.unreadCount = 0;
  }

  onTyping() {
    if (!this.selectedContact) return;
    
    // Send typing true
    this.chatWs.sendTypingStatus(this.selectedContact.userId, true);
    
    // Clear previous timeout
    clearTimeout(this.typingTimeout);
    
    // Set 1500ms timeout for 'stopped typing'
    this.typingTimeout = setTimeout(() => {
        if(this.selectedContact) {
            this.chatWs.sendTypingStatus(this.selectedContact.userId, false);
        }
    }, 1500);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pendingFile = file;
    }
  }

  sendMessage(event?: Event) {
    if (event) {
      event.preventDefault(); // Prevents new line on Enter
    }
    
    if (!this.selectedContact) return;
    if (!this.newMessage.trim() && !this.pendingFile) return;

    if (this.pendingFile) {
      this.uploading = true;
      this.chatHttp.uploadAttachment(this.pendingFile).subscribe({
        next: (res) => {
          this.executeSendMessage(res.fileUrl);
          this.pendingFile = null;
          this.uploading = false;
        },
        error: () => {
          alert("Failed to upload file");
          this.uploading = false;
        }
      });
    } else {
      this.executeSendMessage();
    }
  }

  private executeSendMessage(fileUrl?: string) {
    if (!this.selectedContact) return;

    const payload: MedicalChatDto = {
      message: this.newMessage.trim(),
      senderId: this.currentUserId,
      receiverId: this.selectedContact.userId
    };

    if (fileUrl) {
      payload.fileUrl = fileUrl;
      if (!payload.message) payload.message = "🖼️ Image Attachment";
    }

    this.chatWs.sendMessage(payload);
    this.newMessage = '';
    
    // Stop typing immediately
    clearTimeout(this.typingTimeout);
    this.chatWs.sendTypingStatus(this.selectedContact.userId, false);
  }

  ngAfterViewChecked() {
    // If manually implementing auto-scroll, can be triggered here
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.chatWs.disconnect();
  }
}
