import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

import { MedicineCatalogComponent } from './pages/medicine-catalog/medicine-catalog.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { PharmacyListComponent } from './pages/pharmacy-list/pharmacy-list.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'records', component: MedicalRecordsComponent },
    { path: 'chat', component: AiChatComponent },
    { path: 'appointments', component: AppointmentsComponent },
    { path: 'doctor-schedules', component: DoctorSchedulesComponent },
    { path: 'prescriptions', component: PrescriptionsComponent },
    { path: 'pharmacy-list', component: PharmacyListComponent },
    { path: 'medicine-catalog', component: MedicineCatalogComponent },
    { path: 'pharmacy/:pharmacyId/medicines', component: MedicineCatalogComponent },
    { path: 'cart', component: CartPageComponent },
    { path: 'checkout', component: CheckoutPageComponent },
    { path: 'order-success/:orderId', component: OrderSuccessComponent },
    { path: 'my-orders', component: MyOrdersComponent },
    { path: 'pharmacy-shop', component: PharmacyShopComponent },
    { path: 'pharmacy-shop/product/:id', component: ProductDetailsComponent },
    { path: 'lab-results', component: LabResultsComponent },
    { path: 'reminders', component: RemindersComponent },
    { path: 'payment', component: PaymentComponent },
    { path: 'history', component: InteractionHistoryComponent },
    { 
        path: 'forum', 
        loadChildren: () => import('../forum/forum.module').then(m => m.ForumModule),
        data: { role: 'PATIENT', userId: 1, userName: 'Karim Patient', expertCategory: '', title: 'Community Forum' }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PatientRoutingModule { }
