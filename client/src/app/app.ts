import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { CacheBusterService } from './shared/services/cache-buster.service';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('DiscordGym');
  private cacheBusterService = inject(CacheBusterService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  private appInitialized = false;

  ngOnInit(): void {
    // Only run browser-specific code if we're in a browser
    if (isPlatformBrowser(this.platformId)) {
      this.initializeInBrowser();
    } else {
      console.log('App initializing in server-side rendering mode');
    }
  }
  
  private initializeInBrowser(): void {
    // Prevent multiple initializations by using a flag in sessionStorage
    try {
      const hasInitialized = sessionStorage.getItem('app_initialized');
      if (hasInitialized === 'true') {
        console.log('App already initialized in this session');
        return;
      }
      
      // Set initialization flag
      sessionStorage.setItem('app_initialized', 'true');
      
      // Clear any URL parameters that could cause loops
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    
      // Verify authentication state just once at app startup
      this.authService.verifyAuthState();
      
      console.log('🚀 App initialized successfully');
      
      // Clear initialization flag after a delay to allow routing to complete
      setTimeout(() => {
        localStorage.removeItem('app_initialized');
      }, 5000);
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  }
}
