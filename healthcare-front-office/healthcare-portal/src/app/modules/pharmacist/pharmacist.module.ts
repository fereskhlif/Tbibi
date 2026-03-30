import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/dashboard/dashboard.component';
import { PharmacistProfileComponent } from './pages/profile/profile.component';
import { OrderValidationComponent } from './pages/order-validation/order-validation.component';
import { MedicationManagementComponent } from './pages/medication-management/medication-management.component';
import { PrescriptionReceivingComponent } from './pages/prescription-receiving/prescription-receiving.component';
import { DrugAvailabilityComponent } from './pages/drug-availability/drug-availability.component';
import { SharedModule } from '../../shared/shared.module';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import {
    LucideAngularModule,
    Package,
    CheckCircle,
    XCircle,
    RotateCcw,
    Loader2,
    AlertCircle,
    X,
    Check,
    ShieldCheck,
    Briefcase,
    Mail,
    Phone,
    Edit3,
    Building2,
    MapPin,
    Award,
    Stethoscope,
    GraduationCap,
    Star,
    Clock,
    ArrowUpCircle,
    Truck,
    PlusCircle,
    ClipboardList,
    AlertTriangle,
    FileText,
} from 'lucide-angular';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
    declarations: [
        PharmacistDashboardComponent,
        PharmacistProfileComponent,
        OrderValidationComponent,
        MedicationManagementComponent,
        PrescriptionReceivingComponent,
        DrugAvailabilityComponent,
        OrderManagementComponent,
        InventoryManagementComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        WebcamModule,
        ReactiveFormsModule,
        PharmacistRoutingModule,
        SharedModule,
        LucideAngularModule.pick({
            Package,
            CheckCircle,
            XCircle,
            RotateCcw,
            Loader2,
            AlertCircle,
            X,
            Check,
            ShieldCheck,
            Briefcase,
            Mail,
            Phone,
            Edit3,
            Building2,
            MapPin,
            Award,
            Stethoscope,
            GraduationCap,
            Star,
            Clock,
            ArrowUpCircle,
            Truck,
            PlusCircle,
            ClipboardList,
            AlertTriangle,
            FileText,
        })
    ]
})
export class PharmacistModule { }
