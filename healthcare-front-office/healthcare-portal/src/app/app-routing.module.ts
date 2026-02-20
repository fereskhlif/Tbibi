import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/login/login.component';
import { GraphicCharterComponent } from './pages/graphic-charter/graphic-charter.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: LoginComponent, data: { signupMode: true } },
  { path: 'graphic-charter', component: GraphicCharterComponent },
  {
    path: 'patient',
    component: MainLayoutComponent,
    data: { role: 'patient' },
    loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
  },
  {
    path: 'doctor',
    component: MainLayoutComponent,
    data: { role: 'doctor' },
    loadChildren: () => import('./modules/doctor/doctor.module').then(m => m.DoctorModule)
  },
  {
    path: 'physio',
    component: MainLayoutComponent,
    data: { role: 'physiotherapist' },
    loadChildren: () => import('./modules/physiotherapist/physiotherapist.module').then(m => m.PhysiotherapistModule)
  },
  {
    path: 'pharmacist',
    component: MainLayoutComponent,
    data: { role: 'pharmacist' },
    loadChildren: () => import('./modules/pharmacist/pharmacist.module').then(m => m.PharmacistModule)
  },
  {
    path: 'laboratory',
    component: MainLayoutComponent,
    data: { role: 'laboratory' },
    loadChildren: () => import('./modules/laboratory/laboratory.module').then(m => m.LaboratoryModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
