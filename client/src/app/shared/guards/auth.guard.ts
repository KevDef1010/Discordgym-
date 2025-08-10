/**
 * Authentication Guards
 * 
 * Route guards that control access to different parts of the application
 * based on user authentication status and permissions.
 * 
 * Guards included:
 * - AuthGuard: Protects authenticated-only routes
 * - GuestGuard: Redirects authenticated users away from public routes
 * 
 * @author DiscordGym Team
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard
 * 
 * Protects routes that require user authentication.
 * Redirects unauthenticated users to the login page.
 */
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

  /**
   * Determines if a route can be activated based on authentication status
   * @returns true if user is authenticated, false otherwise
   */
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

/**
 * Guest Guard
 * 
 * Redirects authenticated users away from public routes (like login/register)
 * to prevent access to authentication pages when already logged in.
 */
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
