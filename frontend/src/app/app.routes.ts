import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { SignUpComponent } from './pages/sign-up/sign-up';
import { PacksComponent } from './pages/packs/packs';
import { authGuard } from './core/auth/auth-guard';
import { PackDetailComponent } from './pages/pack-detail/pack-detail';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'criar-conta', component: SignUpComponent },
  {
    path: 'packs',
    component: PacksComponent,
    canActivate: [authGuard],
  },
  { path: 'packs/:id', component: PackDetailComponent, canActivate: [authGuard] },
];
