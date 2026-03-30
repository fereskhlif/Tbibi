import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientRoutingModule } from './patient-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Importez tous vos composants
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AiChatComponent } from './pages/ai-chat/ai-chat.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorSchedulesComponent } from './pages/doctor-schedules/doctor-schedules.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { MedicalRecordsComponent } from './pages/medical-records/medical-records.component';
import { PharmacyShopComponent } from './pages/pharmacy-shop/pharmacy-shop.component';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { RemindersComponent } from './pages/reminders/reminders.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { InteractionHistoryComponent } from './pages/interaction-history/interaction-history.component';
import { ProductDetailsComponent } from './pages/pharmacy-shop/product-details/product-details.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { PatientChronicComponent } from './pages/chronic-monitor/patient-chronic.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AiChatComponent,
    AppointmentsComponent,
    DoctorSchedulesComponent,
    LabResultsComponent,
    MedicalRecordsComponent,
    PharmacyShopComponent,
    PrescriptionsComponent,
    RemindersComponent,
    PaymentComponent,
    ProfileComponent,
    InteractionHistoryComponent,
    ProductDetailsComponent,
    BookAppointmentComponent,
    PatientChronicComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PatientRoutingModule
  ]
})
export class PatientModule { }
