import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../config/env';

declare global {
  // Allow global var re-declarations for dev hot-reloading
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var pgPoolGlobal: pg.Pool | undefined;
}

function getDatabaseClient(): PrismaClient {
  if (globalThis.prismaGlobal) {
    return globalThis.prismaGlobal;
  }

  const isCloudDb =
    env.DATABASE_URL.includes("supabase.com") ||
    env.DATABASE_URL.includes("pooler") ||
    env.DATABASE_URL.includes("aws") ||
    env.NODE_ENV === "production";

  const pool =
    globalThis.pgPoolGlobal ??
    new pg.Pool({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 10000,
      max: env.NODE_ENV === 'production' ? 10 : 2,
      ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
      allowExitOnIdle: true,
    });

  if (!globalThis.pgPoolGlobal) {
    pool.on('error', (err) => {
      console.error('[DATABASE_POOL_ERROR]', err.message);
    });
    globalThis.pgPoolGlobal = pool;
  }

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  globalThis.prismaGlobal = client;

  return client;
}

export const prisma: PrismaClient = getDatabaseClient();

export default prisma;

