import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MedicineCatalogComponent } from './pages/medicine-catalog/medicine-catalog.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { PharmacyListComponent } from './pages/pharmacy-list/pharmacy-list.component';

import {
    LucideAngularModule,
    ShoppingCart,
    ShoppingBag,
    Package,
    Search,
    SearchX,
    X,
    Trash2,
    Eye,
    Plus,
    MapPin,
    Loader2,
    Check,
    CheckCircle,
    AlertCircle,
    RotateCcw,
    Pencil,
    Image,
    Bell,
    User,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Truck,
    Filter,
    ArrowUpDown,
} from 'lucide-angular';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';

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
        MedicineCatalogComponent,
        MyOrdersComponent,
        PharmacyListComponent,
        LabResultsComponent,
        RemindersComponent,
        PaymentComponent,
        InteractionHistoryComponent,
        CartPageComponent,
        CheckoutPageComponent,
        OrderSuccessComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        PatientRoutingModule,
        SharedModule,
        LucideAngularModule.pick({
            ShoppingCart,
            ShoppingBag,
            Package,
            Search,
            SearchX,
            X,
            Trash2,
            Eye,
            Plus,
            MapPin,
            Loader2,
            Check,
            CheckCircle,
            AlertCircle,
            RotateCcw,
            Pencil,
            Image,
            Bell,
            User,
            ChevronLeft,
            ChevronRight,
            ShieldCheck,
            Truck,
            Filter,
            ArrowUpDown,
        })
    ]
})
export class PatientModule { }