/**
 * Dashboard Component
 * 
 * Main dashboard view for authenticated users displaying fitness statistics,
 * recent activities, and quick navigation to key features.
 * 
 * Features:
 * - User fitness statistics overview
 * - Recent workout history
 * - Active challenge progress
 * - Quick navigation to main features
 * - Responsive layout with activity cards
 * 
 * @author DiscordGym Team
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // User authentication state
  currentUser: User | null = null; // Currently authenticated user data
  
  // Dashboard statistics (mock data for demonstration)
  stats = {
    totalWorkouts: 15, // Total completed workouts
    weeklyGoal: 4, // Weekly workout goal
    currentStreak: 7, // Current workout streak in days
    totalChallenges: 3 // Number of active challenges
  };

  // Recent workout history for quick overview
  recentWorkouts = [
    { name: 'Push Day', date: '2025-01-20', duration: '45 min', exercises: 8 },
    { name: 'Leg Day', date: '2025-01-18', duration: '60 min', exercises: 6 },
    { name: 'Pull Day', date: '2025-01-16', duration: '50 min', exercises: 7 }
  ];

  // Active challenges with progress tracking
  activeChallenges = [
    { name: '30-Day Push-up Challenge', progress: 65, daysLeft: 15 },
    { name: 'Weekly Cardio Goal', progress: 80, daysLeft: 3 },
    { name: 'Protein Intake Challenge', progress: 90, daysLeft: 2 }
  ];

  /**
   * Constructor - Initialize dashboard component
   * @param authService - Authentication service for user data
   * @param router - Angular router for navigation
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Component initialization lifecycle hook
   * Loads user data and validates authentication state
   */
  ngOnInit(): void {
    // Get current authentication state (single check, not subscription)
    this.currentUser = this.authService.getCurrentUser();
    
    // Redirect to login if not authenticated (backup check, AuthGuard should handle this)
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  navigateToFriends(): void {
    this.router.navigate(['/friends']);
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'SUPER_ADMIN';
  }
}
