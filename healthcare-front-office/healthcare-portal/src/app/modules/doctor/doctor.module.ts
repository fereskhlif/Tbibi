import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorRoutingModule } from './doctor-routing.module';
import { DoctorDashboardComponent } from './pages/dashboard/dashboard.component';
import { DoctorProfileComponent } from './pages/profile/profile.component';
import { PatientRecordsComponent } from './pages/patient-records/patient-records.component';
import { TeleconsultationComponent } from './pages/teleconsultation/teleconsultation.component';
import { DiseaseDetectionComponent } from './pages/disease-detection/disease-detection.component';
import { DoctorPrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { AiImageAnalysisComponent } from './pages/ai-image-analysis/ai-image-analysis.component';
import { ChronicDiseaseComponent } from './pages/chronic-disease/chronic-disease.component';
import { CriticalAlertsComponent } from './pages/critical-alerts/critical-alerts.component';
import { DoctorLabResultsComponent } from './pages/lab-results/lab-results.component';

@NgModule({
    declarations: [
        DoctorDashboardComponent, DoctorProfileComponent, PatientRecordsComponent,
        TeleconsultationComponent, DiseaseDetectionComponent, DoctorPrescriptionsComponent,
        AiImageAnalysisComponent, ChronicDiseaseComponent, CriticalAlertsComponent, DoctorLabResultsComponent
    ],
    imports: [CommonModule, FormsModule, DoctorRoutingModule]
})
export class DoctorModule { }
