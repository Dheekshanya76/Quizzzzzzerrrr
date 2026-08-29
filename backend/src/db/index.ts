import path from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: path.resolve(__dirname, "../../.env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to connect to PostgreSQL");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initializeDatabase(): Promise<void> {
  await pool.query("SELECT 1");
}
