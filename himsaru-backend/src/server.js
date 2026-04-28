import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Add Database Connection check here later (e.g., Prisma connect)
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] HIMSARU Backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[Server] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
