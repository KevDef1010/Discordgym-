import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../shared/services/auth.service';
import { SocketService, OnlineUser } from '../../shared/services/socket.service';
import { ChatService } from '../../shared/services/chat.service';
import { 
  InviteModalComponent, 
  ServerCreateModalComponent, 
  JoinServerModalComponent 
} from '../../shared/components';

// Simplified interfaces for the component
interface ChatServer {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  channels: ChatChannel[];
  memberCount?: number;
  _count?: {
    members: number;
  };
}

interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  sender?: {
    id: string;
    username: string;
    avatar?: string;
  };
  channelId?: string;
  receiverId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isEdited: boolean;
  createdAt: string;
  reactions: MessageReaction[];
}

interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user?: {
    username: string;
  };
}

interface DirectMessage {
  userId: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule, 
    FormsModule,
    InviteModalComponent,
    ServerCreateModalComponent,
    JoinServerModalComponent
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  // Component state
  activeTab: 'direct' | 'servers' = 'direct';
  currentUser: User | null = null;
  isLoading = false;
  
  // Chat data
  chatServers: ChatServer[] = [];
  directMessages: DirectMessage[] = [];
  availableFriends: any[] = []; // All friends available for new chats
  messages: ChatMessage[] = [];
  onlineUsers: OnlineUser[] = [];
  typingUsers: string[] = [];
  
  // Selected items
  selectedServer: ChatServer | null = null;
  selectedChannel: ChatChannel | null = null;
  selectedDirectMessage: DirectMessage | null = null;
  
  // Message input
  newMessage = '';
  
  // Modal states
  showServerModal = false;
  showChannelModal = false;
  showFriendChatModal = false;
  showInviteModal = false;
  showJoinServerModal = false;
  
  // Loading states
  isCreatingServer = false;
  isJoiningServer = false;
  isLoadingInvitePreview = false;
  isCreatingInvite = false;
  
  // New server/channel form data
  newServerName = '';
  newServerDescription = '';
  newServerPrivate = false;
  newChannelName = '';
  newChannelDescription = '';
  newChannelPrivate = false;

  // Invite system
  serverInvites: any[] = [];
  newInviteMaxUses?: number;
  newInviteExpiresHours?: number;
  createdInviteCode = '';
  
