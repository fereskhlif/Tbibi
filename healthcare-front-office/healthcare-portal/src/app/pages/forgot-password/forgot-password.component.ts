import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">

          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span class="text-3xl">🔑</span>
            </div>
            <h1 class="text-gray-900 mb-2">Forgot Password</h1>
            <p class="text-gray-600">Enter your email and we'll send you a reset link</p>
          </div>

          <!-- Success state -->
          <div *ngIf="success" class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">✅</span>
            </div>
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Check your inbox</h2>
            <p class="text-gray-600 text-sm mb-6">
              If an account with that email exists, a password reset link has been sent.<br/>
              The link expires in <strong>1 hour</strong>.
            </p>
            <button (click)="goToLogin()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Back to Login
            </button>
          </div>

          <!-- Form -->
          <form *ngIf="!success" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                [disabled]="loading"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>

            <!-- Error -->
            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              [disabled]="loading || !email"
              class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span *ngIf="!loading">Send Reset Link</span>
              <span *ngIf="loading">Sending...</span>
            </button>

            <div class="text-center">
              <button type="button" (click)="goToLogin()" class="text-sm text-blue-600 hover:text-blue-700">
                ← Back to Login
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
    email = '';
    loading = false;
    success = false;
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        if (!this.email) return;
        this.loading = true;
        this.errorMessage = '';

        this.authService.forgotPassword(this.email).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
            },
            error: (err: any) => {
                this.loading = false;
                if (err.status === 429) {
                    this.errorMessage = 'Too many requests. Please wait before trying again.';
                } else {
                    // Still show success to prevent email enumeration
                    this.success = true;
                }
            }
        });
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
