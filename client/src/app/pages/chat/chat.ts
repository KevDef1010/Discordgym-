import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../shared/services/auth.service';
import { SocketService, OnlineUser } from '../../shared/services/socket.service';
import { ChatService } from '../../shared/services/chat.service';

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
  imports: [CommonModule, FormsModule],
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
  
  // New server/channel form data
  newServerName = '';
  newServerDescription = '';
  newServerPrivate = false;
  newChannelName = '';
  newChannelDescription = '';
  newChannelPrivate = false;
  
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
      // Let the AuthGuard handle navigation to login
      console.log('No authenticated user found for chat component');
      return;
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
      const friends = await this.chatService.getFriends(this.currentUser.id);
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
    this.selectedDirectMessage = dm;
    this.selectedServer = null;
    this.selectedChannel = null;
    
    // Load DM history
    await this.loadDirectMessageHistory(dm.userId);
    
    console.log('Selected DM with:', dm.username);
    
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
          username: msg.senderUsername || 'Unknown User',
          avatar: msg.senderAvatar
        }
      }));
    } catch (error) {
      console.error('Error loading channel messages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDirectMessageHistory(friendId: string): Promise<void> {
    try {
      this.isLoading = true;
      const messages = await this.chatService.getDirectMessages(friendId);
      this.messages = (messages as any[]).map(msg => ({
        ...msg,
        sender: {
          id: msg.senderId,
          username: msg.senderUsername || 'Unknown User',
          avatar: msg.senderAvatar
        }
      }));
    } catch (error) {
      console.error('Error loading direct messages:', error);
    } finally {
      this.isLoading = false;
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
        this.messages.push({
          id: `temp-${Date.now()}`,
          content: this.newMessage.trim(),
          senderId: this.currentUser.id,
          senderUsername: this.currentUser.username,
          senderAvatar: this.currentUser.avatar,
          messageType: 'TEXT',
          isEdited: false,
          createdAt: new Date().toISOString(),
          reactions: []
        });
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
    // Freundesliste aktualisieren, falls nötig
    if (this.currentUser && (!this.directMessages || this.directMessages.length === 0)) {
      await this.loadDirectMessages();
    }
    this.showFriendChatModal = true;
    console.log('Friend chat modal opened with', this.directMessages.length, 'friends');
  }
  
  // Start a direct message with a user
  async startDirectChat(userId: string, username: string): Promise<void> {
    if (!this.currentUser || userId === this.currentUser.id) return;
    
    try {
      // Switch to direct message tab
      this.activeTab = 'direct';
      
      // Check if we already have this DM in our list
      const existingDM = this.directMessages.find(dm => dm.userId === userId);
      
      if (existingDM) {
        // Select existing direct message
        this.selectDirectMessage(existingDM);
      } else {
        // Initialize a new direct chat
        const chatUser = await this.chatService.getOrCreateDirectChat(userId);
        
        // Create new DM entry
        const newDM: DirectMessage = {
          userId,
          username: chatUser.username || username,
          avatar: chatUser.avatar,
          unreadCount: 0
        };
        
        // Add to list and select
        this.directMessages.push(newDM);
        await this.selectDirectMessage(newDM);
      }
    } catch (error) {
      console.error('Error starting direct chat:', error);
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

  private leaveCurrentRoom(): void {
    // Implementation for leaving current room when socket is properly exposed
    console.log('Leaving current room...');
  }
}
