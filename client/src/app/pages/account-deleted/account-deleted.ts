import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-deleted',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-deleted.html',
  styleUrls: ['./account-deleted.scss']
})
export class AccountDeletedComponent implements OnInit, OnDestroy {
  countdown: number = 10;
  private countdownInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      // Update countdown in DOM
      const countdownElement = document.querySelector('.countdown');
      if (countdownElement) {
        countdownElement.textContent = this.countdown.toString();
      }
      
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  goToHome(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/']);
  }
}
