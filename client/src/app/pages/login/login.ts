/**
 * Login Component
 * 
 * Handles user authentication through a reactive form.
 * Provides login functionality with email/password validation,
 * password visibility toggle, and error handling.
 * 
 * Features:
 * - Reactive form validation
 * - Password visibility toggle
 * - Loading states and error messages
 * - Remember me functionality
 * - Automatic redirection after successful login
 * 
 * @author DiscordGym Team
 */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginDto } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Form and UI state
  loginForm: FormGroup; // Reactive form for login credentials
  showPassword = false; // Toggle for password visibility
  isLoading = false; // Loading state during authentication
  errorMessage = ''; // Error message display
  successMessage = ''; // Success message display

  /**
   * Constructor - Initialize the login component
   * @param fb - Angular FormBuilder for reactive forms
   * @param router - Angular Router for navigation
   * @param authService - Authentication service for login operations
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.createForm();
  }

  /**
   * Creates the reactive form with validation rules
   * @returns FormGroup with email, password, and remember me fields
   */
  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email field with validation
      password: ['', [Validators.required, Validators.minLength(6)]], // Password with min length
      remember: [false] // Remember me checkbox
    });
  }

  /**
   * Toggles password visibility in the input field
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles form submission and user authentication
   * Validates form, sends login request, and handles response
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Extract form data for login request
      const loginData: LoginDto = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          
          // Redirect to dashboard after successful login
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }
}
