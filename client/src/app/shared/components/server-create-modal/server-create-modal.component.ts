import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-server-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isVisible" class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Neuen Server erstellen</h3>
        
        <form (ngSubmit)="onSubmit()" #serverForm="ngForm">
          <div class="form-group">
            <label for="serverName">Server-Name *</label>
            <input 
              type="text" 
              id="serverName"
              name="serverName"
              [(ngModel)]="serverData.name"
              required
              minlength="3"
              maxlength="50"
              class="form-control"
              placeholder="Mein Gym Server"
              #nameInput="ngModel"
            >
            <div *ngIf="nameInput.invalid && nameInput.touched" class="error-message">
              <span *ngIf="nameInput.errors?.['required']">Server-Name ist erforderlich</span>
              <span *ngIf="nameInput.errors?.['minlength']">Mindestens 3 Zeichen erforderlich</span>
              <span *ngIf="nameInput.errors?.['maxlength']">Maximal 50 Zeichen erlaubt</span>
            </div>
          </div>

          <div class="form-group">
            <label for="serverDescription">Beschreibung (optional)</label>
            <textarea 
              id="serverDescription"
              name="serverDescription"
              [(ngModel)]="serverData.description"
              maxlength="200"
              class="form-control textarea"
              placeholder="Beschreibe deinen Server..."
              rows="3"
            ></textarea>
            <div class="char-counter">
              {{ (serverData.description || '').length }}/200
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="isPrivate"
                [(ngModel)]="serverData.isPrivate"
                class="checkbox"
              >
              <span class="checkmark"></span>
              Privater Server (nur per Einladung)
            </label>
            <div class="help-text">
              Private Server sind nur über Einladungslinks zugänglich
            </div>
          </div>

          <div class="modal-buttons">
            <button 
              type="button" 
              (click)="close()" 
              class="btn btn-secondary"
              [disabled]="isCreating">
              Abbrechen
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="serverForm.invalid || isCreating">
              {{ isCreating ? 'Erstelle...' : 'Server erstellen' }}
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

    h3 {
      color: #ffffff;
      margin: 0 0 20px 0;
      font-size: 1.25rem;
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

    .textarea {
      resize: vertical;
      min-height: 80px;
    }

    .char-counter {
      text-align: right;
      font-size: 12px;
      color: #72767d;
      margin-top: 4px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .checkbox {
      margin-right: 12px;
      width: 18px;
      height: 18px;
      accent-color: #7c3aed;
    }

    .help-text {
      font-size: 12px;
      color: #72767d;
      font-style: italic;
    }

    .error-message {
      color: #f87171;
      font-size: 12px;
      margin-top: 4px;
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
    }
  `]
})
export class ServerCreateModalComponent {
  @Input() isVisible = false;
  @Input() isCreating = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() createServer = new EventEmitter<{name: string, description?: string, isPrivate: boolean}>();

  serverData = {
    name: '',
    description: '',
    isPrivate: false
  };

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  onSubmit(): void {
    if (this.serverData.name.trim()) {
      this.createServer.emit({
        name: this.serverData.name.trim(),
        description: this.serverData.description.trim() || undefined,
        isPrivate: this.serverData.isPrivate
      });
    }
  }

  resetForm(): void {
    this.serverData = {
      name: '',
      description: '',
      isPrivate: false
    };
  }
}
