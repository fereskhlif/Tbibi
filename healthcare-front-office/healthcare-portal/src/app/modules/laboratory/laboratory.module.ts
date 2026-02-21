import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaboratoryRoutingModule } from './laboratory-routing.module';
import { LabDashboardComponent } from './pages/dashboard/dashboard.component';
import { LabProfileComponent } from './pages/profile/profile.component';
import { SampleManagementComponent } from './pages/sample-management/sample-management.component';
import { TestResultsComponent } from './pages/test-results/test-results.component';
import { EquipmentManagementComponent } from './pages/equipment-management/equipment-management.component';
import { QualityControlComponent } from './pages/quality-control/quality-control.component';

@NgModule({
    declarations: [LabDashboardComponent, LabProfileComponent, SampleManagementComponent, TestResultsComponent, EquipmentManagementComponent, QualityControlComponent],
    imports: [CommonModule, FormsModule, LaboratoryRoutingModule]
})
export class LaboratoryModule { }
