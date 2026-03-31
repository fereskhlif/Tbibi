import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForumHomeComponent } from './pages/forum-home/forum-home.component';
import { ForumPostComponent } from './pages/forum-post/forum-post.component';
import { ForumNewPostComponent } from './pages/forum-new-post/forum-new-post.component';
import { ForumMyPostsComponent } from './pages/forum-my-posts/forum-my-posts.component';

const routes: Routes = [
  { path: '', component: ForumHomeComponent },
  { path: 'post/:id', component: ForumPostComponent },
  { path: 'new-post', component: ForumNewPostComponent },
  { path: 'my-posts', component: ForumMyPostsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule { }
