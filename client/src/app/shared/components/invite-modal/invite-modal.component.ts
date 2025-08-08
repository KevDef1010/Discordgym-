import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ServerInvite {
  id: number;
  code: string;
  chatServer?: { name: string };
  invitedBy?: { username: string };
  expiresAt: string;
  maxUses?: number;
  uses: number;
}

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Server-Einladungen verwalten</h3>
        
        <!-- Create New Invite Section -->
        <div class="invite-section">
          <h4>Neue Einladung erstellen</h4>
          <div class="form-group">
            <label for="maxUses">Maximale Verwendungen (optional):</label>
            <input 
              type="number" 
              id="maxUses"
              [(ngModel)]="newInviteMaxUses" 
              min="1" 
              max="100"
              class="form-control"
              placeholder="Unbegrenzt"
            >
          </div>
          <div class="form-group">
            <label for="expiresIn">Läuft ab in (Stunden, optional):</label>
            <input 
              type="number" 
              id="expiresIn"
              [(ngModel)]="newInviteExpiresIn" 
              min="1" 
              max="168"
              class="form-control"
              placeholder="24"
            >
          </div>
          <button 
            (click)="createInvite()" 
            [disabled]="isCreatingInvite"
            class="btn btn-primary">
            {{ isCreatingInvite ? 'Erstelle...' : 'Einladung erstellen' }}
          </button>
        </div>

        <!-- Existing Invites Section -->
        <div class="invite-section" *ngIf="invites.length > 0">
          <h4>Bestehende Einladungen</h4>
          <div class="invites-list">
            <div *ngFor="let invite of invites" class="invite-item">
              <div class="invite-info">
                <div class="invite-code">
                  <strong>Code:</strong> {{ invite.code }}
                </div>
                <div class="invite-details">
                  <span>Verwendet: {{ invite.uses }}{{ invite.maxUses ? '/' + invite.maxUses : '' }}</span>
                  <span *ngIf="invite.expiresAt">
                    Läuft ab: {{ invite.expiresAt | date:'dd.MM.yyyy HH:mm' }}
                  </span>
                </div>
              </div>
              <div class="invite-actions">
                <button 
                  (click)="copyInviteLink(invite.code)"
                  [class.copy-success]="copiedCode === invite.code"
                  class="btn btn-secondary btn-sm">
                  {{ copiedCode === invite.code ? 'Kopiert!' : 'Kopieren' }}
                </button>
                <button 
                  (click)="deleteInvite(invite.id)"
                  class="btn btn-danger btn-sm">
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Invites Message -->
        <div *ngIf="invites.length === 0" class="no-invites">
          <p>Keine aktiven Einladungen vorhanden.</p>
        </div>

        <!-- Modal Actions -->
        <div class="modal-buttons">
          <button (click)="close()" class="btn btn-secondary">Schließen</button>
        </div>
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
      max-width: 600px;
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

    .invite-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #40444b;
    }

    .invite-section:last-of-type {
      border-bottom: none;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      color: #b9bbbe;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #40444b;
      border-radius: 6px;
      background-color: #40444b;
      color: #dcddde;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    }

    .invites-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .invite-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #2f3136;
      border-radius: 8px;
      border: 1px solid #40444b;
    }

    .invite-info {
      flex: 1;
    }

    .invite-code {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .invite-details {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #72767d;
    }

    .invite-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-primary {
      background-color: #7c3aed;
      color: white;
    }

    .btn-primary:hover {
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

    .btn-secondary:hover {
      background-color: #5865f2;
      color: white;
    }

    .btn-danger {
      background-color: #f87171;
      color: white;
    }

    .btn-danger:hover {
      background-color: #ef4444;
    }

    .copy-success {
      background-color: #10b981 !important;
      color: white !important;
    }

    .no-invites {
      text-align: center;
      padding: 20px;
      color: #72767d;
    }

    .modal-buttons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      justify-content: flex-end;
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

      .invite-item {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .invite-actions {
        justify-content: center;
      }
    }
  `]
})
export class InviteModalComponent {
  @Input() isVisible = false;
  @Input() serverId: string | null = null;
  @Input() invites: ServerInvite[] = [];
  @Input() isCreatingInvite = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() createInviteEvent = new EventEmitter<{maxUses?: number, expiresIn?: number}>();
  @Output() copyInviteEvent = new EventEmitter<string>();
  @Output() deleteInviteEvent = new EventEmitter<number>();

  newInviteMaxUses: number | null = null;
  newInviteExpiresIn: number | null = null;
  copiedCode: string | null = null;

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  createInvite(): void {
    this.createInviteEvent.emit({
      maxUses: this.newInviteMaxUses || undefined,
      expiresIn: this.newInviteExpiresIn || undefined
    });
    
    // Reset form
    this.newInviteMaxUses = null;
    this.newInviteExpiresIn = null;
  }

  copyInviteLink(code: string): void {
    this.copyInviteEvent.emit(code);
    this.copiedCode = code;
    setTimeout(() => this.copiedCode = null, 2000);
  }

  deleteInvite(inviteId: number): void {
    this.deleteInviteEvent.emit(inviteId);
  }
}
