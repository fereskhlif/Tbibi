import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from '../../../modules/patient/services/cart.service';

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
export class MainLayoutComponent implements OnInit {
  role: string = '';
  roleUrlPrefix: string = '';
  currentPage: string = 'dashboard';
  headerTitle: string = 'Dashboard';
  navItems: NavItem[] = [];
  floatingButton: { path: string; bgClass: string; title: string; count: number } | null = null;
  showNotifications = false;
  showProfileDropdown = false;

  private patientNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'My Profile' },
    { path: 'records', icon: 'file-text', label: 'Medical Records' },
    { path: 'chat', icon: 'message-square', label: 'AI Health Assistant' },
    { path: 'appointments', icon: 'calendar', label: 'Appointments' },
    { path: 'doctor-schedules', icon: 'users', label: 'Doctor Schedules' },
    { path: 'prescriptions', icon: 'pill', label: 'Prescriptions' },
    { path: 'pharmacy-list', icon: 'shopping-bag', label: 'Medicine Catalog' },
    { path: 'my-orders', icon: 'package', label: 'My Orders' },
    { path: 'lab-results', icon: 'microscope', label: 'Lab Results' },
    { path: 'reminders', icon: 'clock', label: 'Reminders' },
    { path: 'payment', icon: 'credit-card', label: 'Payment' },
    { path: 'history', icon: 'history', label: 'History' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
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
    { path: 'prescriptions', icon: 'file-text', label: 'Prescription Receiving' },
    { path: 'availability', icon: 'search', label: 'Drug Availability' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  private laboratoryNav: NavItem[] = [
    { path: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Professional Profile' },
    { path: 'samples', icon: 'microscope', label: 'Sample Management' },
    { path: 'results', icon: 'file-text', label: 'Test Results' },
    { path: 'equipment', icon: 'settings', label: 'Equipment Management' },
    { path: 'quality', icon: 'shield-check', label: 'Quality Control' },
    { path: 'forum', icon: 'users', label: 'Community Forum' }
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public cartService: CartService
  ) { }

  ngOnInit() {
    const routeRole = this.route.snapshot.data['role'];
    const storedRole = localStorage.getItem('userRole');
    this.role = routeRole && routeRole !== 'patient' ? routeRole : (storedRole || routeRole || 'patient');
    if (routeRole && routeRole !== 'patient') {
      localStorage.setItem('userRole', routeRole);
    }
    this.setupNavigation();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentPage();
    });
    this.updateCurrentPage();
  }

  // ✅ FIXED: navigateTo is now INSIDE the class
  navigateTo(path: string): void {
    this.router.navigate([`${this.roleUrlPrefix}/${path}`]);
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
    const segments = url.split('/').filter(s => s && s !== this.roleUrlPrefix);
    
    // Default fallback
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
        // If it's a number (ID), use the previous segment
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

  logout() {
    this.router.navigate(['/']);
  }

  static showToast(message: string, type: 'success' | 'error' = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full border-l-4 ${type === 'success' ? 'bg-white border-green-500 text-gray-800' : 'bg-white border-red-500 text-gray-800'
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
}