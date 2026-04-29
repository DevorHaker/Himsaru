import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection...');
    const userCount = await prisma.user.count();
    console.log('Connection successful. User count:', userCount);
    
    // Check if new fields exist
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length > 0) {
      console.log('User fields:', Object.keys(users[0]));
    }
  } catch (e) {
    console.error('Connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
