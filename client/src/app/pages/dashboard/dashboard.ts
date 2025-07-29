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
  currentUser: User | null = null;
  
  // Dashboard stats (mock data for now)
  stats = {
    totalWorkouts: 15,
    weeklyGoal: 4,
    currentStreak: 7,
    totalChallenges: 3
  };

  recentWorkouts = [
    { name: 'Push Day', date: '2025-01-20', duration: '45 min', exercises: 8 },
    { name: 'Leg Day', date: '2025-01-18', duration: '60 min', exercises: 6 },
    { name: 'Pull Day', date: '2025-01-16', duration: '50 min', exercises: 7 }
  ];

  activeChallenges = [
    { name: '30-Day Push-up Challenge', progress: 65, daysLeft: 15 },
    { name: 'Weekly Cardio Goal', progress: 80, daysLeft: 3 },
    { name: 'Protein Intake Challenge', progress: 90, daysLeft: 2 }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
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
