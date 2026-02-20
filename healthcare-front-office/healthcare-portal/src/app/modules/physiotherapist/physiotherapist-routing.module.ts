import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhysioDashboardComponent } from './pages/dashboard/dashboard.component';
import { PhysioProfileComponent } from './pages/profile/profile.component';
import { TherapyScheduleComponent } from './pages/therapy-schedule/therapy-schedule.component';
import { PatientProgressComponent } from './pages/patient-progress/patient-progress.component';
import { TreatmentPlanComponent } from './pages/treatment-plan/treatment-plan.component';
import { PatientEvaluationComponent } from './pages/patient-evaluation/patient-evaluation.component';
import { TherapySessionComponent } from './pages/therapy-session/therapy-session.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: PhysioDashboardComponent },
    { path: 'profile', component: PhysioProfileComponent },
    { path: 'schedule', component: TherapyScheduleComponent },
    { path: 'progress', component: PatientProgressComponent },
    { path: 'treatment-plan', component: TreatmentPlanComponent },
    { path: 'evaluation', component: PatientEvaluationComponent },
    { path: 'session', component: TherapySessionComponent }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class PhysiotherapistRoutingModule { }
