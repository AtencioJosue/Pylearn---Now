import type { Pool, PoolClient } from "pg";
import type { UserProgress } from "../../local_db";
import { createEmptyUserProgress } from "./user-progress";

interface ProgressRow {
  answers: UserProgress["answers"] | null;
  total_attempts: number;
  correct_attempts: number;
  total_xp: number;
  weekly_xp: number;
  league_tier: number;
  board_id: string;
}

function progressFromRow(row: ProgressRow): UserProgress {
  return {
    answers: row.answers ?? {},
    totalAttempts: row.total_attempts,
    correctAttempts: row.correct_attempts,
    gamification: {
      totalXp: row.total_xp,
      weeklyXp: row.weekly_xp,
      leagueTier: row.league_tier,
      boardId: row.board_id,
    },
  };
}

async function userExists(client: Pool | PoolClient, userId: string) {
  const result = await client.query(
    "SELECT 1 FROM py_users WHERE id = $1 LIMIT 1",
    [userId],
  );
  return result.rowCount === 1;
}

async function ensureProgressRow(client: Pool | PoolClient, userId: string) {
  await client.query(
    `INSERT INTO py_user_progress (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
}

const progressColumns = `
  answers,
  total_attempts,
  correct_attempts,
  total_xp,
  weekly_xp,
  league_tier,
  board_id
`;

export async function getRemoteUserProgress(
  remotePool: Pool,
  userId: string,
): Promise<UserProgress | null> {
  if (!(await userExists(remotePool, userId))) return null;

  await ensureProgressRow(remotePool, userId);
  const result = await remotePool.query<ProgressRow>(
    `SELECT ${progressColumns}
     FROM py_user_progress
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0]
    ? progressFromRow(result.rows[0])
    : createEmptyUserProgress();
}

export async function updateRemoteUserProgress<T>(
  remotePool: Pool,
  userId: string,
  update: (progress: UserProgress) => T,
): Promise<T | null> {
  const client = await remotePool.connect();

  try {
    await client.query("BEGIN");
    if (!(await userExists(client, userId))) {
      await client.query("ROLLBACK");
      return null;
    }

    await ensureProgressRow(client, userId);
    const result = await client.query<ProgressRow>(
      `SELECT ${progressColumns}
       FROM py_user_progress
       WHERE user_id = $1
       FOR UPDATE`,
      [userId],
    );
    const progress = result.rows[0]
      ? progressFromRow(result.rows[0])
      : createEmptyUserProgress();
    const value = update(progress);

    await client.query(
      `UPDATE py_user_progress
       SET answers = $2,
           total_attempts = $3,
           correct_attempts = $4,
           total_xp = $5,
           weekly_xp = $6,
           league_tier = $7,
           board_id = $8,
           updated_at = NOW()
       WHERE user_id = $1`,
      [
        userId,
        progress.answers,
        progress.totalAttempts,
        progress.correctAttempts,
        progress.gamification.totalXp,
        progress.gamification.weeklyXp,
        progress.gamification.leagueTier,
        progress.gamification.boardId,
      ],
    );
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
