import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  authForm: FormGroup;
  isLogin = true;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.authForm = this.createForm();
  }

  private createForm(): FormGroup {
    const baseForm = {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    };

    if (this.isLogin) {
      return this.fb.group({
        ...baseForm,
        remember: [false]
      });
    } else {
      return this.fb.group({
        ...baseForm,
        name: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.authForm = this.createForm();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      this.isLoading = true;
      
      // Simuliere API-Aufruf
      setTimeout(() => {
        console.log(this.isLogin ? 'Logging in...' : 'Registering...', this.authForm.value);
        this.isLoading = false;
        
        // Nach erfolgreichem Login/Registration zur Startseite
        this.router.navigate(['/']);
      }, 2000);
    }
  }

  loginWithDiscord(): void {
    console.log('Discord OAuth login would be initiated here');
    // Hier würdest du normalerweise den Discord OAuth Flow starten
    window.open('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=identify%20email', '_blank');
  }
}
