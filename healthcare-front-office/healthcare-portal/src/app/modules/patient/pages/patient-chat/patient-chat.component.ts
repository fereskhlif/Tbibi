import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-chat',
  template: `
    <div class="p-6 h-full flex flex-col bg-gradient-to-br from-blue-50 to-white">
       <!-- Header with Security Badge -->
       <div class="mb-6">
         <div class="flex items-center gap-3 mb-2">
           <h1 class="text-3xl font-bold text-gray-800">Messages</h1>
           <div class="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
             <span class="text-sm font-semibold text-green-700">HIPAA Compliant</span>
           </div>
         </div>
         <p class="text-gray-600 flex items-center gap-2">
           <span>🔒 Securely communicate with your healthcare providers. All conversations are encrypted.</span>
         </p>
       </div>

       <!-- Chat Interface -->
       <app-chat-interface class="flex-1 rounded-lg overflow-hidden shadow-lg"></app-chat-interface>

       <!-- Security Info Footer -->
       <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-600">
         <strong class="text-blue-700">Privacy Notice:</strong> Your conversations are end-to-end encrypted and HIPAA compliant. 
         Messages are stored securely on our servers and only visible to authorized healthcare providers.
       </div>
    </div>
  `,
  styles: [`
    :host { display: flex; height: 100%; }
    :host::ng-deep { height: 100%; }
  `]
})
export class PatientChatComponent {}
