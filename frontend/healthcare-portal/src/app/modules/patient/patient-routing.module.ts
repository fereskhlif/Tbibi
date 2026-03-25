import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { MedicalRecordsComponent } from './pages/medical-records/medical-records.component';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { PharmacyShopComponent } from './pages/pharmacy-shop/pharmacy-shop.component';
import { AiChatComponent } from './pages/ai-chat/ai-chat.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RemindersComponent } from './pages/reminders/reminders.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { DoctorSchedulesComponent } from './pages/doctor-schedules/doctor-schedules.component';
import { InteractionHistoryComponent } from './pages/interaction-history/interaction-history.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,  // Page d'accueil du module patient
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'appointments',
    component: AppointmentsComponent,
  },
  {
    path: 'medical-records',
    component: MedicalRecordsComponent,
  },
  {
    path: 'prescriptions',
    component: PrescriptionsComponent,
  },
  {
    path: 'lab-results',
    component: LabResultsComponent,
  },
  {
    path: 'pharmacy-shop',
    component: PharmacyShopComponent,
  },
  {
    path: 'ai-chat',
    component: AiChatComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'reminders',
    component: RemindersComponent,
  },
  {
    path: 'payment',
    component: PaymentComponent,
  },
  {
    path: 'doctor-schedules',
    component: DoctorSchedulesComponent,
  },
  {
    path: 'interaction-history',
    component: InteractionHistoryComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }