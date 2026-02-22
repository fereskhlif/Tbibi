import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientRoutingModule } from './patient-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MedicalRecordsComponent } from './pages/medical-records/medical-records.component';
import { AiChatComponent } from './pages/ai-chat/ai-chat.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorSchedulesComponent } from './pages/doctor-schedules/doctor-schedules.component';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { PharmacyShopComponent } from './pages/pharmacy-shop/pharmacy-shop.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { RemindersComponent } from './pages/reminders/reminders.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { InteractionHistoryComponent } from './pages/interaction-history/interaction-history.component';

import { ProductDetailsComponent } from './pages/pharmacy-shop/product-details/product-details.component';

@NgModule({
    declarations: [
        DashboardComponent,
        ProfileComponent,
        MedicalRecordsComponent,
        AiChatComponent,
        AppointmentsComponent,
        DoctorSchedulesComponent,
        PrescriptionsComponent,
        PharmacyShopComponent,
        ProductDetailsComponent,
        LabResultsComponent,
        RemindersComponent,
        PaymentComponent,
        InteractionHistoryComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PatientRoutingModule,
        SharedModule
    ]
})
export class PatientModule { }
