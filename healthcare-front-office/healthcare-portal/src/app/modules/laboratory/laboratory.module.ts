import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { LaboratoryRoutingModule } from './laboratory-routing.module';

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

@NgModule({
  declarations: [
    // Existants
    LabDashboardComponent,
    LabProfileComponent,
    SampleManagementComponent,
    TestResultsComponent,
    EquipmentManagementComponent,
    QualityControlComponent,
    LabPrescriptionsComponent,
    // ✅ Nouveaux
    LaboratoryResultListComponent,
    MedicalPictureListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,       // ✅ Requis pour les services HTTP
    LaboratoryRoutingModule
  ]
})
export class LaboratoryModule { }