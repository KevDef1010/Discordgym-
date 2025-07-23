import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    
    if (!isAdmin) {
      this.router.navigate(['/dashboard']);
      alert('❌ Zugriff verweigert: Sie haben keine Admin-Berechtigung!');
      return false;
    }

    return true;
  }
}