  // Pagination and infinite scroll
  messageLimit = 20; // Messages per page
  currentPage = 0;
  hasMoreMessages = true;
  isLoadingMoreMessages = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private typingTimeout: any;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user once directly without subscribing
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      // Temporary fallback for testing - use a test user
      this.currentUser = {
        id: 'cme2ud8l10000fa4sdnq79fs9', // FitnessKing test user
        username: 'FitnessKing',
        email: 'king@discordgym.com',
        avatar: 'https://example.com/avatar1.png',
        discordId: '111111111111111111',
        role: 'MEMBER',
        isActive: true,
        createdAt: '2025-08-08T13:08:21.302Z'
      };
      console.log('Using test user for chat functionality:', this.currentUser);
    }
    
    // Clear URL parameters first thing to prevent loops
    const url = new URL(window.location.href);
    const dmUserId = url.searchParams.get('dm');
    const dmUsername = url.searchParams.get('username');
    
    // Always clear URL params to prevent loops
    if (url.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Load data first
    this.loadChatData().then(() => {
      // Then handle direct message parameters if they exist
      if (dmUserId && dmUsername && dmUserId !== this.currentUser?.id) {
        this.handleDirectMessageFromUrl(dmUserId, dmUsername);
      }
    });
    
    // Set up socket listeners
    this.setupSocketListeners();
  }
  
  private async handleDirectMessageFromUrl(userId: string, username: string): Promise<void> {
    // Switch to direct message tab
    this.activeTab = 'direct';
    
    // Prevent processing if this is the current user (would cause a loop)
    if (this.currentUser && userId === this.currentUser.id) {
      console.log('Avoiding self-chat loop');
      return;
    }
    
    // Check if user is already in direct messages list
    const existingDM = this.directMessages.find(dm => dm.userId === userId);
    
    if (existingDM) {
      // Select existing chat
      this.selectDirectMessage(existingDM);
    } else {
      // Create a new direct message entry
      try {
        const chatUser = await this.chatService.getOrCreateDirectChat(userId);
        const newDM: DirectMessage = {
          userId: userId,
          username: username || chatUser.username,
          avatar: chatUser.avatar,
          unreadCount: 0
        };
        this.directMessages.push(newDM);
        this.selectDirectMessage(newDM);
      } catch (error) {
        console.error('Error creating direct chat:', error);
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Leave current room
    this.leaveCurrentRoom();
  }

  private async loadChatData(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      this.isLoading = true;
      
      // Load user's servers
      const servers = await this.chatService.getUserServers();
      this.chatServers = servers as ChatServer[];
      
      // Load direct messages
      await this.loadDirectMessages();
      
      // Get online users (simplified approach)
      this.socketService.onlineUsers$.subscribe(users => {
        this.onlineUsers = users;
      });
      
      // Connect to chat socket and join chat
      this.connectToChat();
      
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private connectToChat(): void {
    if (!this.currentUser) return;
    
    // Connect to the chat socket
    this.socketService.connectToChat();
    
    // Set up event listeners for chat messages
    this.setupChatListeners();
    
    // Join the chat with current user info
    this.joinChatWithUserInfo();
  }
  
  private joinChatWithUserInfo(): void {
    if (!this.currentUser) return;
    
    const joinData = {
      userId: this.currentUser.id,
      username: this.currentUser.username,
      avatar: this.currentUser.avatar
    };
    
    console.log('Joining chat with user info:', joinData);
    
    // Use the socket service to emit the event
    this.socketService.connect(
      parseInt(this.currentUser.id), 
      this.currentUser.username, 
      this.currentUser.avatar
    );
    
    // Additional subscription for direct messages from the SocketService
    this.subscriptions.push(
      this.socketService.newDirectMessages$.subscribe(message => {
        if (message && this.selectedDirectMessage &&
            (message.senderId === this.selectedDirectMessage.userId || 
             message.receiverId === this.selectedDirectMessage.userId)) {
          console.log('Adding direct message to UI:', message);
          this.messages.push(message as unknown as ChatMessage);
        }
      })
    );
    
    // Additional subscription for channel messages from the SocketService
    this.subscriptions.push(
      this.socketService.newMessages$.subscribe(message => {
        if (message && this.selectedChannel && 
            message.channelId === this.selectedChannel.id) {
          console.log('Adding channel message to UI:', message);
          this.messages.push(message as unknown as ChatMessage);
        }
      })
    );
  }
  
  private setupChatListeners(): void {
    // Implement additional listeners if needed
    console.log('Setting up chat listeners');
  }

  private async loadDirectMessages(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      const friends = await this.chatService.getFriends();
      this.directMessages = (friends as any[]).map((friend: any) => ({
        userId: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        lastMessage: friend.lastMessage?.content,
        lastMessageTime: friend.lastMessage?.createdAt,
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error loading direct messages:', error);
    }
  }

  private setupSocketListeners(): void {
    // Simplified socket listening - will be enhanced when socket service is properly exposed
    console.log('Setting up socket listeners...');
    
    // Subscribe to online users
    const onlineUsersSub = this.socketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });
    
    this.subscriptions.push(onlineUsersSub);
  }

  // Tab switching
  switchTab(tab: 'direct' | 'servers'): void {
    this.activeTab = tab;
    this.selectedServer = null;
    this.selectedChannel = null;
    this.selectedDirectMessage = null;
    this.messages = [];
  }

  // Server selection
  async selectServer(server: ChatServer): Promise<void> {
    this.selectedServer = server;
    this.selectedChannel = null;
    this.selectedDirectMessage = null;
    this.messages = [];
    
    console.log('Selected server:', server.name);
  }

  // Channel selection
  async selectChannel(channel: ChatChannel): Promise<void> {
    this.selectedChannel = channel;
    this.selectedDirectMessage = null;
    
    // Load channel messages
    await this.loadChannelMessages(channel.id);
    
    console.log('Selected channel:', channel.name);
  }

  // Direct message selection
  async selectDirectMessage(dm: DirectMessage): Promise<void> {
    console.log('🎯 selectDirectMessage called with:', dm);
    this.selectedDirectMessage = dm;
    this.selectedServer = null;
    this.selectedChannel = null;
    
    // Load DM history
    console.log('📚 Loading direct message history for:', dm.userId);
    await this.loadDirectMessageHistory(dm.userId);
    
    console.log('✅ Selected DM with:', dm.username);
    console.log('📝 Current selectedDirectMessage:', this.selectedDirectMessage);
    
    // Reset unread count
    dm.unreadCount = 0;
    
    // Join a room for direct messaging
    if (this.currentUser) {
      const roomId = `user_${this.currentUser.id}`;
      console.log(`Joining direct message room: ${roomId}`);
    }
  }

  // Load messages
  private async loadChannelMessages(channelId: string): Promise<void> {
    try {
      this.isLoading = true;
      const messages = await this.chatService.getChannelMessages(channelId);
      this.messages = (messages as any[]).map(msg => ({
        ...msg,
        sender: {
          id: msg.senderId,
          username: msg.senderUsername || msg.sender?.username,
          avatar: msg.senderAvatar || msg.sender?.avatar
        }
      }));
    } catch (error) {
      console.error('Error loading channel messages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDirectMessageHistory(friendId: string, loadMore: boolean = false): Promise<void> {
    try {
      console.log('📜 Loading message history for friend:', friendId, 'loadMore:', loadMore);
      
      if (!loadMore) {
        this.isLoading = true;
        this.currentPage = 0;
        this.hasMoreMessages = true;
      } else {
        this.isLoadingMoreMessages = true;
      }

      // Calculate skip based on pagination
      const skip = this.currentPage * this.messageLimit;
      
      const messages = await this.chatService.getDirectMessages(friendId, this.messageLimit, skip);
      console.log('💌 Messages received:', messages);
      
      const processedMessages = (messages as any[]).map(msg => ({
        ...msg,
        sender: {
          id: msg.senderId,
          username: msg.senderUsername || msg.sender?.username,
          avatar: msg.senderAvatar || msg.sender?.avatar
        }
      }));

      if (loadMore) {
        // Prepend older messages to the beginning of the array
        this.messages = [...processedMessages, ...this.messages];
      } else {
        // Replace messages for initial load
        this.messages = processedMessages;
      }

      // Check if there are more messages to load
      this.hasMoreMessages = messages.length === this.messageLimit;
      this.currentPage++;
      
      console.log('📋 Processed messages:', this.messages);
    } catch (error) {
      console.error('❌ Error loading direct messages:', error);
    } finally {
      this.isLoading = false;
      this.isLoadingMoreMessages = false;
    }
  }

  // Send message
  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.currentUser) return;
    
    try {
      if (this.selectedChannel) {
        // Send channel message via socket
        console.log('Sending channel message');
        const messageData = {
          content: this.newMessage.trim(),
          channelId: this.selectedChannel.id,
          senderId: this.currentUser.id,
          senderUsername: this.currentUser.username,
          senderAvatar: this.currentUser.avatar
        };
        
        // Save message to database via HTTP
        await this.chatService.sendChannelMessage(this.selectedChannel.id, {
          content: this.newMessage.trim(),
          senderId: this.currentUser.id
        });
        
        // Also emit via socket for real-time updates
        this.socketService.connect(
          parseInt(this.currentUser.id),
          this.currentUser.username,
          this.currentUser.avatar
        );
        this.socketService.sendChatMessage({
          content: this.newMessage.trim(),
          channelId: parseInt(this.selectedChannel.id),
          senderId: parseInt(this.currentUser.id),
          senderUsername: this.currentUser.username,
          senderAvatar: this.currentUser.avatar
        });
        
      } else if (this.selectedDirectMessage) {
        // Send direct message
        console.log('Sending direct message');
        const messageData = {
          content: this.newMessage.trim(),
          receiverId: this.selectedDirectMessage.userId,
          senderId: this.currentUser.id,
          senderUsername: this.currentUser.username,
          senderAvatar: this.currentUser.avatar
        };
        
        // Save message to database via HTTP
        await this.chatService.sendDirectMessage(this.selectedDirectMessage.userId, {
          content: this.newMessage.trim(),
          senderId: this.currentUser.id
        });
        
        // Also emit via socket for real-time updates
        this.socketService.connect(
          parseInt(this.currentUser.id),
          this.currentUser.username,
          this.currentUser.avatar
        );
        
        // Emit the direct message event
        this.socketService.sendDirectMessage(
          parseInt(this.selectedDirectMessage.userId),
          this.newMessage.trim()
        );
        
        // Add message to local messages array for immediate UI update
        const localMessage = {
          id: `temp-${Date.now()}`,
          content: this.newMessage.trim(),
          senderId: this.currentUser.id,
          senderUsername: this.currentUser.username,
          senderAvatar: this.currentUser.avatar,
          messageType: 'TEXT' as const,
          isEdited: false,
          createdAt: new Date().toISOString(),
          reactions: [],
          sender: {
            id: this.currentUser.id,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar
          }
        };
        this.messages.push(localMessage);
        console.log('💬 Added local message:', localMessage);
      }
      
      // Clear input
      this.newMessage = '';
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Typing indicator
  onTyping(): void {
    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    console.log('User typing...');
    
    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      console.log('User stopped typing...');
    }, 3000);
  }

  // Server creation
  async createServer(): Promise<void> {
    if (!this.newServerName.trim() || !this.currentUser) return;
    
    try {
      const serverData = {
        name: this.newServerName.trim(),
        description: this.newServerDescription.trim() || undefined,
        isPrivate: this.newServerPrivate,
        ownerId: this.currentUser.id
      };
      
      const newServer = await this.chatService.createServer(serverData);
      this.chatServers.push(newServer as ChatServer);
      
      // Reset form and close modal
      this.newServerName = '';
      this.newServerDescription = '';
      this.newServerPrivate = false;
      this.showServerModal = false;
      
    } catch (error) {
      console.error('Error creating server:', error);
    }
  }

  // Channel creation
  async createChannel(): Promise<void> {
    if (!this.newChannelName.trim() || !this.selectedServer) return;
    
    try {
      const channelData = {
        name: this.newChannelName.trim(),
        description: this.newChannelDescription.trim() || undefined,
        isPrivate: this.newChannelPrivate,
        serverId: this.selectedServer.id
      };
      
      const newChannel = await this.chatService.createChannel(channelData);
      this.selectedServer.channels.push(newChannel as ChatChannel);
      
      // Reset form and close modal
      this.newChannelName = '';
      this.newChannelDescription = '';
      this.newChannelPrivate = false;
      this.showChannelModal = false;
      
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  // Modal controls
  openServerModal(): void {
    this.showServerModal = true;
  }

  openChannelModal(): void {
    if (!this.selectedServer) return;
    this.showChannelModal = true;
  }
  
  // Open the friend chat modal
  async openFriendChatModal(): Promise<void> {
    try {
      // Alle verfügbaren Freunde laden (nicht nur die mit bestehenden Chats)
      if (this.currentUser) {
        console.log('🔄 Loading friends for modal...');
        this.availableFriends = await this.chatService.getFriends();
        console.log('👥 Loaded available friends:', this.availableFriends);
      }
      this.showFriendChatModal = true;
      console.log('🎭 Friend chat modal opened with', this.availableFriends.length, 'friends');
    } catch (error) {
      console.error('❌ Error loading friends for modal:', error);
      this.showFriendChatModal = true; // Öffne Modal trotzdem
    }
  }

  // TEST METHOD - Remove this later
  testStartChat(): void {
    console.log('🧪 Test start chat called');
    this.startDirectChat('cme2ud8lb0001fa4sxxat7e70', 'CardioQueen');
  }

  // Track by function for ngFor performance
  trackByFriendId(index: number, friend: any): string {
    return friend.id;
  }

  // Handle friend click in modal with debug
  onFriendClick(friend: any): void {
    console.log('🎯 Friend clicked in modal:', friend);
    this.startDirectChat(friend.id, friend.username);
    this.showFriendChatModal = false;
    console.log('🔒 Modal closed');
  }
  
  // Start a direct message with a user
  async startDirectChat(userId: string, username: string): Promise<void> {
    console.log('🚀 startDirectChat called with:', userId, username);
    if (!this.currentUser || userId === this.currentUser.id) {
      console.log('❌ No current user or trying to chat with self');
      return;
    }
    
    try {
      // Switch to direct message tab
      this.activeTab = 'direct';
      console.log('✅ Switched to direct tab');
      
      // Check if we already have this DM in our list
      const existingDM = this.directMessages.find(dm => dm.userId === userId);
      console.log('🔍 Existing DM found:', existingDM);
      
      if (existingDM) {
        // Select existing direct message
        console.log('📱 Selecting existing DM');
        this.selectDirectMessage(existingDM);
      } else {
        // Initialize a new direct chat
        console.log('🆕 Creating new direct chat');
        const chatUser = await this.chatService.getOrCreateDirectChat(userId);
        console.log('👤 Chat user received:', chatUser);
        
        // Create new DM entry
        const newDM: DirectMessage = {
          userId,
          username: chatUser.username || username,
          avatar: chatUser.avatar,
          unreadCount: 0
        };
        console.log('💬 New DM created:', newDM);
        
        // Add to list and select
        this.directMessages.push(newDM);
        console.log('📋 Added to directMessages list, total:', this.directMessages.length);
        await this.selectDirectMessage(newDM);
        console.log('✅ Selected new DM');
      }
    } catch (error) {
      console.error('❌ Error starting direct chat:', error);
    }
  }

  // Utility methods
  formatTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.some(user => user.id.toString() === userId);
  }

  getUserStatus(userId: string): 'online' | 'idle' | 'dnd' | 'offline' {
    const user = this.onlineUsers.find(u => u.id.toString() === userId);
    if (!user?.status) return 'offline';
    
    // Map status values to expected format
    switch (user.status) {
      case 'ONLINE':
      case 'online':
        return 'online';
      case 'AWAY':
      case 'away':
        return 'idle';
      case 'DO_NOT_DISTURB':
      case 'busy':
        return 'dnd';
      case 'OFFLINE':
      case 'offline':
      default:
        return 'offline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  // Load more messages when scrolling to top
  async onScroll(event: any): Promise<void> {
    const element = event.target;
    const threshold = 100; // Pixels from top to trigger load
    
    if (element.scrollTop <= threshold && this.hasMoreMessages && !this.isLoadingMoreMessages) {
      const selectedUserId = this.selectedDirectMessage?.userId;
      if (selectedUserId) {
        await this.loadDirectMessageHistory(selectedUserId, true);
      }
    }
  }

  getTypingText(): string {
    if (this.typingUsers.length === 0) return '';
    if (this.typingUsers.length === 1) return `${this.typingUsers[0]} tippt...`;
    if (this.typingUsers.length === 2) return `${this.typingUsers[0]} und ${this.typingUsers[1]} tippen...`;
    return `${this.typingUsers.length} Personen tippen...`;
  }

  onKeyDown(event: KeyboardEvent): void {
    // Send message on Enter (but not on Shift+Enter)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Get display name for message sender
  getDisplayName(username: string | undefined, senderId: string): string {
    // If it's the current user's message, show "Ich"
    if (this.currentUser && senderId === this.currentUser.id) {
      return 'Ich';
    }
    // Otherwise show the username or fallback
    return username || 'Unknown User';
  }

  // ===== SERVER INVITE SYSTEM =====

  openInviteModal(): void {
    if (!this.selectedServer) return;
    this.showInviteModal = true;
    this.loadServerInvites();
  }

  async loadServerInvites(): Promise<void> {
    if (!this.selectedServer) return;
    
    try {
      this.serverInvites = await this.chatService.getServerInvites(this.selectedServer.id);
    } catch (error) {
      console.error('Error loading server invites:', error);
    }
  }

  async createInvite(): Promise<void> {
    if (!this.selectedServer) return;

    try {
      const options: any = {};
      if (this.newInviteMaxUses) {
        options.maxUses = this.newInviteMaxUses;
      }
      if (this.newInviteExpiresHours) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.newInviteExpiresHours);
        options.expiresAt = expiresAt.toISOString();
      }

      const invite = await this.chatService.createServerInvite(this.selectedServer.id, options);
      this.createdInviteCode = invite.code;
      this.serverInvites.unshift(invite);
      
      // Reset form
      this.newInviteMaxUses = undefined;
      this.newInviteExpiresHours = undefined;
    } catch (error) {
      console.error('Error creating invite:', error);
    }
  }

  async deleteInvite(inviteId: string): Promise<void> {
    try {
      await this.chatService.deleteInvite(inviteId);
      this.serverInvites = this.serverInvites.filter(invite => invite.id !== inviteId);
    } catch (error) {
      console.error('Error deleting invite:', error);
    }
  }

  copyInviteLink(code: string): void {
    const inviteUrl = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      console.log('Invite link copied to clipboard');
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  }

  formatExpiryDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE');
  }

  // New Modal Event Handlers
  onCreateServer(serverData: {name: string, description?: string, isPrivate: boolean}): void {
    this.isCreatingServer = true;
    this.newServerName = serverData.name;
    this.newServerDescription = serverData.description || '';
    this.newServerPrivate = serverData.isPrivate;
    
    this.createServer().finally(() => {
      this.isCreatingServer = false;
      this.showServerModal = false;
    });
  }

  onJoinServer(inviteCode: string): void {
    this.isJoiningServer = true;
    this.joinServerByInvite(inviteCode).finally(() => {
      this.isJoiningServer = false;
      this.showJoinServerModal = false;
    });
  }

  onPreviewInvite(inviteCode: string): void {
    this.isLoadingInvitePreview = true;
    // TODO: Implement invite preview functionality
    console.log('Preview invite:', inviteCode);
    this.isLoadingInvitePreview = false;
  }

  onCreateInvite(inviteData: {maxUses?: number, expiresIn?: number}): void {
    this.isCreatingInvite = true;
    this.newInviteMaxUses = inviteData.maxUses;
    this.newInviteExpiresHours = inviteData.expiresIn;
    
    this.createInvite().finally(() => {
      this.isCreatingInvite = false;
    });
  }

  onDeleteInvite(inviteId: number): void {
    this.deleteInvite(inviteId.toString());
  }

  async joinServerByInvite(inviteCode: string): Promise<void> {
    try {
      const result = await this.chatService.joinServerByInvite(inviteCode);
      if (result.success) {
        // Refresh server list by reloading servers
        const servers = await this.chatService.getUserServers();
        this.chatServers = servers as ChatServer[];
        
        // Select the joined server
        if (result.server) {
          this.selectServer(result.server);
        }
      }
    } catch (error) {
      console.error('Error joining server:', error);
    }
  }

  private leaveCurrentRoom(): void {
    // Implementation for leaving current room when socket is properly exposed
    console.log('Leaving current room...');
  }
}
