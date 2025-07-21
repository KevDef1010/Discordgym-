import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  
  joinServer(): void {
    // Navigate to Discord invite link
    window.open('https://discord.gg/your-server-invite', '_blank');
  }

  learnMore(): void {
    // Scroll to features section or navigate to about page
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
