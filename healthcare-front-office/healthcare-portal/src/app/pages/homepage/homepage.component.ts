import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-homepage',
    template: `
    <div class="min-h-screen bg-white" *ngIf="!showGraphicCharter">
      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <app-logo></app-logo>
            <div class="hidden md:flex items-center gap-8">
              <a href="#home" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#services" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Services</a>
              <a href="#features" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">About</a>
            </div>
            <div class="flex items-center gap-3">
              <button (click)="goToLogin()" class="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Log In</button>
              <button (click)="goToSignup()" class="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section id="home" class="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                🎉 Welcome to the Future of Healthcare
              </div>
              <h1 class="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Your Complete Healthcare Solution in One Platform
              </h1>
              <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect patients, doctors, physiotherapists, pharmacists, and laboratories in a seamless,
                secure digital healthcare ecosystem. Access world-class medical services from anywhere.
              </p>
              <div class="flex flex-wrap gap-4">
                <button (click)="goToSignup()" class="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2">
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
                <button (click)="scrollToServices()" class="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
                  Explore Services
                </button>
              </div>
            </div>
            <div class="relative">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-4">
                  <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h3 class="font-semibold text-gray-900 mb-2">Patient Care</h3>
                    <p class="text-sm text-gray-600">Comprehensive health management</p>
                  </div>
                  <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="m12 2 4.5 4.5"/><path d="m4.5 6.5 6 6"/><circle cx="12" cy="12" r="0"/><path d="M18 22a6 6 0 0 0-6-6"/><path d="M6 2v4"/><path d="M2 6h4"/></svg>
                    </div>
                    <h3 class="font-semibold text-gray-900 mb-2">Medical Services</h3>
                    <p class="text-sm text-gray-600">Expert consultation & diagnosis</p>
                  </div>
                </div>
                <div class="space-y-4 pt-8">
                  <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                    </div>
                    <h3 class="font-semibold text-gray-900 mb-2">Therapy</h3>
                    <p class="text-sm text-gray-600">Professional physiotherapy</p>
                  </div>
                  <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                    </div>
                    <h3 class="font-semibold text-gray-900 mb-2">Pharmacy</h3>
                    <p class="text-sm text-gray-600">Medication management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services" class="py-20 px-6 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Healthcare Services</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Five specialized portals designed for different healthcare professionals and patients
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let service of services; let i = index"
                 class="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all group">
              <div class="w-full h-64 overflow-hidden">
                <img [src]="service.image" [alt]="service.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div class="p-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">{{service.title}}</h3>
                <p class="text-gray-600 leading-relaxed">{{service.description}}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-4xl font-bold text-gray-900 mb-6">
                Everything You Need for Modern Healthcare
              </h2>
              <p class="text-lg text-gray-600 mb-8">
                Our platform provides cutting-edge tools and features to streamline healthcare delivery
                and improve patient outcomes.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div *ngFor="let feature of features" class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  </div>
                  <span class="text-gray-700 font-medium">{{feature}}</span>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Why Choose MediCare?</h3>
              <div class="space-y-6">
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-2xl">🔒</span></div>
                  <div><h4 class="font-semibold text-gray-900 mb-2">Secure & Private</h4><p class="text-sm text-gray-600">End-to-end encryption for all your medical data</p></div>
                </div>
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-2xl">⚡</span></div>
                  <div><h4 class="font-semibold text-gray-900 mb-2">Fast & Reliable</h4><p class="text-sm text-gray-600">Quick access to healthcare services 24/7</p></div>
                </div>
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-2xl">🤝</span></div>
                  <div><h4 class="font-semibold text-gray-900 mb-2">Trusted by Professionals</h4><p class="text-sm text-gray-600">Used by leading healthcare providers worldwide</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about" class="py-20 px-6 bg-white">
        <div class="max-w-7xl mx-auto text-center">
          <h2 class="text-4xl font-bold text-gray-900 mb-6">About MediCare Portal</h2>
          <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            MediCare Portal is a comprehensive digital healthcare solution that connects patients with
            healthcare professionals across multiple specialties. Our platform facilitates seamless
            communication, efficient record management, and superior patient care through innovative
            technology and user-friendly interfaces.
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div><div class="text-4xl font-bold text-blue-600 mb-2">10K+</div><div class="text-sm text-gray-600">Active Users</div></div>
            <div><div class="text-4xl font-bold text-green-600 mb-2">500+</div><div class="text-sm text-gray-600">Healthcare Providers</div></div>
            <div><div class="text-4xl font-bold text-purple-600 mb-2">50K+</div><div class="text-sm text-gray-600">Consultations</div></div>
            <div><div class="text-4xl font-bold text-red-600 mb-2">99.9%</div><div class="text-sm text-gray-600">Uptime</div></div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl font-bold text-white mb-6">Ready to Transform Your Healthcare Experience?</h2>
          <p class="text-xl text-blue-100 mb-8">Join thousands of users who trust MediCare Portal for their healthcare needs</p>
          <div class="flex flex-wrap gap-4 justify-center">
            <button (click)="goToSignup()" class="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2">
              Sign Up Now
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button (click)="goToLogin()" class="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-medium">Log In</button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-300 py-12 px-6">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span class="text-xl">🏥</span></div>
                <span class="font-bold text-white">MediCare</span>
              </div>
              <p class="text-sm text-gray-400">Your trusted partner in comprehensive healthcare solutions.</p>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-4">Services</h3>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="hover:text-white transition-colors">Patient Portal</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Doctor Portal</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Physiotherapist</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Pharmacist</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Laboratory</a></li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-4">Support</h3>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
                <li><button (click)="showGraphicCharter = true" class="hover:text-white transition-colors text-left">📘 Graphic Charter</button></li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-4">Contact</h3>
              <ul class="space-y-2 text-sm">
                <li>📧 support&#64;medicare.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 123 Healthcare Ave, Medical City</li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 MediCare Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>

    <!-- Graphic Charter Overlay -->
    <div *ngIf="showGraphicCharter">
      <button (click)="showGraphicCharter = false" class="fixed top-6 right-6 z-50 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium">
        ← Back to Homepage
      </button>
      <app-graphic-charter></app-graphic-charter>
    </div>
  `
})
export class HomepageComponent {
    showGraphicCharter = false;

