import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogoComponent } from './components/logo/logo.component';
import { NavButtonComponent } from './components/nav-button/nav-button.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ChatInterfaceComponent } from './components/chat-interface/chat-interface.component';
import { FilePickerDirective } from '../modules/pharmacist/directives/file-picker.directive';
import { MarkdownPipe } from './pipes/markdown.pipe';
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
  ChevronDown,   // ← removed duplicate standalone import, kept here only
  ChevronRight,
  Stethoscope,
  Microscope,
  Clipboard,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Star,
  Pencil,
  RotateCcw,
  Image,
  Trash2,
  ShoppingCart,
  Package,
  Eye,
  Loader2,
  Check,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  SearchX,
  Truck,
  Filter,
  ArrowUpDown,
  Share2,
  Edit3,
  // ═══ Forum Home icons ═══
  MessageCircle,
  LayoutGrid,
  ArrowUp,
  HeartPulse,
  Heart,
  Sun,
  Leaf,
  Smile,
  ShieldAlert,
  Cpu,
  CirclePlus,
  FlaskConical,
  CornerDownRight,
  // ═══ Forum Post page icons ═══
  ArrowLeft,
  Lock,
  ThumbsUp,
  Bold,
  Italic,
  Strikethrough,
  Type,
  Quote,
  Code,
  List,
  ListOrdered,
  Link,
  Bookmark,
  SortAsc,
} from 'lucide-angular';

@NgModule({
  declarations: [
    LogoComponent,
    NavButtonComponent,
    MainLayoutComponent,
    ChatInterfaceComponent,   // ← added missing comma
    FilePickerDirective,
    MarkdownPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule.pick({
      LayoutDashboard, User, FileText, MessageSquare, Calendar, Users, Pill, ShoppingBag,
      Activity, Share2, Edit3, Clock, CreditCard, History, Video, Search, Bell, Menu, X, Plus,
      Home, Settings, LogOut, ChevronDown, ChevronRight, Stethoscope, Microscope,
      Clipboard, ShieldCheck, Phone, Mail, MapPin, Star, Pencil, RotateCcw, Image, Trash2,
      ShoppingCart, Package, Eye, Loader2, Check, CheckCircle, AlertCircle, ChevronLeft,
      SearchX, Truck, Filter, ArrowUpDown,
      // Forum Home
      MessageCircle, LayoutGrid, ArrowUp, HeartPulse, Heart, Sun, Leaf, Smile,
      ShieldAlert, Cpu, CirclePlus, FlaskConical, CornerDownRight,
      // Forum Post
      ArrowLeft, Lock, ThumbsUp, Bold, Italic, Strikethrough, Type, Quote, Code,
      List, ListOrdered, Link, Bookmark, SortAsc,
    }),
  ],
  exports: [
    CommonModule,
    RouterModule,         // ← kept from HEAD
    FormsModule,
    LogoComponent,
    NavButtonComponent,
    MainLayoutComponent,
    ChatInterfaceComponent,  // ← kept from HEAD
    LucideAngularModule,
    FilePickerDirective,     // ← kept from e-pharmacy
    MarkdownPipe,            // ← kept from e-pharmacy
  ],
})
export class SharedModule {}
