import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@discordgym.com' },
    update: {},
    create: {
      discordId: '999999999999999999',
      username: 'Admin',
      email: 'admin@discordgym.com',
      password: hashedAdminPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: 'SUPER_ADMIN',
      displayId: '@admin-super999',
      isActive: true,
    },
  });

  console.log('👑 Admin user created:', adminUser.username);

  // Create demo users
  const demoUsers = [
    {
      discordId: '111111111111111111',
      username: 'FitnessKing',
      email: 'king@discordgym.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessKing',
      displayId: '@fitnessking-power001',
    },
    {
      discordId: '222222222222222222',
      username: 'CardioQueen',
      email: 'queen@discordgym.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CardioQueen',
      displayId: '@cardioqueen-speed002',
    },
    {
      discordId: '333333333333333333',
      username: 'StrengthBeast',
      email: 'beast@discordgym.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StrengthBeast',
      displayId: '@strengthbeast-iron003',
    },
  ];

  for (const userData of demoUsers) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
      },
    });
    
    console.log('👤 Demo user created:', user.username);
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