    services = [
        { image: 'assets/images/f3db461dc053e42116cd1712f739eecba2d07786.png', title: 'Patient Services', description: 'Access your medical records, book appointments, consult with doctors, and manage prescriptions.' },
        { image: 'assets/images/a4a80910c4719bf4835892e39f9960b594d43665.png', title: 'Doctor Services', description: 'Manage patient records, conduct teleconsultations, analyze medical images, and prescribe treatments.' },
        { image: 'assets/images/fcf0016f1b87a0ddab93abe797d3ec3cb0b1c5eb.png', title: 'Physiotherapist Services', description: 'Schedule therapy sessions, track patient progress, create treatment plans, and conduct evaluations.' },
        { image: 'assets/images/3579f061eabeebf030a23e86a338f84183954e0c.png', title: 'Pharmacist Services', description: 'Validate prescriptions, manage inventory, update medications, and ensure drug availability.' },
        { image: 'assets/images/5459d1baa8f86d59332e48dfa299acb6e4b072a7.png', title: 'Laboratory Services', description: 'Process test requests, generate lab reports, enter test results, and manage test status.' }
    ];

    features = [
        'AI-Powered Health Assistant', 'Secure Teleconsultation', 'Real-time Medical Records',
        'Prescription Management', 'Lab Test Integration', 'Online Pharmacy Shop',
        'Appointment Scheduling', 'Treatment Progress Tracking'
    ];

    constructor(private router: Router) { }

    goToLogin() { this.router.navigate(['/login']); }
    goToSignup() { this.router.navigate(['/signup']); }
    scrollToServices() {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
}
