import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { 
    path: '', 
    component: Home,
    title: 'DiscordGym - Transform your Discord into a Fitness Community'
  },
  { 
    path: 'home', 
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    title: 'DiscordGym - Login'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
