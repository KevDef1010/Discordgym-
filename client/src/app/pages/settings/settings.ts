import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Settings state
  settings = {
    notifications: {
      email: true,
      discord: true,
      workoutReminders: true,
      achievementAlerts: false
    },
    privacy: {
      profilePublic: true,
      showWorkouts: true,
      showStats: false
    },
    appearance: {
      theme: 'dark',
      language: 'de'
    },
    chat: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      autoJoinVoice: false
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.settingsForm = this.fb.group({
      // Notifications
      emailNotifications: [this.settings.notifications.email],
      discordNotifications: [this.settings.notifications.discord],
      workoutReminders: [this.settings.notifications.workoutReminders],
      achievementAlerts: [this.settings.notifications.achievementAlerts],
      
      // Privacy
      profilePublic: [this.settings.privacy.profilePublic],
      showWorkouts: [this.settings.privacy.showWorkouts],
      showStats: [this.settings.privacy.showStats],
      
      // Appearance
      theme: [this.settings.appearance.theme],
      language: [this.settings.appearance.language],
      
      // Chat
      showOnlineStatus: [this.settings.chat.showOnlineStatus],
      allowDirectMessages: [this.settings.chat.allowDirectMessages],
      autoJoinVoice: [this.settings.chat.autoJoinVoice]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load settings from localStorage or API
    this.loadSettings();
  }

  loadSettings(): void {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      this.settings = { ...this.settings, ...parsed };
      this.settingsForm.patchValue(this.flattenSettings());
    }
  }

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

  onSave(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.settingsForm.value;
    
    // Update settings object
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

    // Save to localStorage (in real app, save to API)
    localStorage.setItem('userSettings', JSON.stringify(this.settings));

    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Einstellungen erfolgreich gespeichert!';
      
      // Apply theme change
      if (formValues.theme === 'light') {
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
      }
    }, 1000);
  }

  onReset(): void {
    if (confirm('Alle Einstellungen auf Standard zurücksetzen?')) {
      this.settingsForm.reset();
      this.loadSettings();
      this.successMessage = 'Einstellungen zurückgesetzt!';
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
