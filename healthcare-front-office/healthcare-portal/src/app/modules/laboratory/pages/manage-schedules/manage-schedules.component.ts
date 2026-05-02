import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ScheduleSlot {
  scheduleId: number;
  doctorId: number;
  date: string;
  startTime: any;
  isAvailable: boolean;
}

interface UnavailabilityWindow { from: string; to: string; }

const DAYS_OF_WEEK = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

@Component({
  selector: 'app-lab-manage-schedules',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 p-6">
      <div class="max-w-5xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">🧪 Mes Créneaux d'Analyse</h1>
            <p class="text-gray-500 mt-1">Gérez vos disponibilités et types d'analyses proposés</p>
          </div>
          <div class="flex gap-4">
            <div class="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p class="text-2xl font-bold text-purple-600">{{slots.length}}</p>
              <p class="text-xs text-gray-400 mt-0.5">Créneaux</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p class="text-2xl font-bold text-emerald-600">{{availableCount}}</p>
              <p class="text-xs text-gray-400 mt-0.5">Disponibles</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p class="text-2xl font-bold text-orange-500">{{bookedCount}}</p>
              <p class="text-xs text-gray-400 mt-0.5">Réservés</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          <button (click)="activeTab='template'"
            [class]="activeTab==='template' ? 'bg-white text-purple-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'"
            class="px-6 py-2.5 rounded-xl text-sm transition-all">
            ⚙️ Modèle Horaire
          </button>
          <button (click)="activeTab='slots'"
            [class]="activeTab==='slots' ? 'bg-white text-purple-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'"
            class="px-6 py-2.5 rounded-xl text-sm transition-all">
            🗂 Mes Créneaux
          </button>
          <button (click)="activeTab='analyses'"
            [class]="activeTab==='analyses' ? 'bg-white text-purple-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'"
            class="px-6 py-2.5 rounded-xl text-sm transition-all">
            🔬 Types d'Analyses
          </button>
        </div>

        <!-- TAB 1: Work Template -->
        <div *ngIf="activeTab==='template'"
          class="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-8">

          <div>
            <h2 class="text-lg font-bold text-gray-900 mb-1">Modèle Hebdomadaire</h2>
            <p class="text-sm text-gray-500">Définissez vos horaires. Le système génère tous les créneaux jusqu'au <strong>31 décembre {{currentYear}}</strong>.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">🕗 Début</label>
              <input type="time" [(ngModel)]="tpl.workStart"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">🕔 Fin</label>
              <input type="time" [(ngModel)]="tpl.workEnd"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">⏱ Durée analyse (min)</label>
              <input type="number" [(ngModel)]="tpl.consultationMinutes" min="10" max="120" step="5"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">📅 Jours de repos</label>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let d of allDays; let i = index" (click)="toggleRestDay(d)"
                [class]="tpl.restDays.includes(d) ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
                class="px-4 py-2 rounded-xl border text-sm font-medium transition-all">
                {{dayLabels[i]}}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">🚫 Pauses récurrentes</label>
            <div *ngIf="tpl.unavailableWindows.length === 0" class="text-sm text-gray-400 italic mb-3">Aucune pause configurée.</div>
            <div class="space-y-2 mb-3">
              <div *ngFor="let w of tpl.unavailableWindows; let i = index"
                class="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
                <div class="flex items-center gap-2 flex-1">
                  <input type="time" [(ngModel)]="w.from" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32">
                  <span class="text-gray-400">→</span>
                  <input type="time" [(ngModel)]="w.to" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32">
                </div>
                <button (click)="removeWindow(i)" class="text-red-400 hover:text-red-600 text-lg">✕</button>
              </div>
            </div>
            <button (click)="addWindow()" class="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center gap-1">
              <span class="text-lg">+</span> Ajouter pause
            </button>
          </div>

          <div class="flex gap-3 pt-2 border-t border-gray-100">
            <button (click)="generateSlots()" [disabled]="!canGenerate() || generating"
              class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
              <span *ngIf="!generating">🗓 Générer le planning</span>
              <span *ngIf="generating">⏳ Génération…</span>
            </button>
            <button (click)="clearAndGenerate()" [disabled]="!canGenerate() || generating"
              class="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
              <span *ngIf="!generating">🔄 Effacer et régénérer</span>
              <span *ngIf="generating">⏳ En cours…</span>
            </button>
          </div>
          <p *ngIf="tplError" class="text-red-600 text-sm font-medium">⚠️ {{tplError}}</p>
          <p *ngIf="tplSuccess" class="text-emerald-600 text-sm font-medium">✅ {{tplSuccess}}</p>
        </div>

        <!-- TAB 2: My Slots -->
        <div *ngIf="activeTab==='slots'">
          <div *ngIf="loading" class="text-center py-16 text-gray-400">
            <p class="text-4xl mb-2">⏳</p><p>Chargement des créneaux…</p>
          </div>
          <div *ngIf="!loading && slots.length === 0"
            class="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <p class="text-5xl mb-4">📭</p>
            <h3 class="text-xl font-bold text-gray-700 mb-2">Aucun créneau configuré</h3>
            <p class="text-gray-400 text-sm">Allez dans <strong>Modèle Horaire</strong> et cliquez "Générer le planning".</p>
          </div>
          <div *ngIf="!loading && slots.length > 0" class="space-y-4">
            <div *ngFor="let group of groupedSlots" class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div class="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">📆 {{formatDate(group.date)}}</span>
                  <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 ml-2">
                    {{group.slots.length}} créneaux · {{group.availableCount}} disponibles
                  </span>
                </div>
                <button *ngIf="group.availableCount > 0" (click)="clearAvailableSlotsByDate(group.date)"
                  class="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 font-semibold">
                  🗑 Supprimer disponibles
                </button>
              </div>
              <div class="flex flex-wrap gap-2 p-4">
                <div *ngFor="let slot of group.slots"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border"
                  [class]="slot.isAvailable ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-orange-50 border-orange-200 text-orange-700'">
                  <span class="font-semibold">{{formatTime(slot.startTime)}}</span>
                  <span class="text-xs opacity-70">{{slot.isAvailable ? '✓' : 'Réservé'}}</span>
                  <button *ngIf="slot.isAvailable" (click)="deleteSlot(slot)" class="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: Analysis Types -->
        <div *ngIf="activeTab==='analyses'"
          class="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900 mb-1">🔬 Types d'Analyses Proposés</h2>
            <p class="text-sm text-gray-500">Gérez la liste des analyses disponibles dans votre laboratoire. Les patients pourront choisir parmi ces analyses lors de la réservation.</p>
          </div>

          <!-- Add new analysis type -->
          <div class="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex gap-3 items-end">
            <div class="flex-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nom de l'analyse</label>
              <input type="text" [(ngModel)]="newAnalysisName" placeholder="Ex: Bilan sanguin complet, ECG, Radiographie…"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            </div>
            <button (click)="addAnalysisType()"
              [disabled]="!newAnalysisName.trim()"
              class="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
              + Ajouter
            </button>
          </div>

          <!-- List of analysis types -->
          <div *ngIf="analysisTypes.length === 0" class="text-gray-400 text-sm italic text-center py-8">
            Aucun type d'analyse configuré. Ajoutez-en un ci-dessus.
          </div>
          <div *ngIf="analysisTypes.length > 0" class="space-y-2">
            <div *ngFor="let a of analysisTypes; let i = index"
              class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="text-purple-600 text-lg">🔬</span>
                <span class="font-medium text-gray-800">{{a}}</span>
              </div>
              <button (click)="removeAnalysisType(i)"
                class="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                🗑 Supprimer
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-400 italic">Note: Ces types d'analyses sont sauvegardés localement. Contactez votre administrateur pour les configurer en base de données.</p>
        </div>

      </div>
    </div>
  `
})
export class LabManageSchedulesComponent implements OnInit {

  activeTab: 'template' | 'slots' | 'analyses' = 'template';
  currentYear = new Date().getFullYear();

  slots: ScheduleSlot[] = [];
  loading = false;

  tpl = {
    workStart: '07:30',
    workEnd: '17:00',
    consultationMinutes: 30,
    restDays: ['SATURDAY', 'SUNDAY'] as string[],
    unavailableWindows: [] as UnavailabilityWindow[]
  };
  generating = false;
  tplError = '';
  tplSuccess = '';

  allDays = DAYS_OF_WEEK;
  dayLabels = DAY_LABELS;

  // Analysis types — persisted in localStorage keyed by labId
  analysisTypes: string[] = [];
  newAnalysisName = '';

  private readonly base = 'https://app-backend-fbc4d6ghfwfwbwhv.austriaeast-01.azurewebsites.net';
  get labId(): number { return Number(localStorage.getItem('userId') || 0); }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSlots();
    this.loadAnalysisTypes();
  }

  // ─── Analysis Types (localStorage) ─────────────────────────────────────────

  get analysisStorageKey(): string { return `lab_analysis_types_${this.labId}`; }

  loadAnalysisTypes() {
    const stored = localStorage.getItem(this.analysisStorageKey);
    this.analysisTypes = stored ? JSON.parse(stored) : [
      'Bilan sanguin complet', 'Glycémie à jeun', 'ECG', 'Radiographie', 'Échographie',
      'Analyse d\'urine', 'Test COVID-19 / PCR', 'Bilan lipidique', 'Fonction hépatique', 'Fonction rénale'
    ];
    localStorage.setItem(this.analysisStorageKey, JSON.stringify(this.analysisTypes));
  }

  addAnalysisType() {
    if (!this.newAnalysisName.trim()) return;
    if (!this.analysisTypes.includes(this.newAnalysisName.trim())) {
      this.analysisTypes.push(this.newAnalysisName.trim());
      localStorage.setItem(this.analysisStorageKey, JSON.stringify(this.analysisTypes));
    }
    this.newAnalysisName = '';
  }

  removeAnalysisType(i: number) {
    this.analysisTypes.splice(i, 1);
    localStorage.setItem(this.analysisStorageKey, JSON.stringify(this.analysisTypes));
  }

  // ─── Slots ─────────────────────────────────────────────────────────────────

  loadSlots() {
    this.loading = true;
    this.http.get<ScheduleSlot[]>(`${this.base}/api/doctor/schedules/doctor/${this.labId}`)
      .subscribe({ next: d => { this.slots = d; this.loading = false; }, error: () => this.loading = false });
  }

  get availableCount() { return this.slots.filter(s => s.isAvailable).length; }
  get bookedCount()    { return this.slots.filter(s => !s.isAvailable).length; }

  get groupedSlots(): { date: string; slots: ScheduleSlot[]; availableCount: number }[] {
    const map = new Map<string, ScheduleSlot[]>();
    for (const s of this.slots) { const arr = map.get(s.date) ?? []; arr.push(s); map.set(s.date, arr); }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({
        date,
        slots: slots.sort((x, y) => String(x.startTime).localeCompare(String(y.startTime))),
        availableCount: slots.filter(s => s.isAvailable).length
      }));
  }

  deleteSlot(slot: ScheduleSlot) {
    if (!confirm(`Supprimer le créneau du ${this.formatDate(slot.date)} à ${this.formatTime(slot.startTime)} ?`)) return;
    this.http.delete(`${this.base}/api/doctor/schedules/${slot.scheduleId}`).subscribe({
      next: () => { this.slots = this.slots.filter(s => s.scheduleId !== slot.scheduleId); },
      error: () => alert('Échec de la suppression.')
    });
  }

  clearAvailableSlotsByDate(date: string) {
    if (!confirm(`Supprimer tous les créneaux disponibles du ${this.formatDate(date)} ?`)) return;
    this.http.delete(`${this.base}/api/doctor/schedules/doctor/${this.labId}/available/date/${date}`).subscribe({
      next: () => { this.slots = this.slots.filter(s => !(s.date === date && s.isAvailable)); },
      error: () => alert('Échec de la suppression.')
    });
  }

  toggleRestDay(day: string) {
    const idx = this.tpl.restDays.indexOf(day);
    idx === -1 ? this.tpl.restDays.push(day) : this.tpl.restDays.splice(idx, 1);
  }

  addWindow() { this.tpl.unavailableWindows.push({ from: '12:00', to: '13:00' }); }
  removeWindow(i: number) { this.tpl.unavailableWindows.splice(i, 1); }
  canGenerate(): boolean { return !!(this.tpl.workStart && this.tpl.workEnd && this.tpl.consultationMinutes > 0); }

  generateSlots() {
    if (!this.canGenerate()) return;
    this.generating = true; this.tplError = ''; this.tplSuccess = '';
    const body = { doctorId: this.labId, ...this.tpl };
    this.http.post<any[]>(`${this.base}/api/doctor/schedules/generate`, body).subscribe({
      next: (newSlots) => {
        this.generating = false;
        this.tplSuccess = `✅ ${newSlots.length} créneaux générés jusqu'au 31 décembre ${this.currentYear} !`;
        this.activeTab = 'slots'; this.loadSlots();
        setTimeout(() => this.tplSuccess = '', 5000);
      },
      error: (err) => { this.generating = false; this.tplError = err?.error?.message || 'Échec de la génération.'; }
    });
  }

  clearAndGenerate() {
    if (!this.canGenerate()) return;
    if (!confirm('Ceci va supprimer tous vos créneaux disponibles et les régénérer. Continuer ?')) return;
    this.generating = true; this.tplError = ''; this.tplSuccess = '';
    this.http.delete(`${this.base}/api/doctor/schedules/doctor/${this.labId}/available`).subscribe({
      next: () => {
        const body = { doctorId: this.labId, ...this.tpl };
        this.http.post<any[]>(`${this.base}/api/doctor/schedules/generate`, body).subscribe({
          next: (newSlots) => {
            this.generating = false;
            this.tplSuccess = `✅ ${newSlots.length} créneaux régénérés !`;
            this.activeTab = 'slots'; this.loadSlots();
            setTimeout(() => this.tplSuccess = '', 5000);
          },
          error: (err) => { this.generating = false; this.tplError = err?.error?.message || 'Échec de la régénération.'; }
        });
      },
      error: () => { this.generating = false; this.tplError = 'Échec de la suppression des anciens créneaux.'; }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(time: any): string {
    if (!time) return '';
    if (Array.isArray(time)) return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`;
    return String(time).substring(0, 5);
  }
}
