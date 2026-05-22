import { Pool } from 'pg';

// Prevent multiple pools in local development due to Next.js HMR
const globalForDb = globalThis as unknown as {
  dbPool: Pool | undefined;
};

export function getDbPool() {
  if (!globalForDb.dbPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    
    console.log('[Neon DB] Creating new PG Pool...');
    globalForDb.dbPool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for secure serverless connecting to Neon Postgres
      },
      max: 10, // Maximum pool size for serverless functions
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 4000,
    });
    
    globalForDb.dbPool.on('error', (err) => {
      console.error('[Neon DB Pool] Unexpected error on idle client:', err);
    });
  }
  return globalForDb.dbPool;
}

export async function query(text: string, params?: unknown[]) {
  const dbPool = getDbPool();
  return dbPool.query(text, params);
}

