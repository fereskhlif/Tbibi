import { Component, OnInit } from '@angular/core';
import { UserService, UserProfileDTO } from '../../../../services/user.service';

@Component({
  selector: 'app-pharmacist-profile',
  template: `
    <div class="min-h-screen bg-gray-50/50 pb-12">
      <!-- Cover Banner -->
      <div class="h-32 w-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-sm relative overflow-hidden">
        <!-- Abstract background elements -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
        <div class="absolute bottom-0 left-20 -mb-10 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      <div class="px-6 sm:px-8 max-w-7xl mx-auto -mt-24 relative z-10">

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left Card: Profile Overview & Stats -->
          <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col pt-0 pb-6 relative">

            <!-- Avatar Header (overlapping the banner) -->
            <div class="flex justify-center -mt-16">
              <div class="relative inline-block mb-3">
                <div class="w-32 h-32 bg-blue-50 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                  <span class="text-5xl">💊</span>
                </div>
                <div class="absolute bottom-1 right-3 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>

            <div class="px-8 text-center flex-col flex flex-1">
              <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ profile?.name || currentUserName }}</h2>

              <div class="mt-2 mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full mx-auto">
                <lucide-icon name="shield-check" [size]="14" class="text-blue-600"></lucide-icon>
                <span class="text-sm font-bold text-blue-600 uppercase tracking-widest">Pharmacist</span>
              </div>

              <p class="text-gray-900 font-semibold text-lg">MediPharm Central</p>

              <div class="mt-5 space-y-3 mb-8">
                <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <lucide-icon name="mail" [size]="16" class="text-gray-400"></lucide-icon>
                  <span class="font-medium">{{ profile?.email || '...' }}</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-sm text-gray-500" *ngIf="profile?.adresse">
                  <lucide-icon name="map-pin" [size]="16" class="text-gray-400"></lucide-icon>
                  <span class="font-medium">{{ profile?.adresse }}</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-sm text-gray-500" *ngIf="profile?.gender">
                  <lucide-icon name="user" [size]="16" class="text-gray-400"></lucide-icon>
                  <span class="font-medium capitalize">{{ profile?.gender }}</span>
                </div>
              </div>

              <button class="mb-8 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 group mt-auto">
                <lucide-icon name="edit-3" [size]="18" class="group-hover:rotate-12 transition-transform"></lucide-icon>
                Edit Profile
              </button>

              <!-- Statistics Row -->
              <div class="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 mt-auto">
                <div class="text-center">
                   <p class="text-2xl font-black text-gray-900">24</p>
                   <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Orders</p>
                </div>
                <div class="text-center">
                   <p class="text-2xl font-black text-gray-900">8</p>
                   <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">This Month</p>
                </div>
                <div class="text-center">
                   <p class="text-2xl font-black text-gray-900 flex items-center justify-center gap-1">4.8 <lucide-icon name="star" [size]="18" class="text-yellow-400 fill-yellow-400"></lucide-icon></p>
                   <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rating</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Card: Professional Information & Hours -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-8 flex flex-col pt-12">

            <!-- Information Grid -->
            <div>
              <div class="flex items-center gap-3 mb-8">
                <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 class="text-xl font-bold text-gray-900 tracking-tight">Professional Information</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0 rounded-xl overflow-hidden border border-gray-100 divide-y md:divide-y-0 divide-gray-100 mb-8">

                <!-- Info Item: Pharmacy -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b md:border-r border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="building-2" [size]="20" class="text-blue-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pharmacy</label>
                    <p class="font-semibold text-gray-900 text-lg">MediPharm Central</p>
                  </div>
                </div>

                <!-- Info Item: Pharmacy Address -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="map-pin" [size]="20" class="text-indigo-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Address</label>
                    <p class="font-semibold text-gray-900 text-lg">Tunis Center, Rue de la Liberté</p>
                  </div>
                </div>

                <!-- Info Item: License -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b md:border-r border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="award" [size]="20" class="text-emerald-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">License No.</label>
                    <p class="font-semibold text-gray-900 text-lg">PH-2024-98765</p>
                  </div>
                </div>

                <!-- Info Item: Specialization -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:border-b border-gray-100">
                  <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="stethoscope" [size]="20" class="text-purple-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Specialization</label>
                    <p class="font-semibold text-gray-900 text-lg">Clinical Pharmacy</p>
                  </div>
                </div>

                <!-- Info Item: Education -->
                <div class="p-5 hover:bg-gray-50/80 transition-colors flex gap-4 md:col-span-2">
                  <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="graduation-cap" [size]="20" class="text-amber-600"></lucide-icon>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Education</label>
                    <p class="font-semibold text-gray-900 text-lg">Paris School of Pharmacy</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pharmacy Hours -->
            <div class="mt-auto border-t border-gray-100 pt-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 class="text-xl font-bold text-gray-900 tracking-tight">Pharmacy Hours</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="clock" [size]="20" class="text-blue-600"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mon - Fri</p>
                    <p class="font-semibold text-gray-900 mt-0.5">08:00 - 20:00</p>
                  </div>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="clock" [size]="20" class="text-indigo-600"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saturday</p>
                    <p class="font-semibold text-gray-900 mt-0.5">09:00 - 18:00</p>
                  </div>
                </div>
                <div class="p-4 bg-red-50/30 rounded-xl flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <lucide-icon name="clock" [size]="20" class="text-red-600"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sunday</p>
                    <p class="font-semibold text-red-600 mt-0.5">Closed</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- THIRD ROW: Recent Activity & Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

          <!-- Recent Activity -->
          <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-8">
             <div class="flex items-center gap-3 mb-6">
               <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
               <h3 class="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
             </div>

             <div class="space-y-4">
               <!-- Activity 1 -->
               <div class="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                 <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                   <lucide-icon name="check-circle" [size]="20" class="text-green-600"></lucide-icon>
                 </div>
                 <div>
                   <p class="font-bold text-gray-900 text-sm">Order #12 confirmed</p>
                   <p class="text-xs font-semibold text-gray-400 mt-1">2 hours ago</p>
                 </div>
               </div>

               <!-- Activity 2 -->
               <div class="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                 <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                   <lucide-icon name="arrow-up-circle" [size]="20" class="text-blue-600"></lucide-icon>
                 </div>
                 <div>
                   <p class="font-bold text-gray-900 text-sm">Medicine Doliprane restocked</p>
                   <p class="text-xs font-semibold text-gray-400 mt-1">1 day ago</p>
                 </div>
               </div>

               <!-- Activity 3 -->
               <div class="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                 <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                   <lucide-icon name="truck" [size]="20" class="text-indigo-600"></lucide-icon>
                 </div>
                 <div>
                   <p class="font-bold text-gray-900 text-sm">Order #11 delivered</p>
                   <p class="text-xs font-semibold text-gray-400 mt-1">2 days ago</p>
                 </div>
               </div>
             </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-8">
             <div class="flex items-center gap-3 mb-6">
               <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
               <h3 class="text-xl font-bold text-gray-900 tracking-tight">Quick Actions</h3>
             </div>

             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Action 1 -->
                <button routerLink="/pharmacist/medications" class="p-5 text-left bg-gray-50 hover:bg-blue-50 hover:ring-2 hover:ring-blue-600 ring-inset border border-gray-100 rounded-xl transition-all group shadow-sm hover:shadow-md">
                  <lucide-icon name="plus-circle" [size]="24" class="text-blue-600 mb-3 group-hover:scale-110 transition-transform"></lucide-icon>
                  <h4 class="font-bold text-gray-900">Add Medicine</h4>
                  <p class="text-xs text-gray-500 mt-1">Update inventory</p>
                </button>

                <!-- Action 2 -->
                <button routerLink="/pharmacist/orders" class="p-5 text-left bg-gray-50 hover:bg-blue-50 hover:ring-2 hover:ring-blue-600 ring-inset border border-gray-100 rounded-xl transition-all group shadow-sm hover:shadow-md">
                  <lucide-icon name="clipboard-list" [size]="24" class="text-blue-600 mb-3 group-hover:scale-110 transition-transform"></lucide-icon>
                  <h4 class="font-bold text-gray-900">View Orders</h4>
                  <p class="text-xs text-gray-500 mt-1">Manage process</p>
                </button>

                <!-- Action 3 -->
                <button routerLink="/pharmacist/medications" class="p-5 text-left bg-red-50/50 hover:bg-red-50 hover:ring-2 hover:ring-red-500 ring-inset border border-red-100 rounded-xl transition-all group shadow-sm hover:shadow-md">
                  <lucide-icon name="alert-triangle" [size]="24" class="text-red-500 mb-3 group-hover:scale-110 transition-transform"></lucide-icon>
                  <h4 class="font-bold text-gray-900">Low Stock Alert</h4>
                  <p class="text-xs text-gray-500 mt-1">Check warnings</p>
                </button>

                <!-- Action 4 -->
                <button routerLink="/pharmacist/prescriptions" class="p-5 text-left bg-gray-50 hover:bg-blue-50 hover:ring-2 hover:ring-blue-600 ring-inset border border-gray-100 rounded-xl transition-all group shadow-sm hover:shadow-md">
                  <lucide-icon name="file-text" [size]="24" class="text-blue-600 mb-3 group-hover:scale-110 transition-transform"></lucide-icon>
                  <h4 class="font-bold text-gray-900">View Prescriptions</h4>
                  <p class="text-xs text-gray-500 mt-1">Process requests</p>
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PharmacistProfileComponent implements OnInit {
  currentUserName: string = '';
  profile: UserProfileDTO | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.currentUserName = localStorage.getItem('UserName') || '';
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.currentUserName = data.name;
      },
      error: () => {
        if (!this.currentUserName) this.currentUserName = 'User';
      }
    });
  }
}
