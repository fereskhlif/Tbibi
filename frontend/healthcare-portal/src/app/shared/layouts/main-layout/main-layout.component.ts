import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="flex h-screen bg-gray-50 font-sans text-gray-900 relative">
      <!-- Fixed Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col z-30 shrink-0 transition-all duration-300">
        <div class="h-16 flex items-center px-6 border-b border-gray-200">
          <app-logo variant="full"></app-logo>
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <app-nav-button
            *ngFor="let item of navItems"
            [active]="currentPage === item.path"
            [icon]="item.icon"
            (onClick)="navigateTo(item.path)"
          >
            {{item.label}}
          </app-nav-button>
        </nav>

        <div class="p-4 border-t border-gray-200 bg-gray-50/50">
          <div class="flex items-center gap-3 mb-3 px-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {{role.charAt(0).toUpperCase()}}
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-medium text-gray-900 truncate capitalize">{{role}}</p>
              <p class="text-xs text-gray-500 truncate">Online</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 justify-center border border-transparent hover:border-red-100"
          >
            <lucide-icon name="log-out" class="w-4 h-4"></lucide-icon> Logout
          </button>
        </div>
      </aside>

      <!-- Main Column -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Header -->
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold text-gray-800 capitalize">{{currentPage.replace('-', ' ')}}</h2>
          </div>

          <div class="flex items-center gap-4">
             <!-- Notification Bell -->
             <div class="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors" (click)="showNotifications = !showNotifications">
               <lucide-icon name="bell" class="w-6 h-6 text-gray-600"></lucide-icon>
               <span *ngIf="floatingButton" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               
               <!-- Notification Dropdown (Click) -->
               <div *ngIf="showNotifications" class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in" (click)="$event.stopPropagation()">
                 <div class="flex items-center justify-between mb-3">
                   <h3 class="font-semibold text-sm">Notifications</h3>
                   <span class="text-xs text-blue-600 cursor-pointer">Mark all read</span>
                 </div>
                 <div class="space-y-3">
                   <div *ngIf="floatingButton" class="flex gap-3 items-start p-2 rounded-lg bg-blue-50">
                     <span class="text-lg bg-white rounded-full p-1"><lucide-icon name="bell" class="w-4 h-4 text-blue-600"></lucide-icon></span>
                     <div>
                       <p class="text-sm font-medium text-gray-900">{{floatingButton.title}}</p>
                       <p class="text-xs text-gray-500">{{floatingButton.count}} pending items</p>
                       <button (click)="navigateTo(floatingButton.path); showNotifications = false" class="text-xs text-blue-600 font-medium mt-1 hover:underline">View details →</button>
                     </div>
                   </div>
                   <div class="flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                     <span class="text-lg bg-gray-100 rounded-full p-1"><lucide-icon name="settings" class="w-4 h-4 text-gray-600"></lucide-icon></span>
                     <div>
                       <p class="text-sm font-medium text-gray-900">System Update</p>
                       <p class="text-xs text-gray-500">Maintenance scheduled for Sunday</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <div class="h-8 w-px bg-gray-200 mx-1"></div>

             <div class="flex items-center gap-3">
               <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                 {{role.charAt(0).toUpperCase()}}
               </div>
             </div>
          </div>
        </header>

        <!-- Main Content (Scrollable) -->
        <main class="flex-1 overflow-auto bg-gray-50 p-6 relative" id="main-content" (click)="showNotifications = false">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Toast Container (Global) -->
      <div id="toast-container" class="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none"></div>

      <!-- Floating AI Chat Button (Patient only) - Moved to root -->
      <div class="absolute right-8 bottom-8 z-[100]" style="position: absolute; bottom: 2rem; right: 2rem; z-index: 100;" *ngIf="role === 'patient'">
        <button
          (click)="navigateTo('chat')"
          class="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all flex items-center justify-center group active:scale-95"
          title="AI Health Assistant"
        >
          <lucide-icon name="message-square" class="w-7 h-7"></lucide-icon>
            <span class="absolute right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Assistant
          </span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MainLayoutComponent implements OnInit {
  role: string = '';
  roleUrlPrefix: string = '';
  currentPage: string = 'dashboard';
  navItems: NavItem[] = [];
  floatingButton: { path: string; bgClass: string; title: string; count: number } | null = null;
  showNotifications = false;

  private patientNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'My Profile' },
    { path: 'records', icon: 'file-text', label: 'Medical Records' },
    { path: 'chat', icon: 'message-square', label: 'AI Health Assistant' },
    { path: 'appointments', icon: 'calendar', label: 'Appointments' },
    { path: 'doctor-schedules', icon: 'users', label: 'Doctor Schedules' },
    { path: 'prescriptions', icon: 'pill', label: 'Prescriptions' },
    { path: 'pharmacy-shop', icon: 'shopping-bag', label: 'Pharmacy Shop' },
    { path: 'lab-results', icon: 'microscope', label: 'Lab Results' },
    { path: 'reminders', icon: 'clock', label: 'Reminders' },
    { path: 'payment', icon: 'credit-card', label: 'Payment' },
    { path: 'history', icon: 'history', label: 'History' }
  ];

  private doctorNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'patient-records', icon: 'users', label: 'Patient Records' },
    { path: 'teleconsultation', icon: 'video', label: 'Teleconsultation' },
    { path: 'disease-detection', icon: 'search', label: 'Disease Detection' },
    { path: 'prescriptions', icon: 'pill', label: 'Prescriptions' },
    { path: 'ai-analysis', icon: 'activity', label: 'AI Image Analysis' },
    { path: 'chronic-disease', icon: 'activity', label: 'Chronic Disease' },
    { path: 'alerts', icon: 'bell', label: 'Critical Alerts' },
    { path: 'lab-results', icon: 'microscope', label: 'Lab Results' }
  ];

  private physioNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'schedule', icon: 'calendar', label: 'Therapy Schedule' },
    { path: 'progress', icon: 'activity', label: 'Patient Progress' },
    { path: 'treatment-plan', icon: 'file-text', label: 'Treatment Plans' },
    { path: 'evaluation', icon: 'clipboard', label: 'Patient Evaluation' },
    { path: 'session', icon: 'activity', label: 'Therapy Session' }
  ];

  private pharmacistNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'orders', icon: 'shopping-bag', label: 'Order Validation' },
    { path: 'medications', icon: 'pill', label: 'Medication Management' },
    { path: 'inventory', icon: 'clipboard', label: 'Inventory Management' },
    { path: 'prescriptions', icon: 'file-text', label: 'Prescription Receiving' },
    { path: 'availability', icon: 'search', label: 'Drug Availability' }
  ];

  private laboratoryNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'samples', icon: 'microscope', label: 'Sample Management' },
    { path: 'results', icon: 'file-text', label: 'Test Results' },
    { path: 'equipment', icon: 'settings', label: 'Equipment Management' },
    { path: 'quality', icon: 'shield-check', label: 'Quality Control' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    const rawRole = this.route.snapshot.data['role'] || 'patient';
    if (typeof rawRole === 'string' && rawRole.startsWith('ROLE_')) {
      this.role = rawRole.replace(/^ROLE_/, '').toLowerCase();
    } else {
      this.role = rawRole;
    }
    this.setupNavigation();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentPage();
    });
    this.updateCurrentPage();
  }

  private setupNavigation() {
    const rolePrefixMap: Record<string, string> = {
      'patient': 'patient',
      'doctor': 'doctor',
      'physiotherapist': 'physio',
      'pharmacist': 'pharmacist',
      'laboratory': 'laboratory'
    };
    this.roleUrlPrefix = rolePrefixMap[this.role] || this.role;
    switch (this.role) {
      case 'patient':
        this.navItems = this.patientNav;
        this.floatingButton = { path: 'reminders', bgClass: 'bg-blue-600 hover:bg-blue-700', title: 'Reminders', count: 3 };
        break;
      case 'doctor':
        this.navItems = this.doctorNav;
        this.floatingButton = { path: 'alerts', bgClass: 'bg-red-600 hover:bg-red-700', title: 'Critical Alerts', count: 2 };
        break;
      case 'physiotherapist':
        this.navItems = this.physioNav;
        this.floatingButton = { path: 'session', bgClass: 'bg-purple-600 hover:bg-purple-700', title: 'Active Sessions', count: 3 };
        break;
      case 'pharmacist':
        this.navItems = this.pharmacistNav;
        this.floatingButton = { path: 'orders', bgClass: 'bg-red-600 hover:bg-red-700', title: 'Active Orders', count: 3 };
        break;
      case 'laboratory':
        this.navItems = this.laboratoryNav;
        this.floatingButton = { path: 'samples', bgClass: 'bg-cyan-600 hover:bg-cyan-700', title: 'Pending Samples', count: 3 };
        break;
    }
  }

  private updateCurrentPage() {
    const url = this.router.url;
    const segments = url.split('/');
    this.currentPage = segments[segments.length - 1] || 'dashboard';
  }

  navigateTo(page: string) {
    this.currentPage = page;
    this.router.navigate([this.roleUrlPrefix, page]);
  }

  logout() {
    this.router.navigate(['/']);
  }

  // Static helper for simple toasts (in a real app, use a Service)
  static showToast(message: string, type: 'success' | 'error' = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `glass-effect px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full ${type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-800' : 'bg-white border-l-4 border-red-500 text-gray-800'}`;
    toast.innerHTML = `<span class="text-xl">${type === 'success' ? '✅' : '❌'}</span><span class="font-medium">${message}</span>`;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));

    // Remove after 3s
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
