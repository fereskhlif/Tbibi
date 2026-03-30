import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';
import { SharedModule } from '../../shared/shared.module';
import { LucideAngularModule } from 'lucide-angular';

@NgModule({
  declarations: [
    NotificationsPageComponent
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    SharedModule,
    LucideAngularModule
  ]
})
export class NotificationsModule { }
