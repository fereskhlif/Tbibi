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
  // ✅ Nouvelles routes CRUD
  { path: 'lab-results',      component: LaboratoryResultListComponent },
  { path: 'medical-pictures', component: MedicalPictureListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaboratoryRoutingModule { }