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
      // Implement account deletion logic here
      console.log('Account deletion requested');
    }
  }
  
  startChat(): void {
    if (!this.currentUser) return;
    
    // Instead of trying to chat with yourself, just navigate to the chat page
    // This prevents the infinite loop issue
    this.router.navigate(['/chat']);
  }
}
