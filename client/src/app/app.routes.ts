import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { SettingsComponent } from './pages/settings/settings';
import { AuthGuard, GuestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: Home,
    title: 'DiscordGym - Transform your Discord into a Fitness Community',
    canActivate: [GuestGuard]
  },
  { 
    path: 'home', 
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    title: 'DiscordGym - Login',
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: Register,
    title: 'DiscordGym - Register',
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'DiscordGym - Dashboard',
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'DiscordGym - Profil',
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    title: 'DiscordGym - Einstellungen',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
