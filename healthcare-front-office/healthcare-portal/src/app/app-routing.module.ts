import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/login/login.component';
import { GraphicCharterComponent } from './pages/graphic-charter/graphic-charter.component';
import { ActivateAccountComponent } from './pages/activate-account/activate-account.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: LoginComponent, data: { signupMode: true } },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'graphic-charter', component: GraphicCharterComponent },
  { path: 'activate-account', component: ActivateAccountComponent },
  {
    path: 'patient',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PATIENT' },  // ⚠️ Sans le préfixe ROLE_
    loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
  },
  {
    path: 'doctor',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'DOCTEUR' },  // ⚠️ Attention: 'DOCTEUR' pas 'DOCTOR'
    loadChildren: () => import('./modules/doctor/doctor.module').then(m => m.DoctorModule)
  },
  {
    path: 'physio',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'KINE' },  // ⚠️ 'KINE' pas 'PHYSIOTHERAPIST'
    loadChildren: () => import('./modules/physiotherapist/physiotherapist.module').then(m => m.PhysiotherapistModule)
  },
  {
    path: 'pharmacist',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PHARMASIS' },  // ⚠️ 'PHARMASIS' pas 'PHARMACIST'
    loadChildren: () => import('./modules/pharmacist/pharmacist.module').then(m => m.PharmacistModule)
  },
  {
    path: 'laboratory',
    component: MainLayoutComponent,
canActivate: [AuthGuard, RoleGuard],
    data: { role: 'LABORATORY' },
    loadChildren: () => import('./modules/laboratory/laboratory.module').then(m => m.LaboratoryModule)
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'forum',
    component: MainLayoutComponent,
    data: { role: 'patient' },
    loadChildren: () => import('./modules/forum/forum.module').then(m => m.ForumModule)
  },
  {
    path: 'notifications',
    component: MainLayoutComponent,
    data: { role: 'patient' },
    loadChildren: () => import('./modules/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
