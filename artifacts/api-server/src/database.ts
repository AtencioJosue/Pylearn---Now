import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const remoteDatabaseEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  process.env.USE_REMOTE_DATABASE === "true";

export const pool =
  databaseUrl && remoteDatabaseEnabled
    ? new Pool({ connectionString: databaseUrl })
    : null;

let schemaReady: Promise<void> | null = null;

/**
 * Creates only the additive authentication structures needed by the API.
 * The rest of the application schema is still managed by Drizzle.
 */
export function ensureRemoteAuthSchema(): Promise<void> {
  if (!pool) return Promise.resolve();
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    await pool.query(`
      ALTER TABLE py_users
        ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS py_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES py_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS py_sessions_user_id_idx
        ON py_sessions(user_id);
      CREATE INDEX IF NOT EXISTS py_sessions_expires_at_idx
        ON py_sessions(expires_at);

      CREATE TABLE IF NOT EXISTS py_email_verification_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES py_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS py_email_verification_tokens_user_id_idx
        ON py_email_verification_tokens(user_id);

      CREATE TABLE IF NOT EXISTS py_password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES py_users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS py_password_reset_tokens_user_id_idx
        ON py_password_reset_tokens(user_id);
    `);
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}
