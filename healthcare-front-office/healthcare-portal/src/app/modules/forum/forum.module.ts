import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForumRoutingModule } from './forum-routing.module';
import {
  LucideAngularModule,
  MessageSquare, Search, Plus, ArrowLeft, ThumbsUp, Eye, Clock,
  Pin, Send, MessageCircle, Tag, ChevronRight, CornerDownRight,
  AlertCircle, CheckCircle2, Lock, Trash2, Edit3, LayoutGrid, Users,
  Bold, Italic, Strikethrough, Type, Link, Image as ImageIcon, Video,
  List, ListOrdered, Quote, Code, Table, Eraser, Paperclip, Minus,
  HeartPulse, Pill, Activity, Brain, FlaskConical, Dumbbell, ArrowUp,
  ChevronDown, Stethoscope
} from 'lucide-angular';

import { ForumHomeComponent } from './pages/forum-home/forum-home.component';
import { ForumCategoryComponent } from './pages/forum-category/forum-category.component';
import { ForumPostComponent } from './pages/forum-post/forum-post.component';
import { ForumNewPostComponent } from './pages/forum-new-post/forum-new-post.component';
import { ForumMyPostsComponent } from './pages/forum-my-posts/forum-my-posts.component';
import { SharedModule } from '../../shared/shared.module';
import { CommentItemComponent } from './components/comment-item/comment-item/comment-item.component';


@NgModule({
  declarations: [
    ForumHomeComponent,
    ForumCategoryComponent,
    ForumPostComponent,
    ForumNewPostComponent,
    ForumMyPostsComponent,
    CommentItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    ForumRoutingModule,
    LucideAngularModule.pick({
      MessageSquare, Search, Plus, ArrowLeft, ThumbsUp, Eye, Clock,
      Pin, Send, MessageCircle, Tag, ChevronRight, CornerDownRight,
      AlertCircle, CheckCircle2, Lock, Trash2, Edit3, LayoutGrid, Users,
      Bold, Italic, Strikethrough, Type, Link, Image: ImageIcon, Video,
      List, ListOrdered, Quote, Code, Table, Eraser, Paperclip, Minus,
      HeartPulse, Pill, Activity, Brain, FlaskConical, Dumbbell, ArrowUp,
      ChevronDown, Stethoscope
    })
  ]
})
export class ForumModule { }
