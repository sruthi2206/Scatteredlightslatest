import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL to check if it's a local connection
const isLocalDB = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false // Always disable SSL for Replit's internal PostgreSQL
});

export const db = drizzle(pool, { schema });