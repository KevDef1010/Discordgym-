import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Get user's servers
  async getUserServers(userId: string) {
    return this.prisma.chatServer.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        channels: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });
  }

  // Create new server
  async createServer(data: {
    name: string;
    description?: string;
    isPrivate: boolean;
    ownerId: string;
  }) {
    const server = await this.prisma.chatServer.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: 'OWNER'
          }
        },
        channels: {
          create: {
            name: 'general',
            description: 'General channel',
            isPrivate: false
          }
        }
      },
      include: {
        channels: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    return server;
  }

  // Create new channel
  async createChannel(data: {
    name: string;
    description?: string;
    isPrivate: boolean;
    serverId: string;
  }) {
    return this.prisma.chatChannel.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        chatServerId: data.serverId
      }
    });
  }

  // Get channel messages
  async getChannelMessages(channelId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        channelId: channelId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50
    });
  }

  // Get direct messages
  async getDirectMessages(userId: string, friendId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50
    });
  }

  // Send channel message
  async sendChannelMessage(data: {
    content: string;
    senderId: string;
    channelId: string;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        channelId: data.channelId,
        messageType: 'TEXT'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });
  }

  // Send direct message
  async sendDirectMessage(data: {
    content: string;
    senderId: string;
    receiverId: string;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        messageType: 'TEXT'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });
  }

    // Get user's friends
  async getFriends(userId: string) {
    // Find approved friendships where the user is either the initiator or the receiver
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { initiatorId: userId, status: 'APPROVED' },
          { receiverId: userId, status: 'APPROVED' }
        ]
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            displayId: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            displayId: true
          }
        }
      }
    });

    // Convert to a list of friends
    const friends = friendships.map(friendship => {
      // If user is the initiator, return the receiver as friend
      if (friendship.initiatorId === userId) {
        return friendship.receiver;
      }
      // If user is the receiver, return the initiator as friend
      return friendship.initiator;
    });

    return friends;
  }
  
  // Get or create a direct chat with a user
  async getOrCreateDirectChat(currentUserId: string, targetUserId: string) {
    // First, check if the users are friends
    const isFriend = await this.prisma.friendship.findFirst({
      where: {
        AND: [
          {
            OR: [
              { senderId: currentUserId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: currentUserId }
            ]
          },
          { status: 'ACCEPTED' }
        ]
      }
    });
    
    if (!isFriend) {
      throw new Error('Users are not friends');
    }
    
    // Get target user details for the chat
    const targetUser = await this.prisma.user.findUnique({
      where: {
        id: targetUserId
      },
      select: {
        id: true,
        username: true,
        avatar: true
      }
    });
    
    if (!targetUser) {
      throw new Error('Target user not found');
    }
    
    // We don't actually need to create anything in the DB here,
    // since direct messages are just stored with sender and receiver IDs
    // Return the target user info for the chat UI
    return targetUser;
  }
}
