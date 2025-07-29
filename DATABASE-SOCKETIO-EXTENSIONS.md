# Socket.IO Database Extensions

## 1. User Model erweitern für Online Status:

```prisma
model User {
  // ... existing fields ...
  lastSeen        DateTime?    // Wann war User zuletzt online
  isOnline        Boolean      @default(false)  // Aktueller Online Status
  onlineStatus    OnlineStatus @default(OFFLINE) // Erweiterte Status
  
  // Chat Nachrichten
  sentMessages     ChatMessage[] @relation("MessageSender")
  receivedMessages ChatMessage[] @relation("MessageReceiver")
  
  // Chat Räume
  chatRooms       ChatRoomMember[]
}

enum OnlineStatus {
  ONLINE
  OFFLINE  
  AWAY
  DO_NOT_DISTURB
}
```

## 2. Chat System Models:

```prisma
model ChatMessage {
  id          String      @id @default(cuid())
  content     String
  senderId    String
  receiverId  String?     // Für private Nachrichten
  chatRoomId  String?     // Für Gruppen Chat
  messageType MessageType @default(TEXT)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  isRead      Boolean     @default(false)
  isEdited    Boolean     @default(false)
  
  sender     User      @relation("MessageSender", fields: [senderId], references: [id])
  receiver   User?     @relation("MessageReceiver", fields: [receiverId], references: [id])
  chatRoom   ChatRoom? @relation(fields: [chatRoomId], references: [id])
  
  @@map("chat_messages")
}

model ChatRoom {
  id        String   @id @default(cuid())
  name      String
  isGroup   Boolean  @default(false)
  createdAt DateTime @default(now())
  
  messages ChatMessage[]
  members  ChatRoomMember[]
  
  @@map("chat_rooms")
}

model ChatRoomMember {
  id         String   @id @default(cuid())
  userId     String
  chatRoomId String
  joinedAt   DateTime @default(now())
  
  user     User     @relation(fields: [userId], references: [id])
  chatRoom ChatRoom @relation(fields: [chatRoomId], references: [id])
  
  @@unique([userId, chatRoomId])
  @@map("chat_room_members")
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  SYSTEM
}
```
