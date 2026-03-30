import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminUsersComponent } from './pages/users/users.component';
import { AdminApprovalsComponent } from './pages/approvals/approvals.component';
import { AdminMonitoringComponent } from './pages/monitoring/monitoring.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        AdminUsersComponent,
        AdminApprovalsComponent,
        AdminMonitoringComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AdminRoutingModule
    ]
})
export class AdminModule { }
