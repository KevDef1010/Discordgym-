/**
 * Application Routes Configuration
 * 
 * Defines the routing structure for the DiscordGym application.
 * Includes route guards for authentication and authorization.
 * 
 * Route Guards:
 * - AuthGuard: Protects routes that require authentication
 * - GuestGuard: Redirects authenticated users away from public routes
 * - AdminGuard: Restricts access to admin-only routes
 * 
 * @author DiscordGym Team
 */
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { SettingsComponent } from './pages/settings/settings';
import { AdminComponent } from './pages/admin/admin';
import { FriendsComponent } from './pages/friends/friends';
import { ChatComponent } from './pages/chat/chat';
import { AccountDeletedComponent } from './pages/account-deleted/account-deleted';
import { AuthGuard, GuestGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  // Home route - public landing page for non-authenticated users
  { 
    path: '', 
    component: Home,
    title: 'DiscordGym - Transform your Discord into a Fitness Community',
    canActivate: [GuestGuard] // Redirect authenticated users to dashboard
  },
  
  // Home redirect for explicit /home requests
  { 
    path: 'home', 
    redirectTo: '',
    pathMatch: 'full'
  },
  
  // Authentication routes
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
    path: 'friends',
    component: FriendsComponent,
    title: 'DiscordGym - Freunde',
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    component: ChatComponent,
    title: 'DiscordGym - Chat',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'DiscordGym - Admin Panel',
    canActivate: [AdminGuard]
  },
  {
    path: 'account-deleted',
    component: AccountDeletedComponent,
    title: 'DiscordGym - Konto gelöscht'
    // Keine Guards, da diese Seite nach dem Logout erreichbar sein sollte
  },
  {
    path: '**',
    redirectTo: ''
  }
];
