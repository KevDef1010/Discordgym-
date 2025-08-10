import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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

interface MessageNotification {
  id: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  isNew: boolean;
  type: 'direct' | 'channel';
  senderId: string;
  channelId?: string;
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
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
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
  
  // Notification system
  totalUnreadCount = 0;
  originalFaviconHref = '';
  notificationAudio: HTMLAudioElement | null = null;
  recentNotifications: MessageNotification[] = [];
  
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
  private autoRefreshInterval: any;
  private lastMessageCount = 0;
  private readonly CHAT_STATE_KEY = 'discordGym_chatState';
  private readonly AUTO_REFRESH_INTERVAL = 10000; // 10 seconds

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router
  ) {
    // FORCE all modal states to false in constructor
    this.showServerModal = false;
    this.showChannelModal = false;
    this.showFriendChatModal = false;
    this.showInviteModal = false;
    this.showJoinServerModal = false;
    
    console.log('🔒 Constructor: All modals set to FALSE');
  }

  ngOnInit(): void {
    console.log('🔄 Chat component ngOnInit started');
    
    // Initialize notification system
    this.initializeNotificationSystem();
    
    // TRIPLE RESET to ensure no modals are open
    this.resetModalStates();
    this.resetModalStates();
    this.resetModalStates();
    
    // Force explicit reset
    this.showServerModal = false;
    this.showChannelModal = false;
    this.showFriendChatModal = false;
    this.showInviteModal = false;
    this.showJoinServerModal = false;
    
    console.log('� All modal states FORCE RESET - checking states:');
    console.log('showServerModal:', this.showServerModal);
    console.log('showChannelModal:', this.showChannelModal);
    console.log('showFriendChatModal:', this.showFriendChatModal);
    console.log('showInviteModal:', this.showInviteModal);
    console.log('showJoinServerModal:', this.showJoinServerModal);
    
    // Get user once directly without subscribing
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('❌ No user found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('✅ Current user found:', this.currentUser.username);
    
    // Always start with direct messages tab
    this.activeTab = 'direct';
    
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
      console.log('✅ Chat data loaded successfully');
      // FINAL modal reset after data loading
      this.resetModalStates();
      
      // Restore previous chat state
      this.restoreChatState();
      
      // Then handle direct message parameters if they exist
      if (dmUserId && dmUsername && dmUserId !== this.currentUser?.id) {
        this.handleDirectMessageFromUrl(dmUserId, dmUsername);
      } else {
        // If no URL params, try to restore the last selected chat
        this.restoreSelectedChat();
      }
    }).catch(error => {
      console.error('❌ Error loading chat data:', error);
    });
    
    // Set up socket listeners
    this.setupSocketListeners();
    
    // Set up auto-refresh for active chats
    this.setupAutoRefresh();
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
    // Save current chat state before destroying
    this.saveChatState();
    
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Clear auto-refresh interval
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    // Leave current room
    this.leaveCurrentRoom();
  }

  ngAfterViewInit(): void {
    // FINAL modal reset after view is rendered
    console.log('🎯 ngAfterViewInit - FINAL modal reset');
    setTimeout(() => {
      this.showServerModal = false;
      this.showChannelModal = false;
      this.showFriendChatModal = false;
      this.showInviteModal = false;
      this.showJoinServerModal = false;
      console.log('🔒 AfterViewInit: All modals FORCEFULLY closed');
    }, 0);
  }

  private async loadChatData(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      this.isLoading = true;
      console.log('🔄 Loading chat data for user:', this.currentUser.username);
      
      // Load direct messages first (most important)
      await this.loadDirectMessages();
      
      // Load recent unread messages for offline users
      await this.loadRecentUnreadMessages();
      
      // Load user's servers
      try {
        const servers = await this.chatService.getUserServers();
        this.chatServers = servers as ChatServer[];
        console.log('🏢 Loaded servers:', this.chatServers.length);
      } catch (error) {
        console.error('❌ Error loading servers:', error);
        this.chatServers = [];
      }
      
      // Get online users (simplified approach)
      this.socketService.onlineUsers$.subscribe(users => {
        this.onlineUsers = users;
      });
      
      // Connect to chat socket and join chat
      this.connectToChat();
      
      console.log('✅ Chat data loading completed');
      
    } catch (error) {
      console.error('❌ Error loading chat data:', error);
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
        if (message) {
          console.log('🔔 New direct message received:', message);
          
          // Update unread count for the sender
          this.updateDirectMessageUnreadCount(String(message.senderId));
          
          // Show notification if not currently viewing this chat
          if (!this.selectedDirectMessage || this.selectedDirectMessage.userId !== String(message.senderId)) {
            this.showDesktopNotification(message);
            this.playNotificationSound();
          }
          
          // Add to UI if currently viewing this chat
          if (this.selectedDirectMessage &&
              (String(message.senderId) === this.selectedDirectMessage.userId || 
               String(message.receiverId) === this.selectedDirectMessage.userId)) {
            console.log('Adding direct message to UI:', message);
            this.messages.push(message as unknown as ChatMessage);
            
            // Mark as read since user is viewing
            this.markDirectMessageAsRead(String(message.senderId));
          }
          
          // Update unread counts and favicon
          this.updateUnreadCount();
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
      console.log('📱 Loading direct messages...');
      
      // Load friends first
      const friendships = await this.chatService.getFriends();
      console.log('👥 Friendships loaded:', friendships);
      console.log('👥 Friendships type:', typeof friendships, 'Array?', Array.isArray(friendships));
      console.log('👥 Friendships length:', Array.isArray(friendships) ? friendships.length : 'N/A');
      
      if (Array.isArray(friendships) && friendships.length > 0) {
        this.directMessages = friendships.map((friendship: any) => {
          console.log('🔄 Processing friendship:', friendship);
          // The API returns friendship objects with nested friend data
          const friend = friendship.friend;
          console.log('👤 Friend data:', friend);
          
          if (!friend) {
            console.warn('⚠️ Friendship object missing friend data:', friendship);
            return null;
          }
          
          return {
            userId: friend.id,
            username: friend.username,
            avatar: friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`,
            lastMessage: friend.lastMessage?.content,
            lastMessageTime: friend.lastMessage?.createdAt ? new Date(friend.lastMessage.createdAt) : undefined,
            unreadCount: 0
          };
        }).filter((dm: any) => dm !== null) as DirectMessage[]; // Remove any null entries and cast to correct type
        
        console.log('✅ Direct messages initialized:', this.directMessages.length, 'chats');
        console.log('� Direct messages array:', this.directMessages);
      } else {
        console.log('📭 No friends found or friends array is empty');
        this.directMessages = [];
      }
      
      // Also load available friends for new chats (extract friend data from friendships)
      this.availableFriends = Array.isArray(friendships) 
        ? friendships.map((f: any) => f.friend).filter((friend: any) => friend !== null)
        : [];
      
    } catch (error) {
      console.error('❌ Error loading direct messages:', error);
      console.error('❌ Error details:', error);
      this.directMessages = [];
    }
  }

  private setupSocketListeners(): void {
    console.log('Setting up socket listeners...');
    
    // Subscribe to online users
    const onlineUsersSub = this.socketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });
    
    // Subscribe to new direct messages
    const newDirectMessagesSub = this.socketService.newDirectMessages$.subscribe(message => {
      if (message && this.currentUser) {
        console.log('📨 New direct message received:', message);
        this.handleNewDirectMessage(message);
      }
    });
    
    // Subscribe to new channel messages  
    const newMessagesSub = this.socketService.newMessages$.subscribe(message => {
      if (message && this.currentUser) {
        console.log('📨 New channel message received:', message);
        this.handleNewChannelMessage(message);
      }
    });
    
    this.subscriptions.push(onlineUsersSub, newDirectMessagesSub, newMessagesSub);
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
    console.log('🔷 Selecting channel:', channel.name, 'ID:', channel.id);
    this.selectedChannel = channel;
    this.selectedDirectMessage = null;
    
    // Load channel messages
    console.log('📚 Loading messages for channel:', channel.id);
    await this.loadChannelMessages(channel.id);
    
    // Update message count and save state
    this.lastMessageCount = this.messages.length;
    this.saveChatState();
    
    console.log('✅ Selected channel:', channel.name, 'Messages loaded:', this.messages.length);
  }

  // Direct message selection
  async selectDirectMessage(dm: DirectMessage): Promise<void> {
    console.log('🎯 selectDirectMessage called with:', dm);
    this.selectedDirectMessage = dm;
    this.selectedServer = null;
    this.selectedChannel = null;
    
    // Mark messages as read
    this.markDirectMessageAsRead(dm.userId);
    
    // Load DM history
    console.log('📚 Loading direct message history for:', dm.userId);
    await this.loadDirectMessageHistory(dm.userId);
    
    console.log('✅ Selected DM with:', dm.username);
    console.log('📝 Current selectedDirectMessage:', this.selectedDirectMessage);
    
    // Reset unread count
    dm.unreadCount = 0;
    
    // Update message count and save state
    this.lastMessageCount = this.messages.length;
    this.saveChatState();
    
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
    if (!this.newMessage.trim() || !this.currentUser) {
      console.log('❌ Cannot send message: newMessage or currentUser missing', {
        newMessage: this.newMessage.trim(),
        currentUser: !!this.currentUser
      });
      return;
    }
    
    console.log('📤 Attempting to send message:', {
      message: this.newMessage.trim(),
      selectedChannel: this.selectedChannel,
      selectedDirectMessage: this.selectedDirectMessage,
      currentUser: this.currentUser.username
    });
    
    try {
      if (this.selectedChannel) {
        // Send channel message via socket
        console.log('🔷 Sending channel message to channel:', this.selectedChannel.name, 'ID:', this.selectedChannel.id);
        const messageData = {
          content: this.newMessage.trim(),
          channelId: this.selectedChannel.id,
          senderId: this.currentUser.id,
          senderUsername: this.currentUser.username,
          senderAvatar: this.currentUser.avatar
        };
        
        // Save message to database via HTTP
        console.log('💾 Saving message to database...');
        const savedMessage = await this.chatService.sendChannelMessage(this.selectedChannel.id, {
          content: this.newMessage.trim(),
          senderId: this.currentUser.id
        });
        console.log('✅ Message saved to database:', savedMessage);
        
        // Also emit via socket for real-time updates
        console.log('📡 Emitting message via socket...');
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
        console.log('✅ Message emitted via socket');
        
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
        console.log('💬 Added local channel message:', localMessage);
        
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
      
      // Update message count and save state after sending
      this.lastMessageCount = this.messages.length;
      this.saveChatState();
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Context:', {
        selectedChannel: this.selectedChannel,
        selectedDirectMessage: this.selectedDirectMessage,
        currentUser: this.currentUser,
        messageContent: this.newMessage.trim()
      });
      
      // You could add user notification here
      // this.notificationService.showError('Failed to send message. Please try again.');
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

  private resetModalStates(): void {
    console.log('🔒 Resetting ALL modal states to false');
    
    // Reset all modal states to ensure clean start
    this.showServerModal = false;
    this.showChannelModal = false;
    this.showFriendChatModal = false;
    this.showInviteModal = false;
    this.showJoinServerModal = false;
    
    // Reset loading states
    this.isCreatingServer = false;
    this.isJoiningServer = false;
    this.isLoadingInvitePreview = false;
    this.isCreatingInvite = false;
    
    // Clear form data
    this.newServerName = '';
    this.newServerDescription = '';
    this.newServerPrivate = false;
    this.newChannelName = '';
    this.newChannelDescription = '';
  }

  // ===============================
  // NOTIFICATION SYSTEM
  // ===============================
  
  private initializeNotificationSystem(): void {
    console.log('🔔 Initializing notification system');
    
    // Store original favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      this.originalFaviconHref = favicon.href;
    }
    
    // Initialize notification audio (optional)
    try {
      this.notificationAudio = new Audio();
      this.notificationAudio.volume = 0.3;
      // You can add a notification sound file here
      // this.notificationAudio.src = '/assets/sounds/notification.mp3';
    } catch (error) {
      console.log('Audio not available for notifications');
    }
    
    // Request notification permission
    this.requestNotificationPermission();
  }
  
  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }
  
  private updateFavicon(hasUnread: boolean): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) return;
    
    if (hasUnread) {
      // Create a canvas to draw a red dot on the favicon
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw original favicon background (simplified)
        ctx.fillStyle = '#7289da'; // Discord-like blue
        ctx.fillRect(0, 0, 32, 32);
        
        // Draw red notification dot
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(24, 8, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Update favicon
        favicon.href = canvas.toDataURL('image/png');
      }
    } else {
      // Reset to original favicon
      if (this.originalFaviconHref) {
        favicon.href = this.originalFaviconHref;
      }
    }
  }
  
  private updateUnreadCount(): void {
    // Calculate total unread messages
    this.totalUnreadCount = this.directMessages.reduce((total, dm) => total + dm.unreadCount, 0);
    
    // Update favicon
    this.updateFavicon(this.totalUnreadCount > 0);
    
    // Update page title
    if (this.totalUnreadCount > 0) {
      document.title = `(${this.totalUnreadCount}) DiscordGym`;
    } else {
      document.title = 'DiscordGym';
    }
    
    console.log('🔔 Total unread messages:', this.totalUnreadCount);
  }
  
  private showDesktopNotification(message: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`New message from ${message.senderUsername}`, {
        body: message.content,
        icon: message.senderAvatar || '/assets/default-avatar.png',
        tag: `dm-${message.senderId}` // Prevents duplicate notifications
      });
      
      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Focus window when clicked
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
  
  private playNotificationSound(): void {
    if (this.notificationAudio) {
      this.notificationAudio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    }
  }
  
  private updateDirectMessageUnreadCount(senderId: string): void {
    const dm = this.directMessages.find(dm => dm.userId === senderId);
    if (dm) {
      dm.unreadCount++;
      console.log(`🔔 Updated unread count for ${dm.username}: ${dm.unreadCount}`);
    } else {
      // If we don't have this user in our DM list, add them
      this.addNewDirectMessageUser(senderId);
    }
  }
  
  private markDirectMessageAsRead(userId: string): void {
    const dm = this.directMessages.find(dm => dm.userId === userId);
    if (dm && dm.unreadCount > 0) {
      dm.unreadCount = 0;
      console.log(`✅ Marked messages as read for ${dm.username}`);
      this.updateUnreadCount();
    }
  }
  
  private async addNewDirectMessageUser(userId: string): Promise<void> {
    try {
      // Get user info from the backend
      const userInfo = await this.chatService.getOrCreateDirectChat(userId);
      
      const newDM: DirectMessage = {
        userId: userId,
        username: userInfo.username || 'Unknown User',
        avatar: userInfo.avatar,
        unreadCount: 1,
        lastMessage: undefined,
        lastMessageTime: new Date()
      };
      
      this.directMessages.unshift(newDM); // Add to top of list
      console.log('🆕 Added new DM user:', newDM.username);
      
    } catch (error) {
      console.error('❌ Error adding new DM user:', error);
    }
  }

  private handleNewDirectMessage(message: any): void {
    if (!this.currentUser) return;
    
    const senderId = message.senderId?.toString() || message.userId?.toString();
    const currentUserId = this.currentUser.id?.toString();
    
    // Don't handle our own messages
    if (senderId === currentUserId) {
      console.log('🚫 Ignoring own message');
      return;
    }
    
    console.log('📨 Processing new direct message from:', senderId);
    
    // Add message to current conversation if it's open
    if (this.selectedDirectMessage && this.selectedDirectMessage.userId === senderId) {
      const newMessage: ChatMessage = {
        id: message.id?.toString() || Date.now().toString(),
        content: message.content || '',
        senderId: senderId,
        senderUsername: message.senderUsername || message.sender?.username || 'Unknown',
        senderAvatar: message.senderAvatar || message.sender?.avatar,
        sender: message.sender || {
          id: senderId,
          username: message.senderUsername || 'Unknown',
          avatar: message.senderAvatar
        },
        receiverId: currentUserId,
        messageType: 'TEXT',
        isEdited: false,
        createdAt: new Date(message.createdAt || message.timestamp || Date.now()).toISOString(),
        reactions: []
      };
      
      this.messages.push(newMessage);
      console.log('💬 Added message to current conversation');
      
      // Don't increment unread count for currently open conversation
    } else {
      // Update unread count for the sender
      this.updateDirectMessageUnreadCount(senderId);
    }
    
    // Add visual notification for all direct messages (except current chat)
    this.addMessageNotification(message, 'direct');
    
    // Show desktop notification for messages not in current chat
    if (!this.selectedDirectMessage || this.selectedDirectMessage.userId !== senderId) {
      this.showDesktopNotification({
        senderUsername: message.senderUsername || message.sender?.username || 'Unknown',
        content: message.content,
        senderAvatar: message.senderAvatar || message.sender?.avatar,
        senderId: senderId
      });
      this.playNotificationSound();
    }
    
    // Show desktop notification if enabled
    this.showDesktopNotification({
      senderUsername: message.senderUsername || 'Unknown',
      content: message.content || 'Neue Nachricht erhalten',
      senderAvatar: message.senderAvatar,
      senderId: senderId
    });
    
    // Play notification sound
    this.playNotificationSound();
    
    // Update favicon
    this.updateUnreadCount();
  }

  private handleNewChannelMessage(message: any): void {
    if (!this.currentUser) return;
    
    const senderId = message.senderId?.toString() || message.userId?.toString();
    const currentUserId = this.currentUser.id?.toString();
    
    // Don't handle our own messages
    if (senderId === currentUserId) {
      console.log('🚫 Ignoring own channel message');
      return;
    }
    
    console.log('📨 Processing new channel message:', message);
    
    // Add message to current channel if it's open
    if (this.selectedChannel && this.selectedChannel.id === message.channelId?.toString()) {
      const newMessage: ChatMessage = {
        id: message.id?.toString() || Date.now().toString(),
        content: message.content || '',
        senderId: senderId,
        senderUsername: message.senderUsername || message.sender?.username || 'Unknown',
        senderAvatar: message.senderAvatar || message.sender?.avatar,
        sender: message.sender || {
          id: senderId,
          username: message.senderUsername || 'Unknown',
          avatar: message.senderAvatar
        },
        channelId: message.channelId?.toString(),
        messageType: 'TEXT',
        isEdited: false,
        createdAt: new Date(message.createdAt || message.timestamp || Date.now()).toISOString(),
        reactions: []
      };
      
      this.messages.push(newMessage);
      console.log('💬 Added message to current channel');
    }
    
    // Add visual notification for all channel messages (except current channel)
    this.addMessageNotification(message, 'channel');
    
    // Show desktop notification for messages not in current channel
    if (!this.selectedChannel || this.selectedChannel.id !== message.channelId?.toString()) {
      this.showDesktopNotification({
        senderUsername: message.senderUsername || message.sender?.username || 'Unknown',
        content: message.content,
        senderAvatar: message.senderAvatar || message.sender?.avatar,
        senderId: senderId
      });
      this.playNotificationSound();
    }
  }

  // ===== STATE PERSISTENCE METHODS =====
  
  private saveChatState(): void {
    if (!this.currentUser) return;
    
    const chatState = {
      userId: this.currentUser.id,
      activeTab: this.activeTab,
      selectedServerId: this.selectedServer?.id || null,
      selectedChannelId: this.selectedChannel?.id || null,
      selectedDirectMessageUserId: this.selectedDirectMessage?.userId || null,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.CHAT_STATE_KEY, JSON.stringify(chatState));
      console.log('💾 Chat state saved:', chatState);
    } catch (error) {
      console.error('❌ Error saving chat state:', error);
    }
  }

  private restoreChatState(): void {
    if (!this.currentUser) return;
    
    try {
      const savedState = localStorage.getItem(this.CHAT_STATE_KEY);
      if (!savedState) return;
      
      const chatState = JSON.parse(savedState);
      
      // Only restore if it's for the same user and not too old (1 hour)
      const oneHour = 60 * 60 * 1000;
      if (chatState.userId !== this.currentUser.id || 
          (Date.now() - chatState.timestamp) > oneHour) {
        console.log('🗑️ Chat state expired or for different user, clearing');
        localStorage.removeItem(this.CHAT_STATE_KEY);
        return;
      }
      
      // Restore tab
      if (chatState.activeTab) {
        this.activeTab = chatState.activeTab;
      }
      
      console.log('🔄 Chat state restored:', chatState);
    } catch (error) {
      console.error('❌ Error restoring chat state:', error);
      localStorage.removeItem(this.CHAT_STATE_KEY);
    }
  }

  private restoreSelectedChat(): void {
    if (!this.currentUser) return;
    
    try {
      const savedState = localStorage.getItem(this.CHAT_STATE_KEY);
      if (!savedState) return;
      
      const chatState = JSON.parse(savedState);
      
      // Restore direct message chat
      if (chatState.selectedDirectMessageUserId && this.activeTab === 'direct') {
        const dm = this.directMessages.find(dm => dm.userId === chatState.selectedDirectMessageUserId);
        if (dm) {
          console.log('🔄 Restoring direct message chat:', dm.username);
          this.selectDirectMessage(dm);
        }
      }
      
      // Restore server/channel chat
      else if (chatState.selectedServerId && this.activeTab === 'servers') {
        const server = this.chatServers.find(s => s.id === chatState.selectedServerId);
        if (server) {
          this.selectServer(server).then(() => {
            if (chatState.selectedChannelId) {
              const channel = server.channels.find(c => c.id === chatState.selectedChannelId);
              if (channel) {
                console.log('🔄 Restoring channel chat:', channel.name);
                this.selectChannel(channel);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Error restoring selected chat:', error);
    }
  }

  // ===== AUTO-REFRESH METHODS =====
  
  private setupAutoRefresh(): void {
    // Clear any existing interval
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    // Set up periodic refresh for active chats
    this.autoRefreshInterval = setInterval(() => {
      this.autoRefreshMessages();
    }, this.AUTO_REFRESH_INTERVAL);
    
    console.log('🔄 Auto-refresh setup complete');
  }

  private async autoRefreshMessages(): Promise<void> {
    // Don't auto-refresh if user is typing
    if (this.newMessage.trim().length > 0) {
      return;
    }
    
    try {
      if (this.selectedDirectMessage && !this.isLoading) {
        await this.refreshDirectMessages();
      } else if (this.selectedChannel && !this.isLoading) {
        await this.refreshChannelMessages();
      }
    } catch (error) {
      console.error('❌ Error during auto-refresh:', error);
    }
  }

  private async refreshDirectMessages(): Promise<void> {
    if (!this.selectedDirectMessage || this.isLoading) return;
    
    try {
      const messages = await this.chatService.getDirectMessages(
        this.selectedDirectMessage.userId, 
        this.messageLimit, 
        0
      );
      
      // Only update if we have new messages
      if (messages.length !== this.lastMessageCount) {
        console.log(`🔄 Auto-refresh found ${messages.length} messages (was ${this.lastMessageCount})`);
        
        const processedMessages = (messages as any[]).map(msg => ({
          ...msg,
          sender: {
            id: msg.senderId,
            username: msg.senderUsername || msg.sender?.username,
            avatar: msg.senderAvatar || msg.sender?.avatar
          }
        }));
        
        this.messages = processedMessages;
        this.lastMessageCount = messages.length;
        
        // Save current state when messages are loaded
        this.saveChatState();
        
        // Auto-scroll to bottom if we're near the bottom
        setTimeout(() => this.scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('❌ Error refreshing direct messages:', error);
    }
  }

  private async refreshChannelMessages(): Promise<void> {
    if (!this.selectedChannel || this.isLoading) return;
    
    try {
      const messages = await this.chatService.getChannelMessages(this.selectedChannel.id);
      
      // Only update if we have new messages
      if (messages.length !== this.lastMessageCount) {
        console.log(`🔄 Auto-refresh found ${messages.length} messages (was ${this.lastMessageCount})`);
        
        this.messages = (messages as any[]).map(msg => ({
          ...msg,
          sender: {
            id: msg.senderId,
            username: msg.senderUsername || msg.sender?.username,
            avatar: msg.senderAvatar || msg.sender?.avatar
          }
        }));
        
        this.lastMessageCount = messages.length;
        
        // Save current state when messages are loaded
        this.saveChatState();
        
        // Auto-scroll to bottom if we're near the bottom
        setTimeout(() => this.scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('❌ Error refreshing channel messages:', error);
    }
  }

  private scrollToBottom(): void {
    try {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } catch (error) {
      console.error('❌ Error scrolling to bottom:', error);
    }
  }

  // NOTIFICATION METHODS

  trackNotification(index: number, notification: MessageNotification): string {
    return notification.id;
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'gerade eben';
    if (minutes < 60) return `vor ${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `vor ${days}d`;
  }

  replyToNotification(notification: MessageNotification): void {
    if (notification.type === 'direct') {
      // Switch to direct messages and select the sender
      this.activeTab = 'direct';
      const directMessage = this.directMessages.find(dm => dm.userId === notification.senderId);
      if (directMessage) {
        this.selectDirectMessage(directMessage);
      }
    } else if (notification.type === 'channel' && notification.channelId) {
      // Switch to servers and select the channel
      this.activeTab = 'servers';
      // Find the server and channel
      for (const server of this.chatServers) {
        const channel = server.channels?.find((ch: ChatChannel) => ch.id === notification.channelId);
        if (channel) {
          this.selectedServer = server;
          this.selectChannel(channel);
          break;
        }
      }
    }
    
    // Dismiss the notification after navigation
    this.dismissNotification(notification.id);
    
    // Focus the message input
    setTimeout(() => {
      const messageInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (messageInput) {
        messageInput.focus();
      }
    }, 100);
  }

  dismissNotification(notificationId: string): void {
    this.recentNotifications = this.recentNotifications.filter(n => n.id !== notificationId);
  }

  private addMessageNotification(message: any, type: 'direct' | 'channel'): void {
    // Don't show notifications for our own messages
    if (message.senderId === this.currentUser?.id) return;
    
    // Don't show notification if we're currently viewing this chat
    if (type === 'direct' && this.selectedDirectMessage?.userId === message.senderId) return;
    if (type === 'channel' && this.selectedChannel?.id === message.channelId) return;
    
    const notification: MessageNotification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      username: message.senderUsername || message.sender?.username || 'Unknown',
      avatar: message.senderAvatar || message.sender?.avatar,
      content: message.content,
      timestamp: new Date(),
      isNew: true,
      type: type,
      senderId: message.senderId,
      channelId: type === 'channel' ? message.channelId : undefined
    };
    
    // Add to the beginning of the array
    this.recentNotifications.unshift(notification);
    
    // Keep only the last 5 notifications
    if (this.recentNotifications.length > 5) {
      this.recentNotifications = this.recentNotifications.slice(0, 5);
    }
    
    // Mark as not new after 3 seconds
    setTimeout(() => {
      const notif = this.recentNotifications.find(n => n.id === notification.id);
      if (notif) {
        notif.isNew = false;
      }
    }, 3000);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      this.dismissNotification(notification.id);
    }, 10000);
    
    console.log('🔔 Added notification:', notification);
  }

  // OFFLINE MESSAGE LOADING

  private async loadRecentUnreadMessages(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      console.log('📬 Loading recent unread messages for offline user...');
      
      // Get recent direct messages (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      // Load recent messages for each friend
      for (const dm of this.directMessages) {
        try {
          const recentMessages = await this.chatService.getDirectMessages(dm.userId, 50, 0);
          const unreadMessages = (recentMessages as any[]).filter(msg => {
            const messageTime = new Date(msg.createdAt);
            return messageTime > twentyFourHoursAgo && 
                   msg.senderId !== this.currentUser!.id;
          });
          
          // Update unread count
          dm.unreadCount = unreadMessages.length;
          
          // Show notifications for recent messages (up to 3 per friend)
          const recentUnread = unreadMessages.slice(0, 3);
          for (const msg of recentUnread) {
            this.addMessageNotification({
              ...msg,
              senderUsername: dm.username,
              senderAvatar: dm.avatar
            }, 'direct');
          }
          
        } catch (error) {
          console.error('❌ Error loading recent messages for:', dm.username, error);
        }
      }
      
      // Update total unread count
      this.updateUnreadCount();
      
      console.log('✅ Finished loading recent unread messages');
      
    } catch (error) {
      console.error('❌ Error loading recent unread messages:', error);
    }
  }
}
