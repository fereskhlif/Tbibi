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
import { ProductDetailsComponent } from './pages/pharmacy-shop/product-details/product-details.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { PatientChronicComponent } from './pages/chronic-monitor/patient-chronic.component';
import { HealthGoalsComponent } from './pages/health-goals/health-goals.component';
import { PatientChatComponent } from './pages/patient-chat/patient-chat.component';
import { MedicineCatalogComponent } from './pages/medicine-catalog/medicine-catalog.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { PharmacyListComponent } from './pages/pharmacy-list/pharmacy-list.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { MedicineDetailsComponent } from './pages/medicine-details/medicine-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'book-appointment', component: BookAppointmentComponent },
  { path: 'doctor-schedules', component: DoctorSchedulesComponent },
  { path: 'medical-records', component: MedicalRecordsComponent },
  { path: 'prescriptions', component: PrescriptionsComponent },
  { path: 'lab-results', component: LabResultsComponent },
  { path: 'ai-chat', component: AiChatComponent },
  { path: 'reminders', component: RemindersComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'interaction-history', component: InteractionHistoryComponent },
  { path: 'chronic-monitor', component: PatientChronicComponent },
  { path: 'health-goals', component: HealthGoalsComponent },
  { path: 'messages', component: PatientChatComponent },
  { path: 'pharmacy-shop', component: PharmacyShopComponent },
  { path: 'pharmacy-shop/product/:id', component: ProductDetailsComponent },
  { path: 'pharmacy-list', component: PharmacyListComponent },
  { path: 'pharmacy/:pharmacyId/medicines', component: MedicineCatalogComponent },
  { path: 'medicine-catalog', component: MedicineCatalogComponent },
  { path: 'medicine/:id', component: MedicineDetailsComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'order-success/:orderId', component: OrderSuccessComponent },
  { path: 'my-orders', component: MyOrdersComponent },
  {
    path: 'forum',
    loadChildren: () => import('../forum/forum.module').then(m => m.ForumModule),
    data: { role: 'PATIENT' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
