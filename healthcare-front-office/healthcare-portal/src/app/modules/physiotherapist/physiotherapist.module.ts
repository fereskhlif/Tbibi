import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { PhysiotherapistRoutingModule } from './physiotherapist-routing.module';

import { PhysioDashboardComponent } from './pages/dashboard/dashboard.component';
import { PhysioProfileComponent } from './pages/profile/profile.component';
import { TherapyScheduleComponent } from './pages/therapy-schedule/therapy-schedule.component';
import { PatientProgressComponent } from './pages/patient-progress/patient-progress.component';
import { TreatmentPlanComponent } from './pages/treatment-plan/treatment-plan.component';
import { PatientEvaluationComponent } from './pages/patient-evaluation/patient-evaluation.component';
// ✅ TherapySessionComponent remplacé par la version CRUD
import { TherapySessionComponent } from './pages/therapy-session/therapy-session.component';

@NgModule({
  declarations: [
    PhysioDashboardComponent,
    PhysioProfileComponent,
    TherapyScheduleComponent,
    PatientProgressComponent,
    TreatmentPlanComponent,
    PatientEvaluationComponent,
    TherapySessionComponent, // ✅ Même nom, même chemin — juste le contenu est remplacé
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,           // ✅ Requis pour les services HTTP
    PhysiotherapistRoutingModule
  ]
})
export class PhysiotherapistModule { }