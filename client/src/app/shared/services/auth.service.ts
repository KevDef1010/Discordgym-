import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  username: string;
  email: string;
  discordId: string;
  avatar: string;
  role?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterDto {
  discordId?: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Debug flag to help track auth state changes
  private static authStateChangeCount = 0;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if user is already logged in (localStorage) - only in browser
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  register(registerData: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, registerData)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
          }
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(loginData: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
            // Also mark auth as verified for this session
            sessionStorage.setItem('auth_verified', 'true');
          }
          
          AuthService.authStateChangeCount++;
          console.log(`[Auth] Login - Auth state change #${AuthService.authStateChangeCount} for user: ${response.user.username}`);
          
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    
    AuthService.authStateChangeCount++;
    console.log(`[Auth] Logout - Auth state change #${AuthService.authStateChangeCount}`);
    
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    // First check the current subject value
    if (this.currentUserSubject.value !== null) {
      return true;
    }
    
    // If not found in subject, try checking localStorage directly
    // This adds an extra layer of reliability
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (savedUser && token) {
        try {
          const user = JSON.parse(savedUser);
          if (user && user.id) {
            // Update the subject with the found user
            this.currentUserSubject.next(user);
            return true;
          }
        } catch (error) {
          console.error('Error parsing saved user data', error);
        }
      }
    }
    
    return false;
  }

  /**
   * Validates the current authentication state by checking localStorage and
   * ensuring the token is valid. This helps prevent redirection loops.
   */
  verifyAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('[Auth] Verifying authentication state...');
      
      // Don't immediately clear the auth state, first check what's in localStorage
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      // Check if we already verified auth in this session
      const authVerified = sessionStorage.getItem('auth_verified');
      if (authVerified === 'true') {
        console.log('[Auth] Auth already verified this session');
        return;
      }
      
      if (!savedUser || !token) {
        console.log('[Auth] No saved credentials found, clearing state');
        // Clear any potentially corrupted state
        this.logout();
        return;
      }
      
      try {
        // Parse user to ensure it's valid JSON
        const user = JSON.parse(savedUser);
        if (!user || !user.id) {
          console.log('[Auth] Invalid user data found, clearing state');
          this.logout();
          return;
        }
        
        console.log('[Auth] Valid authentication found for user:', user.username);
        
        // Set the user only once, to avoid triggering multiple subscription events
        AuthService.authStateChangeCount++;
        console.log(`[Auth] Setting user - Auth state change #${AuthService.authStateChangeCount}`);
        this.currentUserSubject.next(user);
        
        // Mark auth as verified for this session
        sessionStorage.setItem('auth_verified', 'true');
      } catch (error) {
        console.error('[Auth] Error parsing stored user data', error);
        this.logout();
      }
    }
  }

  checkAvailability(email: string, username: string, discordId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/check`, {
      params: { email, username, discordId }
    });
  }
}
