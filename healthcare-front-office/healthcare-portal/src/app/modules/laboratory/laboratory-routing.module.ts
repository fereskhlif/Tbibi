import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabDashboardComponent } from './pages/dashboard/dashboard.component';
import { LabProfileComponent } from './pages/profile/profile.component';
import { SampleManagementComponent } from './pages/sample-management/sample-management.component';
import { TestResultsComponent } from './pages/test-results/test-results.component';
import { EquipmentManagementComponent } from './pages/equipment-management/equipment-management.component';
import { QualityControlComponent } from './pages/quality-control/quality-control.component';

import { LabPrescriptionsComponent } from './pages/prescriptions/prescriptions.component';

const routes: Routes = [
    { path: 'prescriptions', component: LabPrescriptionsComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LabDashboardComponent },
    { path: 'profile', component: LabProfileComponent },
    { path: 'samples', component: SampleManagementComponent },
    { path: 'results', component: TestResultsComponent },
    { path: 'equipment', component: EquipmentManagementComponent },
    { path: 'quality', component: QualityControlComponent },
    {
        path: 'forum',
        loadChildren: () => import('../forum/forum.module').then(m => m.ForumModule),
        data: { role: 'LAB', userId: 4, userName: 'Lab Staff', expertCategory: 'Ask a Lab', title: 'Lab Results Forum' }
    }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LaboratoryRoutingModule { }
