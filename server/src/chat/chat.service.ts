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
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
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
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    return friendships.map(friendship => 
      friendship.senderId === userId ? friendship.receiver : friendship.sender
    );
  }
}
