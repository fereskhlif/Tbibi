import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminUsersComponent } from './users/users.component';
import { AdminApprovalsComponent } from './approvals/approvals.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        AdminUsersComponent,
        AdminApprovalsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AdminRoutingModule
    ]
})
export class AdminModule { }
