import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Composants existants
import { LabDashboardComponent } from './pages/dashboard/dashboard.component';
import { LabProfileComponent } from './pages/profile/profile.component';
import { SampleManagementComponent } from './pages/sample-management/sample-management.component';
import { TestResultsComponent } from './pages/test-results/test-results.component';
import { EquipmentManagementComponent } from './pages/equipment-management/equipment-management.component';
import { QualityControlComponent } from './pages/quality-control/quality-control.component';
import { LabPrescriptionsComponent } from './pages/prescriptions/prescriptions.component';

// ✅ Nouveaux composants CRUD
import { LaboratoryResultListComponent } from './pages/laboratory-result-list/laboratory-result-list.component';
import { MedicalPictureListComponent } from './pages/medical-picture-list/medical-picture-list.component';
import { LabStatisticsComponent } from './pages/lab-statistics/lab-statistics.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Routes existantes (inchangées)
  { path: 'dashboard',  component: LabDashboardComponent },
  { path: 'profile',    component: LabProfileComponent },
  { path: 'prescriptions', component: LabPrescriptionsComponent },
  { path: 'samples',    component: SampleManagementComponent },
  { path: 'results',    component: TestResultsComponent },
  { path: 'equipment',  component: EquipmentManagementComponent },
  { path: 'quality',    component: QualityControlComponent },
  // ✅ Nouvelles routes CRUD (Lemin-pi)
  { path: 'lab-results',      component: LaboratoryResultListComponent },
  { path: 'medical-pictures', component: MedicalPictureListComponent },
  { path: 'statistics',       component: LabStatisticsComponent },
  // ✅ Forum route (main)
  {
    path: 'forum',
    loadChildren: () => import('../forum/forum.module').then(m => m.ForumModule),
    data: { role: 'LAB', userId: 4, userName: 'Lab Staff', expertCategory: 'Ask a Lab', title: 'Lab Results Forum' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaboratoryRoutingModule { }