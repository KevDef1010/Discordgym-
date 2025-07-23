/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { FriendsService, Friend, UserSearchResult, FriendRequest, FriendStats } from '../../shared/services/friends.service';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.html',
  styleUrls: ['./friends.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  // Aktueller User (aus Authentication Service)
  currentUserId: string | null = null;

  // Tabs
  activeTab: 'friends' | 'search' | 'requests' = 'friends';

  // Freunde
  friends: Friend[] = [];
  friendsLoading = false;

  // Suche
  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  searchLoading = false;
  private searchSubject = new Subject<string>();

  // Anfragen
  pendingRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];
  requestsLoading = false;

  // Loading States für einzelne Aktionen
  sendingRequests = new Set<string>(); // Set von User IDs für die gerade Anfragen gesendet werden
  respondingToRequests = new Set<string>(); // Set von Friendship IDs für die gerade geantwortet wird
  removingFriends = new Set<string>(); // Set von Friend IDs die gerade entfernt werden

  // Statistiken
  stats: FriendStats = {
    friendsCount: 0,
    pendingRequestsCount: 0,
    sentRequestsCount: 0
  };

  constructor(
    private friendsService: FriendsService, 
    private authService: AuthService,
    private router: Router
  ) {
    // Search mit Debouncing einrichten
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 1 || !this.currentUserId) {
          return of([]);
        }
        this.searchLoading = true;
        return this.friendsService.searchUsers(this.currentUserId, query);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searchLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchLoading = false;
      }
    });
  }

  ngOnInit() {
    // User-ID aus AuthService holen
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // User ist nicht eingeloggt, zur Login-Seite umleiten
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUserId = currentUser.id;
    
    // Daten laden
    this.loadFriends();
    this.loadStats();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  // Tab wechseln
  switchTab(tab: 'friends' | 'search' | 'requests') {
    this.activeTab = tab;
    
    if (tab === 'friends') {
      this.loadFriends();
    } else if (tab === 'requests') {
      this.loadRequests();
    }
  }

  // Freunde laden
  loadFriends() {
    if (!this.currentUserId) return;
    
    this.friendsLoading = true;
    this.friendsService.getFriends(this.currentUserId).subscribe({
      next: (friends) => {
        this.friends = friends;
        this.friendsLoading = false;
      },
      error: (error) => {
        console.error('Error loading friends:', error);
        this.friendsLoading = false;
      }
    });
  }

  // Statistiken laden
  loadStats() {
    if (!this.currentUserId) return;
    
    this.friendsService.getFriendStats(this.currentUserId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  // Anfragen laden
  loadRequests() {
    if (!this.currentUserId) return;
    
    this.requestsLoading = true;
    
    Promise.all([
      this.friendsService.getPendingRequests(this.currentUserId).toPromise(),
      this.friendsService.getSentRequests(this.currentUserId).toPromise()
    ]).then(([pending, sent]) => {
      this.pendingRequests = pending || [];
      this.sentRequests = sent || [];
      this.requestsLoading = false;
    }).catch(error => {
      console.error('Error loading requests:', error);
      this.requestsLoading = false;
    });
  }

  // Suche ausführen
  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  // Freundschaftsanfrage senden
  sendFriendRequest(receiverId: string) {
    if (!this.currentUserId) return;
    
    // Prüfen ob bereits eine Anfrage läuft
    if (this.sendingRequests.has(receiverId)) {
      return; // Doppelte Anfrage verhindern
    }

    this.sendingRequests.add(receiverId);
    
    this.friendsService.sendFriendRequest(this.currentUserId, receiverId).subscribe({
      next: (response) => {
        console.log('Friend request sent:', response);
        // Suchresultate aktualisieren
        this.onSearchChange(this.searchQuery);
        this.loadStats();
        this.sendingRequests.delete(receiverId);
      },
      error: (error) => {
        console.error('Error sending friend request:', error);
        this.sendingRequests.delete(receiverId);
        // TODO: Toast/Notification für Fehler anzeigen
      }
    });
  }

  // Freundschaftsanfrage beantworten
  respondToRequest(friendshipId: string, status: 'ACCEPTED' | 'DECLINED') {
    if (!this.currentUserId) return;
    
    // Prüfen ob bereits eine Antwort läuft
    if (this.respondingToRequests.has(friendshipId)) {
      return; // Doppelte Antwort verhindern
    }

    this.respondingToRequests.add(friendshipId);

    this.friendsService.respondToFriendRequest(this.currentUserId, friendshipId, status).subscribe({
      next: (response) => {
        console.log('Friend request responded:', response);
        this.loadRequests();
        this.loadStats();
        if (status === 'ACCEPTED') {
          this.loadFriends();
        }
        this.respondingToRequests.delete(friendshipId);
      },
      error: (error) => {
        console.error('Error responding to friend request:', error);
        this.respondingToRequests.delete(friendshipId);
        // TODO: Toast/Notification für Fehler anzeigen
      }
    });
  }

  // Freund entfernen
  removeFriend(friendId: string) {
    if (!this.currentUserId) return;
    
    if (confirm('Bist du sicher, dass du diese Freundschaft beenden möchtest?')) {
      // Prüfen ob bereits eine Entfernung läuft
      if (this.removingFriends.has(friendId)) {
        return; // Doppelte Entfernung verhindern
      }

      this.removingFriends.add(friendId);

      this.friendsService.removeFriend(this.currentUserId, friendId).subscribe({
        next: (response) => {
          console.log('Friend removed:', response);
          this.loadFriends();
          this.loadStats();
          this.removingFriends.delete(friendId);
        },
        error: (error) => {
          console.error('Error removing friend:', error);
          this.removingFriends.delete(friendId);
          // TODO: Toast/Notification für Fehler anzeigen
        }
      });
    }
  }

  // Hilfsfunktionen
  getFriendshipStatusText(status: string): string {
    switch (status) {
      case 'NONE': return 'Freundschaft';
      case 'PENDING': return 'Anfrage gesendet';
      case 'SENT': return 'Anfrage gesendet';
      case 'RECEIVED': return 'Anfrage erhalten';
      case 'ACCEPTED': return 'Befreundet';
      case 'DECLINED': return 'Abgelehnt';
      case 'BLOCKED': return 'Blockiert';
      default: return status;
    }
  }

  getFriendshipStatusClass(status: string): string {
    switch (status) {
      case 'NONE': return 'bg-blue-500 hover:bg-blue-600';
      case 'PENDING': return 'bg-yellow-500 cursor-not-allowed';
      case 'SENT': return 'bg-yellow-500 cursor-not-allowed';
      case 'RECEIVED': return 'bg-green-500 hover:bg-green-600';
      case 'ACCEPTED': return 'bg-green-500 cursor-not-allowed';
      case 'DECLINED': return 'bg-red-500 cursor-not-allowed';
      case 'BLOCKED': return 'bg-red-500 cursor-not-allowed';
      default: return 'bg-gray-500';
    }
  }

  canSendRequest(status: string): boolean {
    return status === 'NONE';
  }

  // Loading-State Helper Funktionen
  isSendingRequest(userId: string): boolean {
    return this.sendingRequests.has(userId);
  }

  isRespondingToRequest(friendshipId: string): boolean {
    return this.respondingToRequests.has(friendshipId);
  }

  isRemovingFriend(friendId: string): boolean {
    return this.removingFriends.has(friendId);
  }

  // Button-State Helper
  isButtonDisabled(action: string, id: string, status?: string): boolean {
    switch (action) {
      case 'sendRequest':
        return this.isSendingRequest(id) || (status !== 'NONE' && status !== undefined);
      case 'respondRequest':
        return this.isRespondingToRequest(id);
      case 'removeFriend':
        return this.isRemovingFriend(id);
      default:
        return false;
    }
  }

  getDisplayName(user: any): string {
    return user.displayId || `@${user.username}`;
  }

  getAvatarUrl(user: any): string {
    return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  }
}
