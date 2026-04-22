import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { DoctorNotificationsComponent } from './pages/notifications/notifications.component';
import { DoctorAllAppointmentsComponent } from './pages/all-appointments/all-appointments.component';
import { ManageSchedulesComponent } from './pages/manage-schedules/manage-schedules.component';
import { SharedModule } from '../../shared/shared.module';
import { DoctorChatComponent } from './pages/doctor-chat/doctor-chat.component';
import { RiskSegmentationComponent } from './pages/risk-segmentation/risk-segmentation.component';

@NgModule({
    declarations: [
        DoctorDashboardComponent, DoctorProfileComponent, PatientRecordsComponent,
        TeleconsultationComponent, DiseaseDetectionComponent, DoctorPrescriptionsComponent,
        AiImageAnalysisComponent, ChronicDiseaseComponent, CriticalAlertsComponent,
        DoctorLabResultsComponent, DoctorNotificationsComponent,
        DoctorAllAppointmentsComponent, ManageSchedulesComponent,
        DoctorChatComponent,
        RiskSegmentationComponent
    ],
    imports: [CommonModule, FormsModule, HttpClientModule, DoctorRoutingModule, SharedModule]
})
export class DoctorModule { }

