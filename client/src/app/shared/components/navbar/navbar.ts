import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  isMobileMenuOpen = false;
  isUserMenuOpen = false;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/settings']);
  }

  navigateToAdmin(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/admin']);
  }

  isAdmin(): boolean {
    const user = this.currentUser;
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  }

  logout(): void {
    this.isUserMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  joinDiscord(): void {
    window.open('https://discord.gg/your-server-invite', '_blank');
  }
}
