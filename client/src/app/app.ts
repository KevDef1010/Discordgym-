import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { CacheBusterService } from './shared/services/cache-buster.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('DiscordGym');
  private cacheBusterService = inject(CacheBusterService);

  ngOnInit(): void {
    // App initialization - cache busting is handled by the service constructor
    console.log('🚀 App initialized successfully');
  }
}
