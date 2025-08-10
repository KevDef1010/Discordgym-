const fs = require('fs');
const path = require('path');

// Read the chat.ts file
const filePath = path.join(__dirname, 'client', 'src', 'app', 'pages', 'chat', 'chat.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Remove all console statements
content = content.replace(/\s*console\.(log|error|warn|debug|info)\([^;]*\);?\s*/g, '');

// Clean up multiple empty lines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Add thoughtful student comments
const improvements = [
  {
    search: 'ngOnInit(): void {',
    replace: `ngOnInit(): void {
    // Initialize the chat component when it loads`
  },
  {
    search: 'constructor(',
    replace: `// Main chat component - handles all real-time messaging functionality
  constructor(`
  },
  {
    search: 'setupSocketListeners(): void {',
    replace: `// Set up real-time socket connections for live messaging
  setupSocketListeners(): void {`
  },
  {
    search: 'private loadDirectMessages(): Promise<void> {',
    replace: `// Load the user's friends list and create direct message chats
  private async loadDirectMessages(): Promise<void> {`
  },
  {
    search: 'async selectDirectMessage(dm: DirectMessage): Promise<void> {',
    replace: `// Switch to a specific direct message conversation
  async selectDirectMessage(dm: DirectMessage): Promise<void> {`
  },
  {
    search: 'private updateUnreadCount(): void {',
    replace: `// Calculate total unread messages and update UI indicators
  private updateUnreadCount(): void {`
  },
  {
    search: 'private markChatAsRead(chatId: string, type: \'direct\' | \'channel\'): void {',
    replace: `// Mark all messages in a chat as read and clear notifications
  private markChatAsRead(chatId: string, type: 'direct' | 'channel'): void {`
  },
  {
    search: 'private initializeReadMessages(): void {',
    replace: `// Load previously read messages from browser storage
  private initializeReadMessages(): void {`
  }
];

// Apply improvements
improvements.forEach(improvement => {
  content = content.replace(improvement.search, improvement.replace);
});

// Write the cleaned file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Chat component cleaned up successfully!');
console.log('📝 Removed all console statements and added student-style comments');
