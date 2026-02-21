import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DoctorDashboardComponent },
    { path: 'profile', component: DoctorProfileComponent },
    { path: 'patient-records', component: PatientRecordsComponent },
    { path: 'teleconsultation', component: TeleconsultationComponent },
    { path: 'disease-detection', component: DiseaseDetectionComponent },
    { path: 'prescriptions', component: DoctorPrescriptionsComponent },
    { path: 'ai-analysis', component: AiImageAnalysisComponent },
    { path: 'chronic-disease', component: ChronicDiseaseComponent },
    { path: 'alerts', component: CriticalAlertsComponent },
    { path: 'lab-results', component: DoctorLabResultsComponent }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class DoctorRoutingModule { }
