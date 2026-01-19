import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { SignUpComponent } from './pages/sign-up/sign-up';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'criar-conta', component: SignUpComponent },
];
