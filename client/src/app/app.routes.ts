import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

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
    path: '**',
    redirectTo: ''
  }
];
