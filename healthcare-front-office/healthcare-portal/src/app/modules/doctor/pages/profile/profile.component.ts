import { Component, OnInit } from '@angular/core';
import { UserService, UserProfileDTO } from '../../../../services/user.service';

@Component({
  selector: 'app-doctor-profile',
  template: `
    <div class="min-h-screen bg-gray-50/50 pb-12">

      <!-- Loading Skeleton -->
      <ng-container *ngIf="isLoading">
        <div class="h-32 w-full bg-gradient-to-r from-emerald-600 to-teal-700 animate-pulse"></div>
        <div class="px-6 sm:px-8 max-w-7xl mx-auto -mt-16 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-4 animate-pulse">
              <div class="w-28 h-28 bg-gray-200 rounded-full"></div>
              <div class="h-5 bg-gray-200 rounded w-40"></div>
              <div class="h-4 bg-gray-100 rounded w-28"></div>
            </div>
            <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
              <div class="h-4 bg-gray-200 rounded w-48"></div>
              <div class="grid grid-cols-2 gap-4">
                <div class="h-14 bg-gray-100 rounded-xl"></div>
                <div class="h-14 bg-gray-100 rounded-xl"></div>
                <div class="h-14 bg-gray-100 rounded-xl"></div>
                <div class="h-14 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Error State -->
      <div *ngIf="!isLoading && errorMessage" class="max-w-7xl mx-auto p-8">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <span class="text-4xl">⚠️</span>
          <p class="text-red-700 font-semibold mt-3">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Profile Content -->
      <ng-container *ngIf="!isLoading && profile">

        <!-- Cover Banner -->
        <div class="h-32 w-full bg-gradient-to-r from-emerald-600 to-teal-700 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div class="absolute bottom-0 left-20 -mb-10 w-32 h-32 rounded-full bg-white opacity-10"></div>
        </div>

        <div class="px-6 sm:px-8 max-w-7xl mx-auto -mt-24 relative z-10">

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Left Card: Profile Overview -->
            <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col pt-0 pb-6 relative">

              <!-- Avatar -->
              <div class="flex justify-center -mt-16">
                <div class="relative inline-block mb-3">
                  <div class="w-32 h-32 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                    <ng-container *ngIf="profile.profilePicture; else defaultAvatar">
                      <img [src]="profile.profilePicture" alt="Profile" class="w-full h-full object-cover" />
                    </ng-container>
                    <ng-template #defaultAvatar>
                      <span class="text-5xl select-none">👨‍⚕️</span>
                    </ng-template>
                  </div>
                  <div class="absolute bottom-1 right-3 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              <div class="px-8 text-center flex-col flex flex-1">
                <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ profile.name }}</h2>

                <div class="mt-2 mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full mx-auto">
                  <lucide-icon name="stethoscope" [size]="14" class="text-emerald-600"></lucide-icon>
                  <span class="text-sm font-bold text-emerald-600 uppercase tracking-widest">Doctor</span>
                </div>

                <div class="mt-5 space-y-3 mb-8">
                  <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <lucide-icon name="mail" [size]="16" class="text-gray-400"></lucide-icon>
                    <span class="font-medium">{{ profile.email }}</span>
                  </div>
                  <div class="flex items-center justify-center gap-2 text-sm text-gray-500" *ngIf="profile.adresse">
                    <lucide-icon name="map-pin" [size]="16" class="text-gray-400"></lucide-icon>
                    <span class="font-medium">{{ profile.adresse }}</span>
                  </div>
                  <div class="flex items-center justify-center gap-2 text-sm text-gray-500" *ngIf="profile.gender">
                    <lucide-icon name="user" [size]="16" class="text-gray-400"></lucide-icon>
                    <span class="font-medium capitalize">{{ profile.gender }}</span>
                  </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 mt-auto">
                  <div class="text-center">
                    <p class="text-2xl font-black text-gray-900">—</p>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Patients</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-black text-gray-900">—</p>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">This Month</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-black text-gray-900 flex items-center justify-center gap-1">
                      4.9 <lucide-icon name="star" [size]="18" class="text-yellow-400 fill-yellow-400"></lucide-icon>
                    </p>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Card: Professional Information -->
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-8 flex flex-col pt-12">

              <div class="flex items-center gap-3 mb-8">
                <div class="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                <h3 class="text-xl font-bold text-gray-900 tracking-tight">Professional Information</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0 rounded-xl overflow-hidden border border-gray-100 divide-y md:divide-y-0 divide-gray-100 mb-8">

                <!-- Name -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b md:border-r border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="user" [size]="20" class="text-emerald-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                    <p class="font-semibold text-gray-900 text-lg">{{ profile.name }}</p>
                  </div>
                </div>

                <!-- Email -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="mail" [size]="20" class="text-blue-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email</label>
                    <p class="font-semibold text-gray-900 text-lg">{{ profile.email }}</p>
                  </div>
                </div>

                <!-- Gender -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b md:border-r border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="users" [size]="20" class="text-purple-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Gender</label>
                    <p class="font-semibold text-gray-900 text-lg capitalize">{{ profile.gender || '—' }}</p>
                  </div>
                </div>

                <!-- Date of Birth -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="calendar" [size]="20" class="text-amber-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                    <p class="font-semibold text-gray-900 text-lg">{{ profile.dateOfBirth || '—' }}</p>
                  </div>
                </div>

                <!-- Address -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:col-span-2">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="map-pin" [size]="20" class="text-indigo-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Address</label>
                    <p class="font-semibold text-gray-900 text-lg">{{ profile.adresse || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Availability -->
              <div class="border-t border-gray-100 pt-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                  <h3 class="text-xl font-bold text-gray-900 tracking-tight">Weekly Availability</h3>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div *ngFor="let day of availability"
                    class="p-4 rounded-xl text-center border transition-colors"
                    [ngClass]="day.available ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'">
                    <p class="font-bold text-sm" [ngClass]="day.available ? 'text-emerald-700' : 'text-gray-400'">{{ day.day }}</p>
                    <p class="text-xs mt-1" [ngClass]="day.available ? 'text-emerald-600' : 'text-gray-400'">{{ day.hours }}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class DoctorProfileComponent implements OnInit {
  profile: UserProfileDTO | null = null;
  isLoading = true;
  errorMessage = '';

  availability = [
    { day: 'Monday',    hours: '9AM - 5PM', available: true  },
    { day: 'Tuesday',   hours: '9AM - 5PM', available: true  },
    { day: 'Wednesday', hours: '9AM - 1PM', available: true  },
    { day: 'Thursday',  hours: '9AM - 5PM', available: true  },
    { day: 'Friday',    hours: '9AM - 3PM', available: true  },
    { day: 'Saturday',  hours: 'Off',        available: false }
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
