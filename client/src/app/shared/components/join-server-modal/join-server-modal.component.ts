import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join-server-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isVisible" class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Server beitreten</h3>
        
        <div class="info-section">
          <div class="info-icon">🔗</div>
          <p>Gib einen Einladungslink oder Einladungscode ein, um einem Server beizutreten.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #joinForm="ngForm">
          <div class="form-group">
            <label for="inviteCode">Einladungslink oder Code</label>
            <input 
              type="text" 
              id="inviteCode"
              name="inviteCode"
              [(ngModel)]="inviteCode"
              required
              class="form-control"
              placeholder="https://discordgym.com/invite/ABC123 oder ABC123"
              #codeInput="ngModel"
              (input)="onInputChange()"
            >
            <div *ngIf="codeInput.invalid && codeInput.touched" class="error-message">
              Einladungscode ist erforderlich
            </div>
            <div *ngIf="parsedCode" class="parsed-code">
              Erkannter Code: <strong>{{ parsedCode }}</strong>
            </div>
          </div>

          <div *ngIf="inviteInfo" class="invite-preview">
            <h4>Server-Vorschau</h4>
            <div class="server-card">
              <div class="server-avatar">
                <img 
                  *ngIf="inviteInfo.server?.avatar" 
                  [src]="inviteInfo.server.avatar" 
                  [alt]="inviteInfo.server?.name"
                  class="avatar-img"
                >
                <div *ngIf="!inviteInfo.server?.avatar" class="avatar-placeholder">
                  {{ getServerInitials(inviteInfo.server?.name) }}
                </div>
              </div>
              <div class="server-info">
                <div class="server-name">{{ inviteInfo.server?.name || 'Unbekannter Server' }}</div>
                <div class="server-description" *ngIf="inviteInfo.server?.description">
                  {{ inviteInfo.server.description }}
                </div>
                <div class="invite-details">
                  <span class="member-count" *ngIf="inviteInfo.memberCount">
                    👥 {{ inviteInfo.memberCount }} Mitglieder
                  </span>
                  <span class="invite-creator" *ngIf="inviteInfo.createdBy">
                    Eingeladen von: {{ inviteInfo.createdBy.username }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ errorMessage }}</div>
          </div>

          <div class="modal-buttons">
            <button 
              type="button" 
              (click)="close()" 
              class="btn btn-secondary"
              [disabled]="isJoining">
              Abbrechen
            </button>
            <button 
              type="button"
              (click)="previewInvite()"
              class="btn btn-outline"
              [disabled]="!parsedCode || isLoadingPreview">
              {{ isLoadingPreview ? 'Lade...' : 'Vorschau' }}
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!parsedCode || isJoining">
              {{ isJoining ? 'Trete bei...' : 'Beitreten' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background-color: #36393f;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
      color: white;
    }

    h3, h4 {
      color: #ffffff;
      margin: 0 0 16px 0;
    }

    .info-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background-color: #2f3136;
      border-radius: 8px;
      border-left: 4px solid #7c3aed;
    }

    .info-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .info-section p {
      margin: 0;
      color: #b9bbbe;
      font-size: 14px;
      line-height: 1.4;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      color: #b9bbbe;
      font-weight: 500;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #40444b;
      border-radius: 8px;
      background-color: #40444b;
      color: #dcddde;
      font-size: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    }

    .parsed-code {
      margin-top: 8px;
      font-size: 12px;
      color: #10b981;
    }

    .error-message {
      color: #f87171;
      font-size: 12px;
      margin-top: 4px;
    }

    .invite-preview {
      margin: 20px 0;
      padding: 16px;
      background-color: #2f3136;
      border-radius: 8px;
      border: 1px solid #40444b;
    }

    .server-card {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .server-avatar {
      flex-shrink: 0;
    }

    .avatar-img {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background-color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
      color: white;
    }

    .server-info {
      flex: 1;
      min-width: 0;
    }

    .server-name {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .server-description {
      color: #b9bbbe;
      font-size: 14px;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .invite-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: #72767d;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background-color: rgba(248, 113, 113, 0.1);
      border: 1px solid #f87171;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .error-icon {
      font-size: 18px;
      color: #f87171;
    }

    .error-text {
      color: #f87171;
      font-size: 14px;
    }

    .modal-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .btn-primary {
      background-color: #7c3aed;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #6d28d9;
    }

    .btn-primary:disabled {
      background-color: #4f545c;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #4f545c;
      color: #b9bbbe;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #5865f2;
      color: white;
    }

    .btn-outline {
      background-color: transparent;
      color: #7c3aed;
      border: 1px solid #7c3aed;
    }

    .btn-outline:hover:not(:disabled) {
      background-color: #7c3aed;
      color: white;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        transform: translateY(-20px); 
        opacity: 0; 
      }
      to { 
        transform: translateY(0); 
        opacity: 1; 
      }
    }

    @media (max-width: 640px) {
      .modal-content {
        padding: 20px;
        margin: 16px;
      }

      .modal-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .server-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class JoinServerModalComponent {
  @Input() isVisible = false;
  @Input() isJoining = false;
  @Input() isLoadingPreview = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() joinServer = new EventEmitter<string>();
  @Output() previewInviteEvent = new EventEmitter<string>();

  inviteCode = '';
  parsedCode = '';
  inviteInfo: any = null;
  errorMessage = '';

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  onInputChange(): void {
    this.parsedCode = this.extractInviteCode(this.inviteCode);
    this.errorMessage = '';
    this.inviteInfo = null;
  }

  extractInviteCode(input: string): string {
    if (!input) return '';
    
    // Remove whitespace
    input = input.trim();
    
    // Extract from URL
    const urlMatch = input.match(/(?:https?:\/\/)?(?:www\.)?[^\/]*\/invite\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Direct code
    const codeMatch = input.match(/^([a-zA-Z0-9]+)$/);
    if (codeMatch) {
      return codeMatch[1];
    }
    
    return input;
  }

  previewInvite(): void {
    if (this.parsedCode) {
      this.previewInviteEvent.emit(this.parsedCode);
    }
  }

  onSubmit(): void {
    if (this.parsedCode) {
      this.joinServer.emit(this.parsedCode);
    }
  }

  getServerInitials(name?: string): string {
    if (!name) return 'S';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  setInviteInfo(info: any): void {
    this.inviteInfo = info;
  }

  setErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  resetForm(): void {
    this.inviteCode = '';
    this.parsedCode = '';
    this.inviteInfo = null;
    this.errorMessage = '';
  }
}
