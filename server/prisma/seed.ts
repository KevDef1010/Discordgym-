import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding for Professor Demo...');

  // Clear existing data for clean demo
  console.log('🧹 Cleaning existing data...');
  await prisma.chatMessage.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.chatServerInvite.deleteMany();
  await prisma.chatServerMember.deleteMany();
  await prisma.chatChannel.deleteMany();
  await prisma.chatServer.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();

  // Create demo password
  const demoPassword = await bcrypt.hash('demo123', 10);
  
  // Create Professor and student users
  console.log('👥 Creating demo users...');
  
  const users = await Promise.all([
    // Professor user (main demo account)
    prisma.user.create({
      data: {
        discordId: 'prof-demo-001',
        username: 'Professor',
        email: 'professor@university.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Professor',
        role: 'ADMIN',
        displayId: 'Prof#0001',
        isActive: true,
      }
    }),
    
    // Student users for realistic interactions
    prisma.user.create({
      data: {
        discordId: 'student-max-001',
        username: 'MaxMustermann',
        email: 'max@student.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxMustermann',
        role: 'MEMBER',
        displayId: 'Max#1234',
        isActive: true,
      }
    }),
    
    prisma.user.create({
      data: {
        discordId: 'student-anna-002',
        username: 'AnnaMeier',
        email: 'anna@student.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaMeier',
        role: 'MEMBER',
        displayId: 'Anna#5678',
        isActive: true,
      }
    }),
    
    prisma.user.create({
      data: {
        discordId: 'student-tom-003',
        username: 'TomSchmidt',
        email: 'tom@student.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TomSchmidt',
        role: 'MEMBER',
        displayId: 'Tom#9012',
        isActive: false, // Offline user for demo
      }
    }),
    
    prisma.user.create({
      data: {
        discordId: 'student-sara-004',
        username: 'SaraWeber',
        email: 'sara@student.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SaraWeber',
        role: 'MEMBER',
        displayId: 'Sara#3456',
        isActive: true,
      }
    }),
    
    prisma.user.create({
      data: {
        discordId: 'coach-fitness-001',
        username: 'FitnessCoach',
        email: 'coach@discordgym.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessCoach',
        role: 'ADMIN',
        displayId: 'Coach#0001',
        isActive: true,
      }
    }),
    
    // Additional demo users
    prisma.user.create({
      data: {
        discordId: 'user-lisa-005',
        username: 'LisaKlein',
        email: 'lisa@student.de',
        password: demoPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaKlein',
        role: 'MEMBER',
        displayId: 'Lisa#7890',
        isActive: true,
      }
    }),
  ]);
  
  console.log(`✅ Created ${users.length} demo users`);
  
  // Create realistic friendships
  console.log('🤝 Creating friendships...');
  
  await Promise.all([
    // Professor friends with active students
    prisma.friendship.create({
      data: {
        senderId: users[0].id, // Professor
        receiverId: users[1].id, // Max
        status: 'ACCEPTED',
      }
    }),
    
    prisma.friendship.create({
      data: {
        senderId: users[0].id, // Professor
        receiverId: users[2].id, // Anna
        status: 'ACCEPTED',
      }
    }),
    
    // Students are friends with each other
    prisma.friendship.create({
      data: {
        senderId: users[1].id, // Max
        receiverId: users[2].id, // Anna
        status: 'ACCEPTED',
      }
    }),
    
    prisma.friendship.create({
      data: {
        senderId: users[1].id, // Max
        receiverId: users[4].id, // Sara
        status: 'ACCEPTED',
      }
    }),
    
    prisma.friendship.create({
      data: {
        senderId: users[2].id, // Anna
        receiverId: users[6].id, // Lisa
        status: 'ACCEPTED',
      }
    }),
    
    // Pending friendship for demo
    prisma.friendship.create({
      data: {
        senderId: users[2].id, // Anna
        receiverId: users[3].id, // Tom (offline)
        status: 'PENDING',
      }
    }),
  ]);
  
  console.log('✅ Created friendships');
  
  // Create comprehensive chat servers
  console.log('🏢 Creating chat servers...');
  
  const servers = await Promise.all([
    // University Fitness Community Server
    prisma.chatServer.create({
      data: {
        name: 'Universität Fitness Gemeinschaft',
        description: 'Offizielle Fitness-Community der Universität für Studenten und Dozenten',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=University',
        ownerId: users[0].id, // Professor as owner
        isPrivate: false,
      }
    }),
    
    // Study Group Server
    prisma.chatServer.create({
      data: {
        name: 'Informatik Lerngruppe WS24',
        description: 'Lerngruppe für Informatikstudenten Winter Semester 2024',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=StudyGroup',
        ownerId: users[1].id, // Max as owner
        isPrivate: true,
      }
    }),
    
    // Fitness Challenges Server
    prisma.chatServer.create({
      data: {
        name: 'Discord Gym Challenges',
        description: 'Wöchentliche Fitness-Challenges und Motivation',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Challenges',
        ownerId: users[5].id, // FitnessCoach as owner
        isPrivate: false,
      }
    }),
  ]);
  
  console.log(`✅ Created ${servers.length} chat servers`);
  
  // Create server members with realistic roles
  console.log('👥 Adding server members...');
  
  const serverMembers = await Promise.all([
    // University Fitness Community members
    prisma.chatServerMember.create({
      data: {
        userId: users[0].id, // Professor
        chatServerId: servers[0].id,
        role: 'OWNER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[1].id, // Max
        chatServerId: servers[0].id,
        role: 'MEMBER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[2].id, // Anna
        chatServerId: servers[0].id,
        role: 'ADMIN',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[4].id, // Sara
        chatServerId: servers[0].id,
        role: 'MEMBER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[5].id, // FitnessCoach
        chatServerId: servers[0].id,
        role: 'ADMIN',
      }
    }),
    
    // Study Group members
    prisma.chatServerMember.create({
      data: {
        userId: users[1].id, // Max
        chatServerId: servers[1].id,
        role: 'OWNER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[2].id, // Anna
        chatServerId: servers[1].id,
        role: 'ADMIN',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[4].id, // Sara
        chatServerId: servers[1].id,
        role: 'MEMBER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[6].id, // Lisa
        chatServerId: servers[1].id,
        role: 'MEMBER',
      }
    }),
    
    // Fitness Challenges members
    prisma.chatServerMember.create({
      data: {
        userId: users[5].id, // FitnessCoach
        chatServerId: servers[2].id,
        role: 'OWNER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[0].id, // Professor
        chatServerId: servers[2].id,
        role: 'MEMBER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[1].id, // Max
        chatServerId: servers[2].id,
        role: 'MEMBER',
      }
    }),
    
    prisma.chatServerMember.create({
      data: {
        userId: users[2].id, // Anna
        chatServerId: servers[2].id,
        role: 'MEMBER',
      }
    }),
  ]);
  
  console.log(`✅ Added ${serverMembers.length} server members`);
  
  // Create diverse channels for each server
  console.log('📺 Creating channels...');
  
  const channels = await Promise.all([
    // University Fitness Community channels
    prisma.chatChannel.create({
      data: {
        name: 'allgemein',
        description: 'Allgemeine Diskussionen über Fitness und Gesundheit',
        chatServerId: servers[0].id,
        position: 0,
      }
    }),
    
    prisma.chatChannel.create({
      data: {
        name: 'workout-tipps',
        description: 'Teilt eure besten Workout-Routinen und Tipps',
        chatServerId: servers[0].id,
        position: 1,
      }
    }),
    
    prisma.chatChannel.create({
      data: {
        name: 'ernährung',
        description: 'Gesunde Ernährung und Rezepte',
        chatServerId: servers[0].id,
        position: 2,
      }
    }),
    
    prisma.chatChannel.create({
      data: {
        name: 'motivation',
        description: 'Motivation und Erfolgsgeschichten',
        chatServerId: servers[0].id,
        position: 3,
      }
    }),
    
    // Study Group channels
    prisma.chatChannel.create({
      data: {
        name: 'general',
        description: 'Allgemeine Diskussionen',
        chatServerId: servers[1].id,
        position: 0,
      }
    }),
    
    prisma.chatChannel.create({
      data: {
        name: 'algorithmen',
        description: 'Algorithmen und Datenstrukturen',
        chatServerId: servers[1].id,
        position: 1,
      }
    }),
    
    prisma.chatChannel.create({
      data: {
        name: 'projekte',
        description: 'Gemeinsame Projekte und Code-Reviews',
        chatServerId: servers[1].id,
        position: 2,
      }
    }),
    
    // Fitness Challenges channels
    prisma.chatChannel.create({
      data: {
        name: 'current-challenge',
        description: 'Aktuelle Wochenchallenge',
        chatServerId: servers[2].id,
        position: 0,
      }
    }),
    
    prisma.chatChannel.create({
      data: {
        name: 'leaderboard',
        description: 'Rangliste und Erfolge',
        chatServerId: servers[2].id,
        position: 1,
      }
    }),
  ]);
  
  console.log(`✅ Created ${channels.length} channels`);
  
  // Create realistic chat messages for demonstration
  console.log('💬 Creating chat messages...');
  
  // Create extensive chat messages for realistic demo
  console.log('💬 Creating extensive chat messages...');
  
  const messages = [];
  
  // University Fitness Community - allgemein channel (15+ messages)
  const generalMessages = [
    {
      content: 'Willkommen in unserer Universitäts-Fitness-Community! Hier könnt ihr euch über alle Themen rund um Sport und Gesundheit austauschen.',
      senderId: users[0].id, // Professor
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      content: 'Danke Professor! Freue mich auf den Austausch mit allen 💪',
      senderId: users[1].id, // Max
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    },
    {
      content: 'Super Initiative! Endlich eine Plattform wo wir uns alle austauschen können 🎉',
      senderId: users[2].id, // Anna
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      content: 'Hallo zusammen! Bin auch dabei. Freue mich auf gemeinsame Workouts! 🏃‍♀️',
      senderId: users[4].id, // Sara
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Hey Leute! Als Fitness Coach stehe ich euch gerne mit Rat und Tat zur Seite 💪',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      content: 'Wer hat Lust auf eine gemeinsame Jogging-Runde morgen um 7 Uhr? 🌅',
      senderId: users[1].id, // Max
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Ich bin dabei! Wo treffen wir uns denn?',
      senderId: users[2].id, // Anna
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    },
    {
      content: 'Uni-Haupteingang? Dann können wir durch den Park laufen',
      senderId: users[1].id, // Max
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
    },
    {
      content: 'Perfekt! Bin dabei 🏃‍♀️ Wie weit laufen wir denn?',
      senderId: users[4].id, // Sara
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      content: 'Ich würde sagen 5km für den Anfang. Ist für alle machbar 👍',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
    },
    {
      content: 'Das Jogging heute war super! Danke fürs Organisieren Max 🙏',
      senderId: users[2].id, // Anna
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Ja, war richtig schön! Nächste Woche wieder? 😊',
      senderId: users[4].id, // Sara
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      content: 'Auf jeden Fall! Vielleicht können wir es zur wöchentlichen Tradition machen?',
      senderId: users[1].id, // Max
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    },
    {
      content: 'Großartige Idee! Regelmäßiger Sport ist wichtig für Körper und Geist 🧠💪',
      senderId: users[0].id, // Professor
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      content: 'Hat jemand Lust heute Abend zusammen ins Fitnessstudio zu gehen?',
      senderId: users[2].id, // Anna
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      content: 'Gerne! Um wie viel Uhr denn? Ich hätte ab 18 Uhr Zeit',
      senderId: users[6].id, // Lisa
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
    {
      content: '18 Uhr passt perfekt! Sehen uns am Eingang 💪',
      senderId: users[2].id, // Anna
      channelId: channels[0].id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ];
  
  // Workout tips channel (10+ messages)
  const workoutMessages = [
    {
      content: 'Hier ist mein Lieblings-Ganzkörperworkout:\n1. Squats 3x12\n2. Push-ups 3x10\n3. Planks 3x30s\n4. Lunges 3x10 pro Bein\n\nPerfekt für Anfänger!',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Super Workout! Ich habe es heute ausprobiert und bin richtig ins Schwitzen gekommen 😅',
      senderId: users[4].id, // Sara
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Kann ich bestätigen! Besonders die Planks haben es in sich 🔥',
      senderId: users[1].id, // Max
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      content: 'Für Fortgeschrittene: Versucht mal Burpees 3x8 zusätzlich einzubauen 💀',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Burpees sind der Tod 😵 Aber effektiv!',
      senderId: users[2].id, // Anna
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      content: 'Hat jemand gute Stretching-Übungen für nach dem Workout?',
      senderId: users[6].id, // Lisa
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Yoga-Flow für 10 Minuten ist perfekt! Kann ein Video empfehlen',
      senderId: users[2].id, // Anna
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    },
    {
      content: 'Ja bitte! Link wäre super 🙏',
      senderId: users[4].id, // Sara
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
    },
    {
      content: 'Wichtiger Tipp: Immer auf den Körper hören und nicht übertreiben!',
      senderId: users[0].id, // Professor
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Absolut richtig! Recovery ist genauso wichtig wie das Training 💯',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[1].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    },
  ];
  
  // Study Group messages (8+ messages)
  const studyMessages = [
    {
      content: 'Hey Leute! Neue Lerngruppe für das Wintersemester 📚',
      senderId: users[1].id, // Max
      channelId: channels[4].id, // general channel of study group
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Super! Endlich können wir uns richtig organisieren 🎓',
      senderId: users[2].id, // Anna
      channelId: channels[4].id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      content: 'Welche Fächer nehmen wir denn alle? Algorithmen auf jeden Fall, oder?',
      senderId: users[4].id, // Sara
      channelId: channels[4].id,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Ja, und Datenbanken. Das wird schwer 😰',
      senderId: users[6].id, // Lisa
      channelId: channels[4].id,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    {
      content: 'Zusammen schaffen wir das! Können ja regelmäßige Study Sessions machen',
      senderId: users[1].id, // Max
      channelId: channels[4].id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      content: 'Gute Idee! Montags und Donnerstags in der Bibliothek?',
      senderId: users[2].id, // Anna
      channelId: channels[4].id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
    {
      content: 'Hey Leute! Morgen ist die Klausur in Algorithmen. Wer hat noch Fragen zu Quicksort?',
      senderId: users[1].id, // Max
      channelId: channels[5].id, // algorithmen channel
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      content: 'Ich verstehe noch nicht ganz den Worst-Case von Quicksort. Kann mir jemand helfen?',
      senderId: users[6].id, // Lisa
      channelId: channels[5].id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      content: 'Der Worst-Case ist O(n²) und tritt auf, wenn das Pivot-Element immer das kleinste oder größte Element ist. Aber im Average-Case ist es O(n log n).',
      senderId: users[2].id, // Anna
      channelId: channels[5].id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      content: 'Danke Anna! Das hilft mir sehr 🙏 Noch eine Frage zu Mergesort...',
      senderId: users[6].id, // Lisa
      channelId: channels[5].id,
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    },
  ];
  
  // Challenge messages (8+ messages)
  const challengeMessages = [
    {
      content: '🏃‍♂️ NEUE WOCHENCHALLENGE! 🏃‍♀️\n\nDiese Woche: 10.000 Schritte täglich\n\nWer schafft es alle 7 Tage? Postet eure Screenshots!',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[7].id, // current-challenge channel
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      content: 'Challenge accepted! 💪 Bin heute schon bei 8.500 Schritten',
      senderId: users[1].id, // Max
      channelId: channels[7].id,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
    {
      content: 'Ich bin auch dabei! 12.000 Schritte am ersten Tag 🔥',
      senderId: users[2].id, // Anna
      channelId: channels[7].id,
      createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
    },
    {
      content: 'Wow Anna! Du setzt die Messlatte hoch 😅',
      senderId: users[4].id, // Sara
      channelId: channels[7].id,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      content: 'Tag 3: 11.200 Schritte! Die Challenge motiviert richtig',
      senderId: users[1].id, // Max
      channelId: channels[7].id,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      content: 'Halbzeit geschafft! Wie sieht es bei euch aus? �',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[7].id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      content: 'Bin stolz auf mich - jeden Tag über 10k! 🎉',
      senderId: users[6].id, // Lisa
      channelId: channels[7].id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      content: 'Leaderboard Update kommt gleich! Ihr seid alle fantastisch 🏆',
      senderId: users[5].id, // FitnessCoach
      channelId: channels[8].id, // leaderboard channel
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ];
  
  // Combine all messages
  const allMessages = [...generalMessages, ...workoutMessages, ...studyMessages, ...challengeMessages];
  
  // Create all messages
  for (const messageData of allMessages) {
    const message = await prisma.chatMessage.create({
      data: messageData
    });
    messages.push(message);
  }
  
  console.log(`✅ Created ${messages.length} chat messages`);
  
  // Add some message reactions for realism
  console.log('👍 Adding message reactions...');
  
  const reactions = await Promise.all([
    prisma.messageReaction.create({
      data: {
        messageId: messages[0].id,
        userId: users[1].id,
        emoji: '👍',
      }
    }),
    
    prisma.messageReaction.create({
      data: {
        messageId: messages[0].id,
        userId: users[2].id,
        emoji: '❤️',
      }
    }),
    
    prisma.messageReaction.create({
      data: {
        messageId: messages[3].id, // Workout tips
        userId: users[1].id,
        emoji: '💪',
      }
    }),
    
    prisma.messageReaction.create({
      data: {
        messageId: messages[3].id,
        userId: users[2].id,
        emoji: '🔥',
      }
    }),
    
    prisma.messageReaction.create({
      data: {
        messageId: messages[8].id, // Challenge message
        userId: users[0].id,
        emoji: '🏆',
      }
    }),
    
    prisma.messageReaction.create({
      data: {
        messageId: messages[9].id, // Challenge response
        userId: users[5].id,
        emoji: '👏',
      }
    }),
  ]);
  
  console.log(`✅ Added ${reactions.length} message reactions`);
  
  console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('\n� Demo Data Summary:');
  console.log(`👥 Users: ${users.length} (including Professor, Students, and Fitness Coach)`);
  console.log(`🏢 Servers: ${servers.length} (University Fitness, Study Group, Challenges)`);
  console.log(`📺 Channels: ${channels.length} (Various topics per server)`);
  console.log(`💬 Messages: ${messages.length} (Realistic conversations)`);
  console.log(`👍 Reactions: ${reactions.length} (Message interactions)`);
  
  console.log('\n🔐 Demo Login Credentials:');
  console.log('📧 Email: professor@university.de');
  console.log('🔑 Password: demo123');
  console.log('\n📧 Alternative Users:');
  console.log('   max@student.de (Max Mustermann)');
  console.log('   anna@student.de (Anna Meier)');
  console.log('   coach@discordgym.de (Fitness Coach)');
  console.log('   All passwords: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
