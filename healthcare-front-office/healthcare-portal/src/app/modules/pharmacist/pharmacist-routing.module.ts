import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacistDashboardComponent } from './pages/dashboard/dashboard.component';
import { PharmacistProfileComponent } from './pages/profile/profile.component';
import { OrderValidationComponent } from './pages/order-validation/order-validation.component';
import { MedicationManagementComponent } from './pages/medication-management/medication-management.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { PrescriptionReceivingComponent } from './pages/prescription-receiving/prescription-receiving.component';
import { DrugAvailabilityComponent } from './pages/drug-availability/drug-availability.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: PharmacistDashboardComponent },
    { path: 'profile', component: PharmacistProfileComponent },
    { path: 'orders', component: OrderValidationComponent },
    { path: 'medications', component: MedicationManagementComponent },
    { path: 'inventory', component: InventoryManagementComponent },
    { path: 'prescriptions', component: PrescriptionReceivingComponent },
    { path: 'availability', component: DrugAvailabilityComponent }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class PharmacistRoutingModule { }
