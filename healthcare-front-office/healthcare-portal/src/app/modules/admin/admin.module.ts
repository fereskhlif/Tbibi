import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminUsersComponent } from './pages/users/users.component';
import { AdminApprovalsComponent } from './pages/approvals/approvals.component';
import { AdminMonitoringComponent } from './pages/monitoring/monitoring.component';
import { ForumModerationComponent } from './pages/forum-moderation/forum-moderation.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        AdminUsersComponent,
        AdminApprovalsComponent,
        AdminMonitoringComponent,
        ForumModerationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        AdminRoutingModule
    ]
})
export class AdminModule { }
