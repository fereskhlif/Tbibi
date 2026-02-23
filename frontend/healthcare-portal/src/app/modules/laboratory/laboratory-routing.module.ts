import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabDashboardComponent } from './pages/dashboard/dashboard.component';
import { LabProfileComponent } from './pages/profile/profile.component';
import { SampleManagementComponent } from './pages/sample-management/sample-management.component';
import { TestResultsComponent } from './pages/test-results/test-results.component';
import { EquipmentManagementComponent } from './pages/equipment-management/equipment-management.component';
import { QualityControlComponent } from './pages/quality-control/quality-control.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LabDashboardComponent },
    { path: 'profile', component: LabProfileComponent },
    { path: 'samples', component: SampleManagementComponent },
    { path: 'results', component: TestResultsComponent },
    { path: 'equipment', component: EquipmentManagementComponent },
    { path: 'quality', component: QualityControlComponent }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LaboratoryRoutingModule { }
