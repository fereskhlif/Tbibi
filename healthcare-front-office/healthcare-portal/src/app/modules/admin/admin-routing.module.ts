import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminUsersComponent } from './pages/users/users.component';
import { AdminApprovalsComponent } from './pages/approvals/approvals.component';
import { AdminMonitoringComponent } from './pages/monitoring/monitoring.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'users', component: AdminUsersComponent },
    { path: 'approvals', component: AdminApprovalsComponent },
    { path: 'monitoring', component: AdminMonitoringComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
