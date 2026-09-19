import type {
  LocalDB,
  UserGamification,
  UserProgress,
} from "../../local_db";

export const DEFAULT_GAMIFICATION: UserGamification = {
  totalXp: 0,
  weeklyXp: 0,
  leagueTier: 1,
  boardId: "bronce-initial-b1",
};

export function createEmptyUserProgress(): UserProgress {
  return {
    answers: {},
    totalAttempts: 0,
    correctAttempts: 0,
    gamification: { ...DEFAULT_GAMIFICATION },
  };
}

function hasLegacyProgress(db: LocalDB): boolean {
  return (
    Object.keys(db.answers ?? {}).length > 0 ||
    (db.totalAttempts ?? 0) > 0 ||
    (db.correctAttempts ?? 0) > 0 ||
    (db.userGamification?.totalXp ?? 0) > 0
  );
}

function copyLegacyProgress(db: LocalDB): UserProgress {
  return {
    answers: { ...(db.answers ?? {}) },
    totalAttempts: db.totalAttempts ?? 0,
    correctAttempts: db.correctAttempts ?? 0,
    gamification: {
      ...DEFAULT_GAMIFICATION,
      ...(db.userGamification ?? {}),
    },
  };
}

export interface UserProgressLookup {
  progress: UserProgress;
  created: boolean;
  claimedLegacyProgress: boolean;
}

export function getOrCreateUserProgress(
  db: LocalDB,
  userId: string,
): UserProgressLookup {
  db.progressByUser ??= {};

  const existing = db.progressByUser[userId];
  if (existing) {
    return {
      progress: existing,
      created: false,
      claimedLegacyProgress: false,
    };
  }

  const claimedLegacyProgress =
    !db.legacyProgressClaimedBy && hasLegacyProgress(db);
  const progress = claimedLegacyProgress
    ? copyLegacyProgress(db)
    : createEmptyUserProgress();

  db.progressByUser[userId] = progress;
  if (claimedLegacyProgress) {
    db.legacyProgressClaimedBy = userId;
  }

  return {
    progress,
    created: true,
    claimedLegacyProgress,
  };
}
