/**
 * Home Component
 * 
 * Landing page component that serves as the main entry point for new users.
 * Displays application features, benefits, and provides navigation to key actions.
 * 
 * Features:
 * - Hero section with call-to-action buttons
 * - Feature highlights and benefits overview
 * - Smooth scroll navigation to page sections
 * - External Discord server integration
 * - Responsive design for all devices
 * 
 * @author DiscordGym Team
 */
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  
  /**
   * Navigate user to Discord server invitation
   * Opens Discord invite link in new tab for community access
   */
  joinServer(): void {
    // Navigate to Discord invite link
    window.open('https://discord.gg/your-server-invite', '_blank');
  }

  /**
   * Smooth scroll to features section
   * Provides in-page navigation to learn more about application features
   */
  learnMore(): void {
    // Scroll to features section or navigate to about page
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
