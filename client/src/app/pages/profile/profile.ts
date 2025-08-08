import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';
import { ChatService } from '../../shared/services/chat.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Invites section
  userInvites: any[] = [];
  invitesLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      discordId: ['', Validators.required],
      avatar: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Populate form with current user data
    this.profileForm.patchValue({
      username: this.currentUser.username,
      email: this.currentUser.email,
      discordId: this.currentUser.discordId,
      avatar: this.currentUser.avatar
    });

    // Load user invites
    this.loadUserInvites();
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updateData = {
        ...this.profileForm.value,
        id: this.currentUser.id
      };

      // Here you would call your API to update the user
      // For now, just simulate success
      setTimeout(() => {
        this.isLoading = false;
        this.successMessage = 'Profil erfolgreich aktualisiert!';
        
        // Update local user data
        const updatedUser = { ...this.currentUser!, ...this.profileForm.value };
        // You would normally get this from the API response
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
      }, 1000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  onDeleteAccount(): void {
    if (confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      if (confirm('Geben Sie zur Bestätigung "LÖSCHEN" ein:')) {
        // Show loading state
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.deleteAccount().subscribe({
          next: (response) => {
            this.successMessage = 'Ihr Konto wird gelöscht...';
            this.isLoading = false;
            
            // Redirect to account deleted page
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
  
  startChat(): void {
    if (!this.currentUser) return;
    
    // Instead of trying to chat with yourself, just navigate to the chat page
    // This prevents the infinite loop issue
    this.router.navigate(['/chat']);
  }

  loadUserInvites(): void {
    if (!this.currentUser) return;
    
    this.invitesLoading = true;
    this.chatService.getUserInvites().then((invites: any[]) => {
      this.userInvites = invites;
      this.invitesLoading = false;
    }).catch((error: any) => {
      console.error('Error loading invites:', error);
      this.invitesLoading = false;
    });
  }

  acceptInvite(inviteCode: string): void {
    this.chatService.joinServerByInvite(inviteCode).then((response: any) => {
      this.successMessage = 'Server erfolgreich beigetreten!';
      this.loadUserInvites(); // Refresh invites
      // Optionally navigate to the server
      setTimeout(() => this.successMessage = '', 3000);
    }).catch((error: any) => {
      this.errorMessage = 'Fehler beim Beitreten des Servers';
      setTimeout(() => this.errorMessage = '', 3000);
    });
  }

  declineInvite(inviteId: number): void {
    // For now, just remove from local list
    // In a full implementation, you might want to mark as declined on server
    this.userInvites = this.userInvites.filter(invite => invite.id !== inviteId);
  }
}
