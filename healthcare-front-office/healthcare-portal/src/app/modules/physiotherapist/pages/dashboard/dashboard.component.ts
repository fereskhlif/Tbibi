import { Component, OnInit } from '@angular/core';
import { TherapySessionService } from '../../services/therapy-session.service';
import { TherapySessionResponse, PatientProgressDTO } from '../../models/therapy-session.model';

@Component({
    selector: 'app-physio-dashboard',
    template: `
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Physiotherapy Dashboard</h1>
      <p class="text-gray-600">Welcome back, Dr. {{ physioName }}</p>
    </div>

    <div *ngIf="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xl">{{stat.icon}}</span>
          <span class="text-sm text-gray-500">{{stat.title}}</span>
        </div>
        <p class="text-xl font-bold text-gray-900">{{stat.value}}</p>
        <p class="text-sm text-gray-500 mt-1">{{stat.subtitle}}</p>
      </div>
    </div>

    <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Today's Sessions</h3>
        <div class="space-y-3">
          <div *ngIf="sessions.length === 0" class="text-center py-8 text-gray-400 italic">
            No sessions scheduled for today
          </div>
          <div *ngFor="let s of sessions" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-purple-50 transition-colors">
            <span class="text-xl">🏃</span>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{s.patient}}</p>
              <p class="text-sm text-gray-500">{{s.type}} • {{s.time}}</p>
            </div>
            <span [class]="'px-2 py-1 text-xs font-bold rounded-full ' + s.statusClass">{{s.status}}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Patient Progress Overview</h3>
        <div class="space-y-4">
          <div *ngIf="progressItems.length === 0" class="text-center py-8 text-gray-400 italic">
            No active patient progress data
          </div>
          <div *ngFor="let p of progressItems" class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-700 font-medium">{{p.patient}}</span>
              <span class="font-bold text-purple-600">{{p.progress}}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full transition-all duration-500" [style.width.%]="p.progress"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class PhysioDashboardComponent implements OnInit {
    loading = true;
    physioId = 0;
    physioName = 'Doctor';

    stats = [
        { icon: '👥', title: 'Active Patients', value: '0', subtitle: 'Patients under care' },
        { icon: '📅', title: "Today's Sessions", value: '0', subtitle: 'Scheduled today' },
        { icon: '📈', title: 'Average Progress', value: '0%', subtitle: 'Across all patients' },
        { icon: '⏰', title: 'Next Session', value: '--:--', subtitle: 'No upcoming sessions' }
    ];

    sessions: any[] = [];
    progressItems: any[] = [];

    constructor(private sessionService: TherapySessionService) {}

    ngOnInit(): void {
        this.physioId = parseInt(localStorage.getItem('userId') || '0', 10);
        this.physioName = localStorage.getItem('UserName') || 'Doctor';
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        if (!this.physioId) return;
        this.loading = true;

        this.sessionService.getByPhysiotherapist(this.physioId).subscribe({
            next: (data: TherapySessionResponse[]) => {
                this.processSessions(data);
                this.loadProgressData();
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    private loadProgressData(): void {
        this.sessionService.getPatientProgressByPhysiotherapist(this.physioId).subscribe({
            next: (data: PatientProgressDTO[]) => {
                this.processProgress(data);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    private processSessions(data: TherapySessionResponse[]): void {
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions = data.filter(s => s.scheduledDate === todayStr);

        this.sessions = todaySessions.map(s => ({
            patient: s.patientFullName,
            type: s.therapyType || 'General Therapy',
            time: this.formatTime(s.startTime),
            status: s.status,
            statusClass: this.getStatusClass(s.status)
        }));

        // Update stats
        this.stats[1].value = todaySessions.length.toString();
        const completedCount = todaySessions.filter(s => s.status === 'COMPLETED').length;
        this.stats[1].subtitle = `${completedCount} completed today`;

        // Find next session
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        const upcoming = todaySessions
            .filter(s => (s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && s.startTime > currentTime)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

        if (upcoming) {
            this.stats[3].value = this.formatTime(upcoming.startTime);
            this.stats[3].subtitle = upcoming.patientFullName;
        } else {
            this.stats[3].value = '--:--';
            this.stats[3].subtitle = 'No more sessions';
        }
    }

    private processProgress(data: PatientProgressDTO[]): void {
        this.progressItems = data.slice(0, 5).map(p => ({
            patient: p.patientName,
            progress: Math.round(p.progressPercentage || 0)
        }));

        // Update stats
        this.stats[0].value = data.length.toString();
        const avgProgress = data.length > 0 
            ? Math.round(data.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / data.length)
            : 0;
        this.stats[2].value = `${avgProgress}%`;
    }

    private formatTime(time: any): string {
        if (!time) return '--:--';
        if (Array.isArray(time)) {
          const h = time[0].toString().padStart(2, '0');
          const m = time[1].toString().padStart(2, '0');
          return `${h}:${m}`;
        }
        return time.substring(0, 5);
    }

    private getStatusClass(status: string): string {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }
}
