import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  const maxAttempts = 5;
  let attempt = 1;
  while (attempt <= maxAttempts) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error: any) {
      console.warn(`⚠️ Database connection attempt ${attempt}/${maxAttempts} failed: ${error.message || error}`);
      if (attempt === maxAttempts) {
        console.error('❌ Database connection failed after max retries:', error);
        process.exit(1);
      }
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📦 Database disconnected');
}
