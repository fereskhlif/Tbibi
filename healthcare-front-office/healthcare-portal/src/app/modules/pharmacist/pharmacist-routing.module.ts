import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacistDashboardComponent } from './pages/dashboard/dashboard.component';
import { PharmacistProfileComponent } from './pages/profile/profile.component';
import { OrderValidationComponent } from './pages/order-validation/order-validation.component';
import { MedicationManagementComponent } from './pages/medication-management/medication-management.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { PrescriptionReceivingComponent } from './pages/prescription-receiving/prescription-receiving.component';
import { DrugAvailabilityComponent } from './pages/drug-availability/drug-availability.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: PharmacistDashboardComponent },
    { path: 'profile', component: PharmacistProfileComponent },
    { path: 'orders', component: OrderManagementComponent },
    { path: 'medications', component: MedicationManagementComponent },
    { path: 'prescriptions', component: PrescriptionReceivingComponent },
    { path: 'availability', component: DrugAvailabilityComponent },
    { path: 'inventory', component: InventoryManagementComponent },
    {
        path: 'forum',
        loadChildren: () => import('../forum/forum.module').then(m => m.ForumModule),
        data: { role: 'PHARMASIS' }
    }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class PharmacistRoutingModule { }
