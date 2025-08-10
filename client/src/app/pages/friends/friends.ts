/**
 * Friends Component
 * 
 * Comprehensive friends management system with real-time features.
 * Handles friend relationships, user search, friend requests, and online presence.
 * 
 * Features:
 * - Friends list with online status
 * - User search with debounced input
 * - Friend request management (send/receive/accept/decline)
 * - Real-time notifications via WebSocket
 * - Online presence and status management
 * - Direct message integration
 * - Friend statistics and activity tracking
 * 
 * @author DiscordGym Team
 */
/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, Subscription } from 'rxjs';
import { FriendsService, Friend, UserSearchResult, FriendRequest, FriendStats } from '../../shared/services/friends.service';
import { AuthService } from '../../shared/services/auth.service';
import { SocketService, FriendRequestNotification, OnlineUser, Notification as SocketNotification } from '../../shared/services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.html',
  styleUrls: ['./friends.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  // ===== USER AUTHENTICATION =====
  currentUserId: string | null = null; // Current authenticated user ID

  // ===== REAL-TIME SOCKET CONNECTIONS =====
  private socketSubscriptions: Subscription[] = []; // Socket subscription cleanup
  notifications: SocketNotification[] = []; // Real-time notification queue
  onlineUsers: OnlineUser[] = []; // List of currently online users
  currentUserStatus: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' = 'ONLINE'; // User's current status
  showStatusSelector = false; // Status selector dropdown visibility
  isSocketConnected = false; // Socket connection state indicator

  // ===== TAB NAVIGATION =====
  activeTab: 'friends' | 'search' | 'requests' = 'friends'; // Current active tab

  // ===== FRIENDS MANAGEMENT =====
  friends: Friend[] = []; // User's friend list
  friendsLoading = false; // Loading state for friends list

  // ===== USER SEARCH FUNCTIONALITY =====
  searchQuery = ''; // Current search input
  searchResults: UserSearchResult[] = []; // Search results from API
  searchLoading = false; // Loading state for search operations
  private searchSubject = new Subject<string>(); // Debounced search input stream

  // ===== FRIEND REQUESTS =====
  pendingRequests: FriendRequest[] = []; // Incoming friend requests
  sentRequests: FriendRequest[] = []; // Outgoing friend requests
  requestsLoading = false; // Loading state for request operations

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

  // Group Invite Modal Properties
  showGroupInviteModalFlag = false;
  selectedFriendForInvite: any = null;
  selectedGroupForInvite: any = null;
  availableGroups: any[] = [];
  inviteMessage = '';
  isInviting = false;

  constructor(
    private friendsService: FriendsService, 
    private authService: AuthService,
    public socketService: SocketService, // Public für Template Zugriff
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
    
    // Socket.IO Verbindung initialisieren mit User Info
    this.initializeEnhancedSocket();
    
    // Daten laden
    this.loadFriends();
    this.loadStats();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    
    // Socket.IO Subscriptions aufräumen
    this.socketSubscriptions.forEach(sub => sub.unsubscribe());
    // Nicht disconnect - Socket kann für andere Components weiterlaufen
    // this.socketService.disconnect();
  }

  // Enhanced Socket.IO initialisieren
  private initializeEnhancedSocket() {
    if (!this.currentUserId) return;

    const currentUser = this.authService.getCurrentUser();
    
    // Load stored status from localStorage
    const storedStatus = localStorage.getItem(`userStatus_${this.currentUserId}`) || 'ONLINE';
    this.currentUserStatus = storedStatus as any;
    
    // Enhanced Socket Connection mit User Info
    if (this.currentUserId) {
      this.socketService.connect(
        parseInt(this.currentUserId), 
        currentUser?.username || 'Unknown User',
        currentUser?.avatar
      );
    }

    // Connection Status überwachen
    const connectionSub = this.socketService.connected$.subscribe(connected => {
      this.isSocketConnected = connected;
      if (connected) {
        console.log('✅ Socket connected - requesting online friends');
        setTimeout(() => {
          this.socketService.getOnlineFriends();
          // Refresh online friends every 30 seconds
          setInterval(() => {
            if (this.isSocketConnected) {
              this.socketService.getOnlineFriends();
            }
          }, 30000);
        }, 1000);
      }
    });
    this.socketSubscriptions.push(connectionSub);

    // Current User Status überwachen
    const statusSub = this.socketService.currentUserStatus$.subscribe(status => {
      this.currentUserStatus = status as any;
      console.log('📊 Current user status updated:', status);
      // Update localStorage when status changes
      if (this.currentUserId) {
        localStorage.setItem(`userStatus_${this.currentUserId}`, status);
      }
    });
    this.socketSubscriptions.push(statusSub);

    // Online Users überwachen
    const onlineUsersSub = this.socketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
      console.log('👥 Online users updated:', users);
      this.updateFriendsOnlineStatus(users);
      // Force change detection by updating the friends array reference
      this.friends = [...this.friends];
    });
    this.socketSubscriptions.push(onlineUsersSub);

    // Enhanced Notifications überwachen
    const notificationSub = this.socketService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    this.socketSubscriptions.push(notificationSub);
  }
  // Real-time Benachrichtigungen verarbeiten
  private handleRealTimeNotification(notification: SocketNotification) {
    console.log('📱 Real-time notification:', notification);
    
    // Notification zur Liste hinzufügen
    this.notifications.unshift(notification);
    
    // Nach 5 Sekunden automatisch entfernen
    setTimeout(() => {
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 5000);

    switch (notification.type) {
      case 'FRIEND_REQUEST':
        // Neue Freundschaftsanfrage erhalten
        this.loadRequests(); // Requests neu laden
        this.loadStats(); // Stats aktualisieren
        break;
        
      case 'FRIEND_REQUEST_RESPONSE':
        // Antwort auf Friend Request
        if (notification.status === 'ACCEPTED') {
          this.loadFriends(); // Freunde neu laden wenn akzeptiert
        }
        this.loadRequests(); // Requests neu laden
        this.loadStats(); // Stats aktualisieren
        break;
        
      case 'FRIEND_ONLINE':
        // Friend kam online - Optional: Online-Status in UI anzeigen
        break;
        
      case 'FRIEND_OFFLINE':
        // Friend ging offline - Optional: Offline-Status in UI anzeigen
        break;
    }
  }

  // Notification entfernen
  removeNotification(notification: SocketNotification) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
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

  // Enhanced Status Methods
  updateFriendsOnlineStatus(onlineUsers: OnlineUser[]): void {
    if (!this.friends) return;

    console.log('🔄 Updating friends online status:', { friends: this.friends.length, onlineUsers: onlineUsers.length });

    this.friends.forEach(friend => {
      const onlineUser = onlineUsers.find(u => u.userId === parseInt(friend.id.toString()));
      if (onlineUser) {
        (friend as any).isOnline = onlineUser.isOnline;
        (friend as any).status = onlineUser.status;
        (friend as any).lastSeen = onlineUser.lastSeen;
        (friend as any).lastActivity = onlineUser.lastActivity;
        console.log(`👤 Updated friend ${friend.id}: ${onlineUser.status} (${onlineUser.isOnline ? 'online' : 'offline'})`);
      } else {
        (friend as any).isOnline = false;
        (friend as any).status = 'OFFLINE';
        console.log(`👤 Friend ${friend.id} set to offline (not found in online users)`);
      }
    });
  }

  changeUserStatus(newStatus: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB'): void {
    this.currentUserStatus = newStatus;
    this.socketService.updateStatus(newStatus);
    this.showStatusSelector = false;
    
    // Request updated online friends list after status change
    setTimeout(() => {
      this.socketService.getOnlineFriends();
    }, 500);
  }

  toggleStatusSelector(): void {
    this.showStatusSelector = !this.showStatusSelector;
  }

  // Status Display Methods
  getStatusText(status: string): string {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'AWAY': return 'Abwesend';
      case 'DO_NOT_DISTURB': return 'Nicht stören';
      default: return 'Offline';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ONLINE': return 'border-green-500 text-green-700';
      case 'AWAY': return 'border-yellow-500 text-yellow-700';
      case 'DO_NOT_DISTURB': return 'border-red-500 text-red-700';
      default: return 'border-gray-500 text-gray-700';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'ONLINE': return 'bg-green-500 status-online';
      case 'AWAY': return 'bg-yellow-500 status-away';
      case 'DO_NOT_DISTURB': return 'bg-red-500 status-dnd';
      case 'OFFLINE':
      default: return 'bg-gray-500 status-offline';
    }
  }

  formatLastSeen(lastSeen: string): string {
    return this.socketService.formatLastSeen(lastSeen);
  }

  // Profile View Method
  viewProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  // Check Friend Status
  checkFriendStatus(friendId: string): void {
    this.socketService.requestFriendStatus(friendId);
  }

  // Get Online Users Count
  getOnlineUsersCount(): number {
    return this.onlineUsers.filter(user => user.isOnline).length;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.socketService.isUserOnline(userId);
  }

  // Get user online status
  getUserOnlineStatus(userId: string): OnlineUser | null {
    return this.socketService.getUserStatus(userId);
  }

  // TrackBy Funktion für Notifications
  trackNotification(index: number, notification: SocketNotification): string {
    return notification.timestamp.toString();
  }

  // TrackBy Funktion für Friends
  trackFriend(index: number, friendship: any): string {
    return friendship.friend?.id || friendship.id || index.toString();
  }

  // Direct Message Functionality
  startDirectMessage(friend: any): void {
    console.log('Starting direct message with:', friend.username);
    // Navigate to chat with pre-selected direct message
    this.router.navigate(['/chat'], { 
      queryParams: { 
        dm: friend.id,
        username: friend.username 
      }
    });
  }

  // Group Invite Modal Methods
  showGroupInviteModal(friend: any): void {
    this.selectedFriendForInvite = friend;
    this.showGroupInviteModalFlag = true;
    this.loadAvailableGroups();
  }

  closeGroupInviteModal(): void {
    this.showGroupInviteModalFlag = false;
    this.selectedFriendForInvite = null;
    this.selectedGroupForInvite = null;
    this.inviteMessage = '';
    this.isInviting = false;
  }

  selectGroupForInvite(group: any): void {
    this.selectedGroupForInvite = group;
  }

  async loadAvailableGroups(): Promise<void> {
    try {
      // In a real implementation, this would fetch from a chat service
      // For now, we'll use mock data or try to get from chat service
      console.log('Loading available groups...');
      
      // Mock data for demonstration
      this.availableGroups = [
        {
          id: '1',
          name: 'Fitness Buddies',
          description: 'Gemeinsam fit werden!',
          memberCount: 12,
          isPrivate: false
        },
        {
          id: '2',
          name: 'Workout Squad',
          description: 'Tägliche Motivation und Workouts',
          memberCount: 8,
          isPrivate: false
        },
        {
          id: '3',
          name: 'Gym Gang',
          description: 'Alles rund ums Gym',
          memberCount: 15,
          isPrivate: true
        }
      ];
      
      // TODO: Replace with actual API call
      // this.availableGroups = await this.chatService.getUserServers();
      
    } catch (error) {
      console.error('Error loading available groups:', error);
      this.availableGroups = [];
    }
  }

  async sendGroupInvite(): Promise<void> {
    if (!this.selectedGroupForInvite || !this.selectedFriendForInvite || this.isInviting) {
      return;
    }

    try {
      this.isInviting = true;
      
      // TODO: Implement actual group invite API call
      console.log('Sending group invite:', {
        friendId: this.selectedFriendForInvite.id,
        groupId: this.selectedGroupForInvite.id,
        message: this.inviteMessage
      });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message (you could use a toast service here)
      alert(`Einladung an ${this.selectedFriendForInvite.username} für "${this.selectedGroupForInvite.name}" wurde gesendet!`);
      
      this.closeGroupInviteModal();
      
    } catch (error) {
      console.error('Error sending group invite:', error);
      alert('Fehler beim Senden der Einladung. Bitte versuche es erneut.');
    } finally {
      this.isInviting = false;
    }
  }
}
