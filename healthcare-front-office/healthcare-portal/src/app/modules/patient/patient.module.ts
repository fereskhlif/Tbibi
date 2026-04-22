import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientRoutingModule } from './patient-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AiChatComponent } from './pages/ai-chat/ai-chat.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { DoctorSchedulesComponent } from './pages/doctor-schedules/doctor-schedules.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { MedicalRecordsComponent } from './pages/medical-records/medical-records.component';
import { PharmacyShopComponent } from './pages/pharmacy-shop/pharmacy-shop.component';
import { ProductDetailsComponent } from './pages/pharmacy-shop/product-details/product-details.component';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { RemindersComponent } from './pages/reminders/reminders.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { InteractionHistoryComponent } from './pages/interaction-history/interaction-history.component';
import { PatientChronicComponent } from './pages/chronic-monitor/patient-chronic.component';
import { HealthGoalsComponent } from './pages/health-goals/health-goals.component';
import { PatientChatComponent } from './pages/patient-chat/patient-chat.component';
import { MedicineCatalogComponent } from './pages/medicine-catalog/medicine-catalog.component';
import { MedicineDetailsComponent } from './pages/medicine-details/medicine-details.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { PharmacyListComponent } from './pages/pharmacy-list/pharmacy-list.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { DiseaseRiskComponent } from './pages/disease-risk/disease-risk.component';

import {
  LucideAngularModule,
  ShoppingCart,
  Pill,
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
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Info,
  ClipboardCheck,
  RefreshCcw,
  History,
  SortAsc,
  Target,
  Lock,
  CreditCard,
  Wallet
} from 'lucide-angular';

@NgModule({
  declarations: [
    DashboardComponent,
    AiChatComponent,
    AppointmentsComponent,
    BookAppointmentComponent,
    DoctorSchedulesComponent,
    LabResultsComponent,
    MedicalRecordsComponent,
    PharmacyShopComponent,
    ProductDetailsComponent,
    PrescriptionsComponent,
    RemindersComponent,
    PaymentComponent,
    ProfileComponent,
    InteractionHistoryComponent,
    PatientChronicComponent,
    HealthGoalsComponent,
    PatientChatComponent,
    MedicineCatalogComponent,
    MedicineDetailsComponent,
    MyOrdersComponent,
    PharmacyListComponent,
    CartPageComponent,
    CheckoutPageComponent,
    OrderSuccessComponent,
    DiseaseRiskComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PatientRoutingModule,
    SharedModule,
    LucideAngularModule.pick({
      ShoppingCart,
      Pill,
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
      ArrowLeft,
      Info,
      Calendar,
      AlertTriangle,
      ClipboardCheck,
      RefreshCcw,
      History,
      SortAsc,
      Target,
      Lock,
      CreditCard,
      Wallet
    })
  ]
})
export class PatientModule { }
