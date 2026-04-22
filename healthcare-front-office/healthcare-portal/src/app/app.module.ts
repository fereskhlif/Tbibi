import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/login/login.component';
import { GraphicCharterComponent } from './pages/graphic-charter/graphic-charter.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { RegisterComponent } from './component/register/register.component';
import { ActivateAccountComponent } from './pages/activate-account/activate-account.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';          // ← AJOUTER
import { WebcamModule } from 'ngx-webcam';
import { DoctorAnalyticsComponent } from './pages/doctor-analytics/doctor-analytics.component';
@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginComponent,
    GraphicCharterComponent,
    RegisterComponent,
    ActivateAccountComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    DoctorAnalyticsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    WebcamModule,
    SharedModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
