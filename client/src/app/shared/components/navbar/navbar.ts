import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-navbar',
  imports: [ButtonComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  joinDiscord(): void {
    window.open('https://discord.gg/your-server-invite', '_blank');
  }
}
