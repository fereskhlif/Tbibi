import { Component } from '@angular/core';

@Component({
    selector: 'app-graphic-charter',
    template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="mb-12 text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Graphic Charter</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Brand Guidelines & Design System</p>
        </div>

        <!-- Brand Identity -->
        <div class="mb-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Brand Identity</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div><h3 class="font-semibold text-gray-800 mb-2">Mission</h3><p class="text-gray-600">To provide a seamless, secure digital healthcare ecosystem that connects patients with healthcare professionals.</p></div>
            <div><h3 class="font-semibold text-gray-800 mb-2">Vision</h3><p class="text-gray-600">To become the leading comprehensive healthcare platform that makes quality healthcare accessible to everyone.</p></div>
            <div><h3 class="font-semibold text-gray-800 mb-2">Core Values</h3><p class="text-gray-600">Innovation, Security, Accessibility, Professional Excellence, Patient-Centric Care.</p></div>
          </div>
        </div>

        <!-- Color Palette -->
        <div class="mb-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>
          <!-- Primary Colors -->
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Primary Colors</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div *ngFor="let c of primaryColors" class="group cursor-pointer" (click)="copyColor(c.hex, c.name)">
              <div [style.background-color]="c.hex" class="w-full h-20 rounded-lg mb-2 shadow-sm group-hover:scale-105 transition-transform"></div>
              <p class="text-sm font-medium text-gray-900">{{c.name}}</p>
              <p class="text-xs text-gray-500">{{c.hex}}</p>
            </div>
          </div>
          <!-- Secondary Colors -->
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Secondary Colors</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div *ngFor="let c of secondaryColors" class="group cursor-pointer" (click)="copyColor(c.hex, c.name)">
              <div [style.background-color]="c.hex" class="w-full h-20 rounded-lg mb-2 shadow-sm group-hover:scale-105 transition-transform"></div>
              <p class="text-sm font-medium text-gray-900">{{c.name}}</p>
              <p class="text-xs text-gray-500">{{c.hex}}</p>
            </div>
          </div>
          <!-- Gray Scale -->
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Gray Scale</h3>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div *ngFor="let c of grayColors" class="group cursor-pointer" (click)="copyColor(c.hex, c.name)">
              <div [style.background-color]="c.hex" class="w-full h-16 rounded-lg mb-2 shadow-sm"></div>
              <p class="text-xs font-medium text-gray-900">{{c.name}}</p>
              <p class="text-xs text-gray-500">{{c.hex}}</p>
            </div>
          </div>
        </div>

        <!-- Typography -->
        <div class="mb-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <span class="text-xs text-gray-500">H1 - 36px Bold</span>
              <h1 class="text-4xl font-bold text-gray-900">Healthcare for Everyone</h1>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <span class="text-xs text-gray-500">H2 - 30px Bold</span>
              <h2 class="text-3xl font-bold text-gray-900">Our Services</h2>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <span class="text-xs text-gray-500">H3 - 24px Semibold</span>
              <h3 class="text-2xl font-semibold text-gray-900">Patient Dashboard</h3>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <span class="text-xs text-gray-500">Body - 16px Regular</span>
              <p class="text-base text-gray-700">This is the standard body text used throughout the application for paragraphs and general content.</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Small - 14px Regular</span>
              <p class="text-sm text-gray-600">Small text for captions, labels, and supplementary information.</p>
            </div>
          </div>
        </div>

        <!-- Logo Guidelines -->
        <div class="mb-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Logo Guidelines</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-8 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
              <app-logo variant="full"></app-logo>
            </div>
            <div class="p-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <div class="text-2xl font-bold text-white">Medicare AI</div>
            </div>
            <div class="p-8 bg-gray-900 rounded-xl flex items-center justify-center">
              <app-logo variant="compact"></app-logo>
            </div>
          </div>
        </div>

        <!-- Role Color System -->
        <div class="mb-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">User Role Color System</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div *ngFor="let role of roleColors" class="text-center p-6 rounded-xl" [style.background-color]="role.bg">
              <div class="text-3xl mb-3">{{role.icon}}</div>
              <h4 class="font-semibold mb-1" [style.color]="role.textColor">{{role.role}}</h4>
              <p class="text-xs" [style.color]="role.mutedColor">{{role.color}}</p>
            </div>
          </div>
        </div>

        <!-- Spacing & Layout -->
        <div class="mb-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Spacing Guidelines</h2>
          <div class="space-y-4">
            <div *ngFor="let s of spacings" class="flex items-center gap-4">
              <span class="text-sm text-gray-700 w-20">{{s.label}}</span>
              <div class="bg-blue-500 rounded" [style.width]="s.width" [style.height.px]="8"></div>
              <span class="text-xs text-gray-500">{{s.value}}</span>
            </div>
          </div>
        </div>

        <!-- Copied indicator -->
        <div *ngIf="copiedColor" class="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Copied: {{copiedColor}}
        </div>
      </div>
    </div>
  `
})
export class GraphicCharterComponent {
    copiedColor: string | null = null;

    primaryColors = [
        { name: 'Primary Blue', hex: '#3B82F6' },
        { name: 'Primary Dark', hex: '#2563EB' },
        { name: 'Primary Light', hex: '#93C5FD' },
        { name: 'Primary BG', hex: '#EFF6FF' }
    ];

    secondaryColors = [
        { name: 'Success', hex: '#22C55E' },
        { name: 'Warning', hex: '#F97316' },
        { name: 'Error', hex: '#EF4444' },
        { name: 'Info', hex: '#06B6D4' }
    ];

    grayColors = [
        { name: 'Gray 50', hex: '#F9FAFB' },
        { name: 'Gray 100', hex: '#F3F4F6' },
        { name: 'Gray 200', hex: '#E5E7EB' },
        { name: 'Gray 500', hex: '#6B7280' },
        { name: 'Gray 800', hex: '#1F2937' },
        { name: 'Gray 900', hex: '#111827' }
    ];

    roleColors = [
        { role: 'Patient', icon: '👤', color: 'Blue', bg: '#EFF6FF', textColor: '#2563EB', mutedColor: '#60A5FA' },
        { role: 'Doctor', icon: '👨‍⚕️', color: 'Green', bg: '#F0FDF4', textColor: '#16A34A', mutedColor: '#4ADE80' },
        { role: 'Physio', icon: '🧑‍⚕️', color: 'Purple', bg: '#FAF5FF', textColor: '#9333EA', mutedColor: '#C084FC' },
        { role: 'Pharmacist', icon: '💊', color: 'Orange', bg: '#FFF7ED', textColor: '#EA580C', mutedColor: '#FB923C' },
        { role: 'Laboratory', icon: '🔬', color: 'Cyan', bg: '#ECFEFF', textColor: '#0891B2', mutedColor: '#22D3EE' }
    ];

    spacings = [
        { label: '4px', value: '0.25rem', width: '16px' },
        { label: '8px', value: '0.5rem', width: '32px' },
        { label: '16px', value: '1rem', width: '64px' },
        { label: '24px', value: '1.5rem', width: '96px' },
        { label: '32px', value: '2rem', width: '128px' },
        { label: '48px', value: '3rem', width: '192px' }
    ];

    copyColor(hex: string, name: string) {
        navigator.clipboard.writeText(hex);
        this.copiedColor = name + ' (' + hex + ')';
        setTimeout(() => this.copiedColor = null, 2000);
    }
}
