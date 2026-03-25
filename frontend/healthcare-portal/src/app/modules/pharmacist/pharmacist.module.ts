import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/dashboard/dashboard.component';
import { PharmacistProfileComponent } from './pages/profile/profile.component';
import { OrderValidationComponent } from './pages/order-validation/order-validation.component';
import { MedicationManagementComponent } from './pages/medication-management/medication-management.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { PrescriptionReceivingComponent } from './pages/prescription-receiving/prescription-receiving.component';
import { DrugAvailabilityComponent } from './pages/drug-availability/drug-availability.component';

@NgModule({
    declarations: [PharmacistDashboardComponent, PharmacistProfileComponent, OrderValidationComponent, MedicationManagementComponent, InventoryManagementComponent, PrescriptionReceivingComponent, DrugAvailabilityComponent],
    imports: [CommonModule, FormsModule, PharmacistRoutingModule]
})
export class PharmacistModule { }
