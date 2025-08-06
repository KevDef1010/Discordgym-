import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // Static flag to prevent multiple redirects across the entire application
  private static redirectingToLogin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check if the user is logged in
    if (this.authService.isLoggedIn()) {
      // Reset the redirect flag when user is authenticated
      AuthGuard.redirectingToLogin = false;
      return true;
    } 
    
    // If we're already in the process of redirecting, don't trigger another navigation
    if (!AuthGuard.redirectingToLogin) {
      AuthGuard.redirectingToLogin = true;
      console.log('AuthGuard: Redirecting to login page');
      
      // Navigate to login and reset flag after navigation completes
      this.router.navigate(['/login']).then(() => {
        // Add a short delay before allowing another redirect
        setTimeout(() => {
          AuthGuard.redirectingToLogin = false;
        }, 2000);
      });
    }
    
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  // Static flag to prevent multiple redirects across the entire application
  private static redirectingToDashboard = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // If not logged in, allow access to guest routes
    if (!this.authService.isLoggedIn()) {
      // Reset redirect flag when user is not authenticated
      GuestGuard.redirectingToDashboard = false;
      return true;
    }
    
    // If already authenticated and not currently redirecting
    if (!GuestGuard.redirectingToDashboard) {
      GuestGuard.redirectingToDashboard = true;
      console.log('GuestGuard: Redirecting to dashboard');
      
      // Navigate to dashboard and reset flag after navigation completes
      this.router.navigate(['/dashboard']).then(() => {
        // Add a short delay before allowing another redirect
        setTimeout(() => {
          GuestGuard.redirectingToDashboard = false;
        }, 2000);
      });
    }
    
    return false;
  }
}
