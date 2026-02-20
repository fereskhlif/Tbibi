import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhysiotherapistRoutingModule } from './physiotherapist-routing.module';
import { PhysioDashboardComponent } from './pages/dashboard/dashboard.component';
import { PhysioProfileComponent } from './pages/profile/profile.component';
import { TherapyScheduleComponent } from './pages/therapy-schedule/therapy-schedule.component';
import { PatientProgressComponent } from './pages/patient-progress/patient-progress.component';
import { TreatmentPlanComponent } from './pages/treatment-plan/treatment-plan.component';
import { PatientEvaluationComponent } from './pages/patient-evaluation/patient-evaluation.component';
import { TherapySessionComponent } from './pages/therapy-session/therapy-session.component';

@NgModule({
    declarations: [PhysioDashboardComponent, PhysioProfileComponent, TherapyScheduleComponent, PatientProgressComponent, TreatmentPlanComponent, PatientEvaluationComponent, TherapySessionComponent],
    imports: [CommonModule, FormsModule, PhysiotherapistRoutingModule]
})
export class PhysiotherapistModule { }
