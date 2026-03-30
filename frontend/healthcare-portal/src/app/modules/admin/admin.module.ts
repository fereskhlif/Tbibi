import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
<<<<<<< HEAD
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminUsersComponent } from './users/users.component';
import { AdminApprovalsComponent } from './approvals/approvals.component';
=======
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminUsersComponent } from './pages/users/users.component';
import { AdminApprovalsComponent } from './pages/approvals/approvals.component';
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

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
