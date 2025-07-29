import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CacheBusterService {
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.initializeCacheBusting();
    }
  }

  private initializeCacheBusting(): void {
    if (!this.isBrowser) return;
    
    // Clear cache on app start
    this.clearAllCaches();
    
    // Set up periodic cache clearing (every 5 minutes)
    setInterval(() => {
      this.clearSocketCaches();
    }, 5 * 60 * 1000);
    
    // Clear cache before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.clearSocketCaches();
      });
    }
  }

  public clearAllCaches(): void {
    if (!this.isBrowser) return;
    
    this.clearSocketCaches();
    this.clearApplicationCache();
    this.clearBrowserCache();
  }

  public clearSocketCaches(): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') return;
    
    try {
      // Clear localStorage items related to sockets
      Object.keys(localStorage).forEach(key => {
        if (key.includes('socket') || 
            key.includes('websocket') || 
            key.includes('io') ||
            key.includes('connection')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      console.log('🧹 Socket caches cleared');
    } catch (error) {
      console.warn('⚠️ Could not clear socket caches:', error);
    }
  }

  private clearApplicationCache(): void {
    if (!this.isBrowser || typeof window === 'undefined') return;
    
    try {
      // Clear service worker caches if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not clear application cache:', error);
    }
  }

  private clearBrowserCache(): void {
    if (!this.isBrowser || typeof window === 'undefined' || typeof performance === 'undefined') return;
    
    try {
      // Force reload without cache (programmatically)
      if (performance.navigation && performance.navigation.type === performance.navigation.TYPE_RELOAD) {
        window.location.reload();
      }
    } catch (error) {
      console.warn('⚠️ Could not force cache reload:', error);
    }
  }

  public forceReconnection(): void {
    if (!this.isBrowser || typeof window === 'undefined') return;
    
    console.log('🔄 Forcing socket reconnection...');
    this.clearSocketCaches();
    
    // Trigger a custom event that socket service can listen to
    try {
      window.dispatchEvent(new CustomEvent('force-socket-reconnection'));
    } catch (error) {
      console.warn('⚠️ Could not dispatch reconnection event:', error);
    }
  }

  public getUniqueConnectionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
