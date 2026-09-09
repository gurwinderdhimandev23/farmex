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

function getSanitizedDbUrl(): string {
  let url = env.DATABASE_URL;
  // If Supabase pooler is configured with port 5432 (Session mode), auto-route to 6543 (Transaction mode)
  // to avoid EMAXCONNSESSION errors on serverless platforms (Vercel)
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
    if (!url.includes("pgbouncer=true")) {
      url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }
  return url;
}

function getDatabaseClient(): PrismaClient {
  if (globalThis.prismaGlobal) {
    return globalThis.prismaGlobal;
  }

  const isServerless =
    !!process.env.VERCEL ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    env.NODE_ENV === "production";

  const isCloudDb =
    env.DATABASE_URL.includes("supabase.com") ||
    env.DATABASE_URL.includes("pooler") ||
    env.DATABASE_URL.includes("aws") ||
    isServerless;

  const connectionString = getSanitizedDbUrl();

  const pool =
    globalThis.pgPoolGlobal ??
    new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: isServerless ? 2000 : 10000,
      max: isServerless ? 1 : 2, // 1 connection per serverless lambda prevents connection exhaustion
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

