/**
 * Profile Component
 * 
 * User profile management component for viewing and editing user information.
 * Provides comprehensive profile management including personal data, server invites,
 * and account deletion functionality.
 * 
 * Features:
 * - Personal information editing (username, email, Discord ID, avatar)
 * - Server invitation management (view, accept, decline)
 * - Account deletion with confirmation
 * - Form validation and error handling
 * - Real-time feedback for user actions
 * 
 * @author DiscordGym Team
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';
import { ChatService, ServerInvite } from '../../shared/services/chat.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  // Profile form management
  profileForm: FormGroup; // Reactive form for profile editing
  
  // User authentication state
  currentUser: User | null = null; // Currently authenticated user
  
  // UI state management
  isLoading = false; // Loading state for form submissions
  successMessage = ''; // Success feedback message
  errorMessage = ''; // Error feedback message

  // Server invitations management
  userInvites: ServerInvite[] = []; // List of pending server invitations
  invitesLoading = false; // Loading state for invites section

  /**
   * Constructor - Initialize profile component
   * @param fb - Angular FormBuilder for reactive forms
   * @param authService - Authentication service for user operations
   * @param router - Angular router for navigation
   * @param chatService - Chat service for server operations
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {
    // Initialize profile form with validation rules
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Username with min length
      email: ['', [Validators.required, Validators.email]], // Email with format validation
      discordId: ['', Validators.required], // Discord ID required
      avatar: [''] // Avatar URL (optional)
    });
  }

  /**
   * Component initialization lifecycle hook
   * Loads current user data and populates the profile form
   */
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Populate form with current user data for editing
    this.profileForm.patchValue({
      username: this.currentUser.username,
      email: this.currentUser.email,
      discordId: this.currentUser.discordId,
      avatar: this.currentUser.avatar
    });

    // Load pending server invitations
    this.loadUserInvites();
  }

  /**
   * Handle profile form submission
   * Validates form data and updates user profile information
   */
  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updateData = {
        ...this.profileForm.value,
        id: this.currentUser.id
      };

      // TODO: Replace with actual API call
      // For now, just simulate success response
      setTimeout(() => {
        this.isLoading = false;
        this.successMessage = 'Profil erfolgreich aktualisiert!';
        
        // Update local user data (temporary until API integration)
        const updatedUser = { ...this.currentUser!, ...this.profileForm.value };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
      }, 1000);
    }
  }

  /**
   * Cancel profile editing and return to dashboard
   */
  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Handle account deletion with confirmation prompts
   * Requires double confirmation to prevent accidental deletion
   */
  onDeleteAccount(): void {
    if (confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      if (confirm('Geben Sie zur Bestätigung "LÖSCHEN" ein:')) {
        // Show loading state during deletion process
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.deleteAccount().subscribe({
          next: (response) => {
            this.successMessage = 'Ihr Konto wird gelöscht...';
            this.isLoading = false;
            
            // Navigate to account deleted confirmation page
            setTimeout(() => {
              this.router.navigate(['/account-deleted']);
            }, 1000);
          },
          error: (error) => {
            console.error('Account deletion error:', error);
            this.errorMessage = 'Fehler beim Löschen des Kontos. Bitte versuchen Sie es später erneut.';
            this.isLoading = false;
          }
        });
      }
    }
  }
  
  /**
   * Navigate to chat interface
   * Provides quick access to chat functionality from profile
   */
  startChat(): void {
    if (!this.currentUser) return;
    
    // Navigate to main chat page instead of trying to chat with self
    // This prevents infinite loop issues with self-chat attempts
    this.router.navigate(['/chat']);
  }

  /**
   * Load pending server invitations for the current user
   * Displays invites that user can accept or decline
   */
  loadUserInvites(): void {
    if (!this.currentUser) return;
    
    this.invitesLoading = true;
    this.chatService.getUserInvites().then((invites: ServerInvite[]) => {
      this.userInvites = invites;
      this.invitesLoading = false;
    }).catch((error: any) => {
      console.error('Error loading invites:', error);
      this.invitesLoading = false;
    });
  }

  /**
   * Accept a server invitation and join the server
   * @param inviteCode - Unique invitation code for server access
   */
  acceptInvite(inviteCode: string): void {
    this.chatService.joinServerByInvite(inviteCode).then((response: any) => {
      this.successMessage = 'Server erfolgreich beigetreten!';
      this.loadUserInvites(); // Refresh invitations list
      // Clear success message after delay
      setTimeout(() => this.successMessage = '', 3000);
    }).catch((error: any) => {
      this.errorMessage = 'Fehler beim Beitreten des Servers';
      setTimeout(() => this.errorMessage = '', 3000);
    });
  }

  /**
   * Decline a server invitation
   * @param inviteId - ID of the invitation to decline
   */
  declineInvite(inviteId: string): void {
    // TODO: Implement server-side decline API call
    // For now, just remove from local list
    this.userInvites = this.userInvites.filter(invite => invite.id !== inviteId);
  }
}
