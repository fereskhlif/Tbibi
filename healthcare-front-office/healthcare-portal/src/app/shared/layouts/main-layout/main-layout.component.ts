import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from '../../../modules/patient/services/cart.service';
import { WebSocketService } from '../../../services/websocket.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationResponse } from '../../../models/notification.model';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styles: [`
    .animate-fade-in { animation: fadeIn 0.15s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUserId = 1; // Hardcoded for testing
  role: string = '';
  roleUrlPrefix: string = '';
  currentPage: string = 'dashboard';
  headerTitle: string = 'Dashboard';
  navItems: NavItem[] = [];
  floatingButton: { path: string; bgClass: string; title: string; count: number } | null = null;
  showNotifications = false;
  showProfileDropdown = false;
  justReceivedNotification = false;
  private lastUnreadCount = 0;

  private patientNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'My Profile' },
    { path: 'medical-records', icon: 'file-text', label: 'Medical Records' },
    { path: 'ai-chat', icon: 'message-square', label: 'AI Health Assistant' },
    { path: 'messages', icon: 'user', label: 'My Doctor Chat' },
    { path: 'book-appointment', icon: 'calendar', label: 'Book Appointment' },
    { path: 'appointments', icon: 'calendar', label: 'Appointments' },
    { path: 'doctor-schedules', icon: 'users', label: 'Doctor Schedules' },
    { path: 'prescriptions', icon: 'pill', label: 'Prescriptions' },
    { path: 'pharmacy-list', icon: 'shopping-bag', label: 'Pharmacy Stores' },
    { path: 'my-orders', icon: 'package', label: 'My Orders' },
    { path: 'lab-results', icon: 'microscope', label: 'Lab Results' },
    { path: 'reminders', icon: 'clock', label: 'Reminders' },
    { path: 'payment', icon: 'credit-card', label: 'Payment' },
    { path: 'interaction-history', icon: 'history', label: 'History' },
    { path: 'chronic-monitor', icon: 'activity', label: 'Health Monitor' },
    { path: 'health-goals', icon: 'target', label: 'Health Goals' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  private doctorNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'all-appointments', icon: 'calendar', label: 'All Appointments' },
    { path: 'manage-schedules', icon: 'clock', label: 'Manage Schedules' },
    { path: 'notifications', icon: 'bell', label: 'Notifications' },
    { path: 'messages', icon: 'message-square', label: 'Patient Chat' },
    { path: 'patient-records', icon: 'users', label: 'Patient Records' },
    { path: 'teleconsultation', icon: 'video', label: 'Teleconsultation' },
    { path: 'disease-detection', icon: 'search', label: 'Disease Detection' },
    { path: 'prescriptions', icon: 'pill', label: 'Prescriptions' },
    { path: 'ai-analysis', icon: 'activity', label: 'AI Image Analysis' },
    { path: 'chronic-disease', icon: 'activity', label: 'Chronic Disease' },
    { path: 'alerts', icon: 'bell', label: 'Critical Alerts' },
    { path: 'lab-results', icon: 'microscope', label: 'Lab Results' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  private physioNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'schedule', icon: 'calendar', label: 'Therapy Schedule' },
    { path: 'progress', icon: 'activity', label: 'Patient Progress' },
    { path: 'treatment-plan', icon: 'file-text', label: 'Treatment Plans' },
    { path: 'evaluation', icon: 'clipboard', label: 'Patient Evaluation' },
    { path: 'session', icon: 'activity', label: 'Therapy Session' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  private pharmacistNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'orders', icon: 'shopping-bag', label: 'Order Validation' },
    { path: 'medications', icon: 'pill', label: 'Medication Management' },
    { path: 'inventory', icon: 'clipboard', label: 'Inventory Management' },
    { path: 'prescriptions', icon: 'file-text', label: 'Prescription Receiving' },
    { path: 'availability', icon: 'search', label: 'Drug Availability' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  private laboratoryNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'prescriptions', icon: 'flask-conical', label: 'Prescriptions reçues' },
    { path: 'samples', icon: 'microscope', label: 'Sample Management' },
    { path: 'results', icon: 'file-text', label: 'Test Results' },
    { path: 'equipment', icon: 'settings', label: 'Equipment Management' },
    { path: 'quality', icon: 'shield-check', label: 'Quality Control' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  private adminNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard Admin' },
    { path: 'users', icon: 'users', label: 'Utilisateurs' },
    { path: 'approvals', icon: 'check-circle', label: 'Approbations' },
    { path: 'monitoring', icon: 'activity', label: 'Monitoring' },
    { path: 'settings', icon: 'settings', label: 'Configuration' }
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public cartService: CartService,
    private wsService: WebSocketService,
    public notificationService: NotificationService
  ) { }

  ngOnInit() {
    const rawRole = this.route.snapshot.data['role'];
    const storedRole = localStorage.getItem('userRole');
    const roleMap: Record<string, string> = {
      'PATIENT': 'patient',
      'DOCTEUR': 'doctor',
      'DOCTOR': 'doctor',
      'KINE': 'physiotherapist',
      'PHYSIOTHERAPIST': 'physiotherapist',
      'PHARMASIS': 'pharmacist',
      'PHARMACIST': 'pharmacist',
      'LABORATORY': 'laboratory',
      'ADMIN': 'admin'
    };

    let key = rawRole || storedRole || 'patient';
    if (typeof key === 'string' && key.startsWith('ROLE_')) key = key.replace(/^ROLE_/, '');
    if (typeof key === 'string') {
      const up = key.toUpperCase();
      this.role = roleMap[up] || key.toLowerCase();
    } else {
      this.role = 'patient';
    }

    if (rawRole) localStorage.setItem('userRole', this.role);

    this.setupNavigation();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentPage();
    });
    this.updateCurrentPage();

    // Connect WebSocket & initialize notifications
    this.wsService.connect();
    this.notificationService.init(this.currentUserId);

    // Watch for unread count changes to trigger "Pop" animation
    this.notificationService.unreadCount$.subscribe(count => {
      if (count > this.lastUnreadCount) {
        this.justReceivedNotification = true;
        setTimeout(() => this.justReceivedNotification = false, 1000);
      }
      this.lastUnreadCount = count;
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([`${this.roleUrlPrefix}/${path}`]);
  }

  private setupNavigation() {
    const rolePrefixMap: Record<string, string> = {
      'patient': 'patient',
      'doctor': 'doctor',
      'physiotherapist': 'physio',
      'pharmacist': 'pharmacist',
      'laboratory': 'laboratory',
      'admin': 'admin'
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
      case 'admin':
        this.navItems = this.adminNav;
        this.floatingButton = { path: 'approvals', bgClass: 'bg-emerald-600 hover:bg-emerald-700', title: 'En Attente', count: 5 };
        break;
    }
  }

  private updateCurrentPage() {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s && s !== this.roleUrlPrefix);

    this.currentPage = segments[0] || 'dashboard';

    // Special handling for module highlighting
    if (url.includes('/forum')) {
      this.currentPage = 'forum';
    } else if (url.includes('/cart')) {
      this.currentPage = 'cart';
    }

    // Set Header Title (avoiding IDs or cryptic segments)
    if (url.includes('/forum/post/')) {
      this.headerTitle = 'Forum Discussion';
    } else if (url.includes('/forum')) {
      this.headerTitle = 'Community Forum';
    } else {
      const rawTitle = segments[segments.length - 1] || 'Dashboard';
      if (!isNaN(Number(rawTitle)) && segments.length > 1) {
        this.headerTitle = segments[segments.length - 2].replace(/-/g, ' ');
      } else {
        this.headerTitle = rawTitle.replace(/-/g, ' ');
      }
    }
  }

  openCart() {
    if (this.router.url.includes('/patient/medicine-catalog')) {
      this.cartService.openCart();
    } else {
      this.router.navigate(['patient/medicine-catalog']).then(() => {
        setTimeout(() => this.cartService.openCart(), 100);
      });
    }
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  onNotificationClick(n: NotificationResponse): void {
    this.notificationService.onNotificationClick(n);
    this.showNotifications = false;
    if (n.redirectUrl) {
      this.router.navigateByUrl(n.redirectUrl);
    }
  }

  logout() {
    this.wsService.disconnect();
    this.router.navigate(['/']);
  }

  static showToast(message: string, type: 'success' | 'error' = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full border-l-4 ${
      type === 'success' ? 'bg-white border-green-500 text-gray-800' : 'bg-white border-red-500 text-gray-800'
    }`;
    toast.style.maxWidth = '280px';
    toast.style.pointerEvents = 'auto';
    toast.innerHTML = `
      <span class="text-xl shrink-0">${type === 'success' ? '✅' : '❌'}</span>
      <span class="font-medium text-xs leading-tight">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
    });

    const hideToast = () => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        if (toast.parentNode === container) toast.remove();
      }, 300);
    };

    setTimeout(hideToast, 3000);
  }

  timeAgoNotification(dateStr: string): string {
    const date = new Date(dateStr), now = new Date();
    const s = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
