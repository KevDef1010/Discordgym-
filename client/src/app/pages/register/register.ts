/**
 * Register Component
 * 
 * Handles user registration with comprehensive form validation.
 * Provides account creation functionality with password confirmation,
 * terms acceptance, and detailed error handling.
 * 
 * Features:
 * - Reactive form with advanced validation
 * - Password confirmation matching
 * - Password visibility toggles
 * - Terms and conditions acceptance
 * - Avatar generation with user initials
 * - Automatic redirection after registration
 * 
 * @author DiscordGym Team
 */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterDto } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  // Form and UI state
  registerForm: FormGroup; // Reactive form for registration data
  showPassword = false; // Toggle for password visibility
  showConfirmPassword = false; // Toggle for confirm password visibility
  isLoading = false; // Loading state during registration
  errorMessage = ''; // Error message display
  successMessage = ''; // Success message display

  /**
   * Constructor - Initialize the registration component
   * @param fb - Angular FormBuilder for reactive forms
   * @param router - Angular Router for navigation
   * @param authService - Authentication service for registration operations
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.createForm();
  }

  /**
   * Creates the reactive form with comprehensive validation rules
   * @returns FormGroup with all registration fields and custom validators
   */
  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]], // Username with length validation
      email: ['', [Validators.required, Validators.email]], // Email field with format validation
      password: ['', [Validators.required, Validators.minLength(6)]], // Password with min length requirement
      confirmPassword: ['', [Validators.required]], // Password confirmation field
      acceptTerms: [false, [Validators.requiredTrue]] // Terms acceptance (required)
    }, { validators: this.passwordMatchValidator }); // Apply custom password matching validator
  }

  /**
   * Custom validator to ensure password and confirm password match
   * @param form - The FormGroup containing password fields
   * @returns null (validation handled by setting field errors directly)
   */
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    // Check if passwords match and set error accordingly
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.registerForm.value;
      const registerData: RegisterDto = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formValue.username}`
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          
          // Redirect to dashboard after successful registration
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error('Registration error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Discord ID must be 17-19 digits';
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }
}
