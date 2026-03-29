import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogoComponent } from './components/logo/logo.component';
import { NavButtonComponent } from './components/nav-button/nav-button.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ChatInterfaceComponent } from './components/chat-interface/chat-interface.component';

import {
    LucideAngularModule,
    LayoutDashboard,
    User,
    FileText,
    MessageSquare,
    Calendar,
    Users,
    Pill,
    ShoppingBag,
    Activity,
    Clock,
    CreditCard,
    History,
    Video,
    Search,
    Bell,
    Menu,
    X,
    Plus,
    Home,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Stethoscope,
    Microscope,
    Clipboard,
    ShieldCheck,
    Phone,
    Mail,
    MapPin,
    Star
} from 'lucide-angular';

@NgModule({
    declarations: [
        LogoComponent,
        NavButtonComponent,
        MainLayoutComponent,
        ChatInterfaceComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        LucideAngularModule.pick({
            LayoutDashboard, User, FileText, MessageSquare, Calendar, Users, Pill, ShoppingBag,
            Activity, Clock, CreditCard, History, Video, Search, Bell, Menu, X, Plus,
            Home, Settings, LogOut, ChevronDown, ChevronRight, Stethoscope, Microscope,
            Clipboard, ShieldCheck, Phone, Mail, MapPin, Star
        })
    ],
    exports: [
        CommonModule,
        RouterModule,
        FormsModule,
        LogoComponent,
        NavButtonComponent,
        MainLayoutComponent,
        ChatInterfaceComponent,
        LucideAngularModule
    ]
})
export class SharedModule { }
