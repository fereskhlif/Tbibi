import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LaboratoryResultResponse, LaboratoryResultRequest } from '../../models/laboratory-result.model';
import { LaboratoryResultService } from '../../services/laboratory-result.service';
import { AuthService } from '../../../patient/services/auth.service';

interface Patient {
  userId: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-laboratory-result-list',
  templateUrl: './laboratory-result-list.component.html',
  styleUrls: ['./laboratory-result-list.component.css']
})
export class LaboratoryResultListComponent implements OnInit {
  results: LaboratoryResultResponse[] = [];
  patients: Patient[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  activeStatus = 'All';   // ← filtre onglets
  activePriority = 'All'; // ✅ NOUVEAU - filtre par priorité
  showUrgentOnly = false; // ✅ NOUVEAU - afficher uniquement les urgences

  showForm = false;
  isEditMode = false;
  isSaving = false;
  editingId: number | null = null;

  statusOptions = ['Draft', 'Pending', 'In Progress', 'Completed', 'Validated'];
  allStatuses = ['All', 'Draft', 'Pending', 'In Progress', 'Completed', 'Validated']; // ← pour le ngFor du template
  
  // ✅ NOUVEAU - Options de priorité
  priorityOptions = ['Normal', 'Urgent', 'Critical'];
  allPriorities = ['All', 'Normal', 'Urgent', 'Critical'];

  formData = {
    testName: '',
    location: '',
    nameLabo: '',
    resultValue: '',
    status: '',
    testDate: '',
    laboratoryUserId: null as number | null,
    patientId: null as number | null,
    prescribedByDoctorId: null as number | null,
    priority: 'Normal' as string, // ✅ NOUVEAU
    requestNotes: '' as string // ✅ NOUVEAU
  };

  private apiUrl = 'http://localhost:8088/api';

  constructor(
    private service: LaboratoryResultService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadPatients();
  }

  loadPatients(): void {
    this.http.get<Patient[]>(`${this.apiUrl}/users/patients`)
      .subscribe({
        next: (data) => {
          this.patients = data;
        },
        error: (err) => console.error('Error loading patients:', err)
      });
  }

  loadAll(): void {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (data: LaboratoryResultResponse[]) => {
        this.results = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load results.';
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: string): void {
    this.activeStatus = status;
  }

  // ✅ NOUVEAU - Filtrer par priorité
  filterByPriority(priority: string): void {
    this.activePriority = priority;
  }

  // ✅ NOUVEAU - Basculer l'affichage des urgences uniquement
  toggleUrgentOnly(): void {
    this.showUrgentOnly = !this.showUrgentOnly;
    // Pas besoin de recharger, le filtrage se fait dans filteredResults
  }

  get filteredResults(): LaboratoryResultResponse[] {
    let list = this.results;

    // ✅ NOUVEAU - Filtre "Urgent Only"
    if (this.showUrgentOnly) {
      list = list.filter(r => 
        r.priority === 'Urgent' || r.priority === 'Critical'
      );
    }

    // Filtre par onglet statut
    if (this.activeStatus !== 'All') {
      list = list.filter(r => r.status === this.activeStatus);
    }

    // ✅ NOUVEAU - Filtre par priorité
    if (this.activePriority !== 'All') {
      list = list.filter(r => r.priority === this.activePriority);
    }

    // Filtre par recherche texte
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter((r: LaboratoryResultResponse) =>
        r.testName?.toLowerCase().includes(t) ||
        r.nameLabo?.toLowerCase().includes(t) ||
        r.laboratoryUserName?.toLowerCase().includes(t) ||
        r.patientName?.toLowerCase().includes(t) ||
        r.prescribedByDoctorName?.toLowerCase().includes(t) ||
        r.status?.toLowerCase().includes(t)
      );
    }

    // ✅ NOUVEAU - Trier par priorité (Critical > Urgent > Normal) puis par date
    return list.sort((a, b) => {
      const priorityOrder = { 'Critical': 3, 'Urgent': 2, 'Normal': 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // Si même priorité, trier par date de demande (plus récent en premier)
      if (a.requestedAt && b.requestedAt) {
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
      
      // Si pas de requestedAt, utiliser testDate
      if (a.testDate && b.testDate) {
        return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
      }
      
      return 0;
    });
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.resetForm();
    // ✅ Automatically set the current user as the laboratory user
    const userId = this.authService.getCurrentUserId();
    console.log('Opening create form - Current user ID:', userId);
    console.log('localStorage userId:', localStorage.getItem('userId'));
    this.formData.laboratoryUserId = userId;
    this.showForm = true;
  }

  openEditForm(result: LaboratoryResultResponse): void {
    this.isEditMode = true;
    this.editingId = result.labId;
    this.formData = {
      testName: result.testName,
      location: result.location,
      nameLabo: result.nameLabo,
      resultValue: result.resultValue,
      status: result.status,
      testDate: result.testDate,
      laboratoryUserId: result.laboratoryUserId,
      patientId: result.patientId ?? null,
      prescribedByDoctorId: result.prescribedByDoctorId ?? null,
      priority: result.priority ?? 'Normal', // ✅ NOUVEAU
      requestNotes: result.requestNotes ?? '' // ✅ NOUVEAU
    };
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.resetForm(); }

  resetForm(): void {
    this.formData = {
      testName: '', location: '', nameLabo: '',
      resultValue: '', status: '', testDate: '',
      laboratoryUserId: null,
      patientId: null,
      prescribedByDoctorId: null,
      priority: 'Normal', // ✅ NOUVEAU
      requestNotes: '' // ✅ NOUVEAU
    };
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.saveResult(false);
  }

  onSaveAsDraft(): void {
    this.saveResult(true);
  }

  private saveResult(isDraft: boolean): void {
    const { testName, location, nameLabo, resultValue, status, testDate, laboratoryUserId } = this.formData;
    
    // ✅ For draft, only require basic info
    if (isDraft) {
      if (!testName || !nameLabo) {
        this.errorMessage = 'Test Name and Lab Name are required to save as draft.';
        return;
      }
      // Set status to Draft
      this.formData.status = 'Draft';
    } else {
      // For final save, require all fields
      if (!testName || !location || !nameLabo || !resultValue || !status || !testDate) {
        this.errorMessage = 'Please fill in all required fields (Test Name, Location, Lab Name, Result Value, Status, Test Date).';
        return;
      }
    }
    
    // ✅ Ensure laboratoryUserId is set (should be automatic, but double-check)
    if (!laboratoryUserId) {
      this.formData.laboratoryUserId = this.authService.getCurrentUserId();
      if (!this.formData.laboratoryUserId) {
        this.errorMessage = 'Session expired. Please log out and log back in to continue.';
        console.error('Unable to get user ID from localStorage or token');
        return;
      }
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload: LaboratoryResultRequest = {
      testName: this.formData.testName,
      location: this.formData.location || 'N/A',  // Default for draft
      nameLabo: this.formData.nameLabo,
      resultValue: this.formData.resultValue || 'Pending',  // Default for draft
      status: this.formData.status,
      testDate: this.formData.testDate || new Date().toISOString().split('T')[0],  // Default to today
      laboratoryUserId: this.formData.laboratoryUserId!,
      patientId: this.formData.patientId ?? undefined,
      prescribedByDoctorId: this.formData.prescribedByDoctorId ?? undefined,
      priority: this.formData.priority,
      requestNotes: this.formData.requestNotes
    };

    const req$ = this.isEditMode && this.editingId
      ? this.service.update(this.editingId, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: (_: LaboratoryResultResponse) => {
        this.successMessage = isDraft 
          ? 'Draft saved successfully!' 
          : (this.isEditMode ? 'Result updated!' : 'Result created!');
        this.isSaving = false;
        this.showForm = false;
        this.loadAll();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Error saving result.';
        this.isSaving = false;
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('Delete this result?')) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Result deleted.';
          this.loadAll();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => { this.errorMessage = 'Error deleting result.'; }
      });
    }
  }

  // ✅ Quick status update without opening full form
  onQuickStatusUpdate(result: LaboratoryResultResponse, newStatus: string): void {
    if (confirm(`Change status from "${result.status}" to "${newStatus}"?`)) {
      this.service.updateStatus(result.labId, newStatus).subscribe({
        next: () => {
          this.successMessage = `Status updated to ${newStatus}`;
          this.loadAll();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Error updating status.';
        }
      });
    }
  }

  // ✅ Get next status in workflow
  getNextStatus(currentStatus: string): string | null {
    const workflow: { [key: string]: string } = {
      'Draft': 'Pending',
      'Pending': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Validated'
    };
    return workflow[currentStatus] || null;
  }

  // ✅ Check if status can be advanced
  canAdvanceStatus(status: string): boolean {
    return this.getNextStatus(status) !== null;
  }

  // ✅ Generate and print report
  onGenerateReport(result: LaboratoryResultResponse): void {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.errorMessage = 'Please allow popups to generate reports';
      return;
    }

    const reportHtml = this.generateReportHtml(result);
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  private generateReportHtml(result: LaboratoryResultResponse): string {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    // Parse result value to check for abnormal values
    const resultLines = result.resultValue?.split('\n') || [];
    const formattedResults = resultLines.map(line => {
      const isAbnormal = line.toLowerCase().includes('high') || 
                        line.toLowerCase().includes('low') || 
                        line.toLowerCase().includes('abnormal');
      return `<div class="${isAbnormal ? 'abnormal' : 'normal'}">${line}</div>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laboratory Report - ${result.testName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #7f8c8d;
            margin: 5px 0;
          }
          .section {
            margin: 25px 0;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
          }
          .section-title {
            font-weight: bold;
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .info-row {
            display: flex;
            margin: 8px 0;
          }
          .info-label {
            font-weight: bold;
            width: 180px;
            color: #555;
          }
          .info-value {
            color: #333;
          }
          .results-box {
            background: white;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            margin: 15px 0;
          }
          .abnormal {
            color: #e74c3c;
            font-weight: bold;
            padding: 5px 0;
          }
          .normal {
            color: #27ae60;
            padding: 5px 0;
          }
          .priority-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .priority-critical { background: #e74c3c; color: white; }
          .priority-urgent { background: #f39c12; color: white; }
          .priority-normal { background: #27ae60; color: white; }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background: #3498db;
            color: white;
          }
          .signature {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
          }
          .signature-line {
            margin-top: 40px;
            border-top: 2px solid #333;
            width: 300px;
            padding-top: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 LABORATORY TEST REPORT</h1>
          <p>${result.nameLabo}</p>
          <p>${result.location || 'Medical Center'}</p>
          <p>Report Generated: ${currentDate}</p>
        </div>

        <div class="section">
          <div class="section-title">📋 Test Information</div>
          <div class="info-row">
            <span class="info-label">Test Name:</span>
            <span class="info-value">${result.testName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Test Date:</span>
            <span class="info-value">${result.testDate || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value"><span class="status-badge">${result.status}</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Priority:</span>
            <span class="info-value"><span class="priority-badge priority-${result.priority?.toLowerCase()}">${result.priority}</span></span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">👤 Patient Information</div>
          <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-value">${result.patientName || 'Not Assigned'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Prescribed By:</span>
            <span class="info-value">${result.prescribedByDoctorName || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🔬 Test Results</div>
          <div class="results-box">
            ${formattedResults || '<div class="normal">No results available</div>'}
          </div>
          ${result.requestNotes ? `
            <div style="margin-top: 15px;">
              <strong>Notes:</strong>
              <div style="padding: 10px; background: white; border-radius: 5px; margin-top: 5px;">
                ${result.requestNotes}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="signature">
          <div class="info-row">
            <span class="info-label">Laboratory Technician:</span>
            <span class="info-value">${result.laboratoryUserName}</span>
          </div>
          <div class="signature-line">
            <strong>Digital Signature</strong><br>
            <small>Electronically signed on ${currentDate}</small>
          </div>
        </div>

        <div class="footer">
          <p>This is an electronically generated report.</p>
          <p>Report ID: LAB-${result.labId} | Generated: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'draft':       return 'chip-gray';
      case 'pending':     return 'chip-yellow';
      case 'in progress': return 'chip-blue';
      case 'completed':   return 'chip-green';
      case 'validated':   return 'chip-purple';
      default:            return 'chip-gray';
    }
  }

  // ✅ NOUVEAU - Classe CSS pour la priorité
  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'priority-critical';
      case 'urgent':   return 'priority-urgent';
      case 'normal':   return 'priority-normal';
      default:         return 'priority-normal';
    }
  }

  // ✅ NOUVEAU - Icône pour la priorité
  getPriorityIcon(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'critical': return '🔴';
      case 'urgent':   return '🟠';
      case 'normal':   return '🟢';
      default:         return '⚪';
    }
  }
}
