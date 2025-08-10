/**
 * Server Members Modal Component
 * 
 * Modal component for viewing and managing server members.
 * Allows server owners and admins to remove members from the server.
 * 
 * Features:
 * - Display all server members with roles
 * - Remove/kick members (admin/owner only)
 * - Leave server option for regular members
 * - Role-based UI (different options based on user permissions)
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ServerMember } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-server-members-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
         (click)="closeModal()">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900">Server-Mitglieder</h2>
            <button (click)="closeModal()" 
                    class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-1">{{ members.length }} Mitglieder insgesamt</p>
        </div>

        <!-- Members List -->
        <div class="p-4 max-h-96 overflow-y-auto">
          <div *ngIf="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p class="text-gray-500 mt-2">Lade Mitglieder...</p>
          </div>

          <div *ngIf="!loading && members.length === 0" class="text-center py-8">
            <p class="text-gray-500">Keine Mitglieder gefunden</p>
          </div>

          <div *ngIf="!loading && members.length > 0" class="space-y-2">
            <div *ngFor="let member of members" 
                 class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <!-- Member Info -->
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <img *ngIf="member.avatar" 
                       [src]="member.avatar" 
                       [alt]="member.username"
                       class="w-10 h-10 rounded-full object-cover">
                  <div *ngIf="!member.avatar" 
                       class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {{ member.username.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ member.username }}</p>
                    <span *ngIf="member.isOwner" 
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Besitzer
                    </span>
                    <span *ngIf="member.role === 'ADMIN' && !member.isOwner" 
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                    <span *ngIf="member.role === 'MEMBER'" 
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Mitglied
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">Beigetreten: {{ formatDate(member.joinedAt) }}</p>
                  <div class="flex items-center space-x-1 mt-1">
                    <div [class]="member.isActive ? 'w-2 h-2 bg-green-400 rounded-full' : 'w-2 h-2 bg-gray-400 rounded-full'"></div>
                    <span class="text-xs text-gray-500">{{ member.isActive ? 'Online' : 'Offline' }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2">
                <!-- Show kick button for admins/owners -->
                <button *ngIf="canRemoveMember(member)" 
                        (click)="confirmRemoveMember(member)"
                        class="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Mitglied entfernen">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-between">
            <button *ngIf="!isCurrentUserOwner" 
                    (click)="confirmLeaveServer()"
                    class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors">
              Server verlassen
            </button>
            <div *ngIf="isCurrentUserOwner" class="text-sm text-gray-500">
              Als Besitzer können Sie den Server nicht verlassen
            </div>
            <button (click)="closeModal()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Member Removal -->
    <div *ngIf="memberToRemove" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Mitglied entfernen</h3>
          <p class="text-sm text-gray-500 mb-6">
            Sind Sie sicher, dass Sie <strong>{{ memberToRemove.username }}</strong> aus dem Server entfernen möchten?
          </p>
          <div class="flex justify-end space-x-3">
            <button (click)="cancelRemoveMember()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Abbrechen
            </button>
            <button (click)="removeMember()" 
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
              Entfernen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Leaving Server -->
    <div *ngIf="showLeaveConfirmation" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Server verlassen</h3>
          <p class="text-sm text-gray-500 mb-6">
            Sind Sie sicher, dass Sie diesen Server verlassen möchten?
          </p>
          <div class="flex justify-end space-x-3">
            <button (click)="cancelLeaveServer()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Abbrechen
            </button>
            <button (click)="leaveServer()" 
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
              Server verlassen
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ServerMembersModalComponent implements OnInit {
  @Input() serverId: string = '';
  @Input() currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER';
  @Output() close = new EventEmitter<void>();
  @Output() memberRemoved = new EventEmitter<ServerMember>();
  @Output() leftServer = new EventEmitter<void>();

  members: ServerMember[] = [];
  loading = true;
  memberToRemove: ServerMember | null = null;
  showLeaveConfirmation = false;
  currentUserId: string | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    this.loadMembers();
  }

  async loadMembers() {
    try {
      this.loading = true;
      this.members = await this.chatService.getServerMembers(this.serverId);
    } catch (error) {
      console.error('Fehler beim Laden der Mitglieder:', error);
    } finally {
      this.loading = false;
    }
  }

  get isCurrentUserOwner(): boolean {
    return this.currentUserRole === 'OWNER';
  }

  get isCurrentUserAdmin(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'OWNER';
  }

  canRemoveMember(member: ServerMember): boolean {
    // Can't remove yourself
    if (member.userId === this.currentUserId) {
      return false;
    }
    
    // Can't remove the owner
    if (member.isOwner) {
      return false;
    }
    
    // Only owners and admins can remove members
    if (!this.isCurrentUserAdmin) {
      return false;
    }
    
    // Admins can't remove other admins (only owner can)
    if (member.role === 'ADMIN' && this.currentUserRole !== 'OWNER') {
      return false;
    }
    
    return true;
  }

  confirmRemoveMember(member: ServerMember) {
    this.memberToRemove = member;
  }

  cancelRemoveMember() {
    this.memberToRemove = null;
  }

  async removeMember() {
    if (!this.memberToRemove) return;

    try {
      await this.chatService.removeUserFromServer(this.serverId, this.memberToRemove.userId);
      
      // Remove from local list
      this.members = this.members.filter(m => m.id !== this.memberToRemove!.id);
      
      this.memberRemoved.emit(this.memberToRemove);
      this.memberToRemove = null;
      
      // Show success message (you might want to use a toast service)
      console.log('Mitglied erfolgreich entfernt');
    } catch (error) {
      console.error('Fehler beim Entfernen des Mitglieds:', error);
    }
  }

  confirmLeaveServer() {
    this.showLeaveConfirmation = true;
  }

  cancelLeaveServer() {
    this.showLeaveConfirmation = false;
  }

  async leaveServer() {
    try {
      await this.chatService.leaveServer(this.serverId);
      this.leftServer.emit();
      this.closeModal();
      
      // Show success message
      console.log('Server erfolgreich verlassen');
    } catch (error) {
      console.error('Fehler beim Verlassen des Servers:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  closeModal() {
    this.close.emit();
  }
}
