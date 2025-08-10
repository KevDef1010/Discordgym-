/**
 * Settings Component
 * 
 * Comprehensive user settings management component providing configuration
 * for notifications, privacy, appearance, and chat preferences.
 * 
 * Features:
 * - Notification preferences (email, Discord, workout reminders)
 * - Privacy controls (profile visibility, workout sharing)
 * - Appearance settings (theme, language)
 * - Chat configuration (online status, direct messages)
 * - Settings persistence and reset functionality
 * - Real-time theme application
 * 
 * @author DiscordGym Team
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';

/**
 * User settings structure interface
 */
interface UserSettings {
  notifications: {
    email: boolean; // Email notification preference
    discord: boolean; // Discord notification preference
    workoutReminders: boolean; // Workout reminder notifications
    achievementAlerts: boolean; // Achievement notification alerts
  };
  privacy: {
    profilePublic: boolean; // Public profile visibility
    showWorkouts: boolean; // Workout history visibility
    showStats: boolean; // Statistics visibility
  };
  appearance: {
    theme: string; // UI theme (light/dark)
    language: string; // Interface language
  };
  chat: {
    showOnlineStatus: boolean; // Online status visibility
    allowDirectMessages: boolean; // Direct message permissions
    autoJoinVoice: boolean; // Auto-join voice channels
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  // Form management
  settingsForm: FormGroup; // Reactive form for settings configuration
  
  // User authentication state
  currentUser: User | null = null; // Currently authenticated user
  
  // UI state management
  isLoading = false; // Loading state for form operations
  successMessage = ''; // Success feedback message
  errorMessage = ''; // Error feedback message

  // Default settings configuration
  settings: UserSettings = {
    notifications: {
      email: true, // Enable email notifications by default
      discord: true, // Enable Discord notifications by default
      workoutReminders: true, // Enable workout reminders by default
      achievementAlerts: false // Disable achievement alerts by default
    },
    privacy: {
      profilePublic: true, // Public profile by default
      showWorkouts: true, // Show workouts by default
      showStats: false // Hide stats by default for privacy
    },
    appearance: {
      theme: 'dark', // Dark theme by default
      language: 'de' // German language by default
    },
    chat: {
      showOnlineStatus: true, // Show online status by default
      allowDirectMessages: true, // Allow direct messages by default
      autoJoinVoice: false // Don't auto-join voice by default
    }
  };

  /**
   * Constructor - Initialize settings component
   * @param fb - Angular FormBuilder for reactive forms
   * @param authService - Authentication service for user operations
   * @param router - Angular router for navigation
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize settings form with all configuration options
    this.settingsForm = this.fb.group({
      // Notification preferences
      emailNotifications: [this.settings.notifications.email],
      discordNotifications: [this.settings.notifications.discord],
      workoutReminders: [this.settings.notifications.workoutReminders],
      achievementAlerts: [this.settings.notifications.achievementAlerts],
      
      // Privacy controls
      profilePublic: [this.settings.privacy.profilePublic],
      showWorkouts: [this.settings.privacy.showWorkouts],
      showStats: [this.settings.privacy.showStats],
      
      // Appearance settings
      theme: [this.settings.appearance.theme],
      language: [this.settings.appearance.language],
      
      // Chat configuration
      showOnlineStatus: [this.settings.chat.showOnlineStatus],
      allowDirectMessages: [this.settings.chat.allowDirectMessages],
      autoJoinVoice: [this.settings.chat.autoJoinVoice]
    });
  }

  /**
   * Component initialization lifecycle hook
   * Validates user authentication and loads saved settings
   */
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user's saved settings from storage or API
    this.loadSettings();
  }

  /**
   * Load user settings from localStorage
   * Falls back to default settings if none are saved
   */
  loadSettings(): void {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      this.settings = { ...this.settings, ...parsed };
      this.settingsForm.patchValue(this.flattenSettings());
    }
  }

  /**
   * Convert nested settings object to flat form structure
   * @returns Flattened settings object for form population
   */
  flattenSettings(): any {
    return {
      emailNotifications: this.settings.notifications.email,
      discordNotifications: this.settings.notifications.discord,
      workoutReminders: this.settings.notifications.workoutReminders,
      achievementAlerts: this.settings.notifications.achievementAlerts,
      profilePublic: this.settings.privacy.profilePublic,
      showWorkouts: this.settings.privacy.showWorkouts,
      showStats: this.settings.privacy.showStats,
      theme: this.settings.appearance.theme,
      language: this.settings.appearance.language,
      showOnlineStatus: this.settings.chat.showOnlineStatus,
      allowDirectMessages: this.settings.chat.allowDirectMessages,
      autoJoinVoice: this.settings.chat.autoJoinVoice
    };
  }

  /**
   * Save settings changes to localStorage and apply theme
   * In production, this would save to API endpoint
   */
  onSave(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.settingsForm.value;
    
    // Update settings object with form values
    this.settings = {
      notifications: {
        email: formValues.emailNotifications,
        discord: formValues.discordNotifications,
        workoutReminders: formValues.workoutReminders,
        achievementAlerts: formValues.achievementAlerts
      },
      privacy: {
        profilePublic: formValues.profilePublic,
        showWorkouts: formValues.showWorkouts,
        showStats: formValues.showStats
      },
      appearance: {
        theme: formValues.theme,
        language: formValues.language
      },
      chat: {
        showOnlineStatus: formValues.showOnlineStatus,
        allowDirectMessages: formValues.allowDirectMessages,
        autoJoinVoice: formValues.autoJoinVoice
      }
    };

    // Persist settings to localStorage (TODO: Replace with API call)
    localStorage.setItem('userSettings', JSON.stringify(this.settings));

    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Einstellungen erfolgreich gespeichert!';
      
      // Apply theme change immediately to DOM
      if (formValues.theme === 'light') {
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
      }
    }, 1000);
  }

  /**
   * Reset all settings to default values
   * Requires user confirmation before proceeding
   */
  onReset(): void {
    if (confirm('Alle Einstellungen auf Standard zurücksetzen?')) {
      this.settingsForm.reset();
      this.loadSettings();
      this.successMessage = 'Einstellungen zurückgesetzt!';
    }
  }

  /**
   * Cancel settings changes and return to dashboard
   */
  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
