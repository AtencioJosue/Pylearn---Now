import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const remoteDatabaseEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.USE_REMOTE_DATABASE === "true";

export const pool =
  databaseUrl && remoteDatabaseEnabled
    ? new Pool({ connectionString: databaseUrl })
    : null;
