import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    loadChildren: () => import('./pages/order-pages/order-pages.module').then(m => m.default)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.default)
  },
  {
    path: 'discussions',
    loadChildren: () => import('./pages/discussion-pages/discussion-pages.module').then(m => m.default)
  },
  {
    path: 'breakdowns',
    loadChildren: () => import('./pages/breakdown/breakdown.module').then(m => m.BreakdownModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
