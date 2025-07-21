import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-navbar',
  imports: [ButtonComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  joinDiscord(): void {
    window.open('https://discord.gg/your-server-invite', '_blank');
  }
}
