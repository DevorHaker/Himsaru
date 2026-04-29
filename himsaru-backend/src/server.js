import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Auto-migrate: Ensure profile columns exist
    console.log('[Database] Syncing schema...');
    try {
      const { default: prisma } = await import('./models/prisma.js');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "state" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
      `);
      console.log('[Database] Schema sync successful.');
    } catch (dbError) {
      console.error('[Database] Schema sync failed (might already exist):', dbError.message);
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] HIMSARU Backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[Server] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
