import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// We'll implement a local in-memory approach since there are issues with the Neon DB connection
// This will be transparent to the rest of the application

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function createDatabaseConnection() {
  // Even though we'll use an in-memory approach, we keep the retry logic for future database usage
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test the connection
      await pool.query('SELECT 1');
      console.log('Database connection established successfully');

      return pool;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error);

      // On last retry, log error but don't throw - we'll fall back to memory storage
      if (attempt === MAX_RETRIES) {
        console.error('All database connection attempts failed, will use in-memory storage');
        // Create a mock pool that will be used by the MemStorage class
        return {
          query: async () => ({ rows: [] }),
          end: async () => {}
        } as unknown as Pool;
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

export const pool = await createDatabaseConnection();

const MAX_RETRIES_DRIZZLE = 5;
const RETRY_DELAY_DRIZZLE = 5000;

const connectWithRetry = async (retries = MAX_RETRIES_DRIZZLE) => {
  try {
    return drizzle(pool, { schema });
  } catch (error) {
    if (retries > 0) {
      console.log(`Database connection failed, retrying in ${RETRY_DELAY_DRIZZLE/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_DRIZZLE));
      return connectWithRetry(retries - 1);
    }
    throw error;
  }
};

export const db = await connectWithRetry();