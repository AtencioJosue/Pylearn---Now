import fs from "fs";
import path from "path";

function resolveDbPath(): string {
  const bundledPath = path.join(import.meta.dirname, "local_db.json");
  if (fs.existsSync(bundledPath)) return bundledPath;
  const cwdPath = path.join(process.cwd(), "local_db.json");
  if (fs.existsSync(cwdPath)) return cwdPath;
  const packagePath = path.resolve(import.meta.dirname, "../local_db.json");
  if (fs.existsSync(packagePath)) return packagePath;
  return cwdPath;
}

const dbPath = resolveDbPath();

export interface AnswerRecord {
  correct: boolean;
  answer: string;
}

export interface UserGamification {
  totalXp: number;
  weeklyXp: number;
  leagueTier: number;
  boardId: string;
}

export interface UserProgress {
  answers: Record<string, AnswerRecord>;
  totalAttempts: number;
  correctAttempts: number;
  gamification: UserGamification;
}

export interface LocalDB {
  users: Record<string, any>;
  sessions?: Record<string, any>;
  emailVerificationTokens?: Record<string, any>;
  passwordResetTokens?: Record<string, any>;
  achievements: Record<string, any[]>;
  answers: Record<string, AnswerRecord>;
  posts: any[];
  postIdCounter: number;
  comments: Record<number, any[]>;
  commentIdCounter: number;
  createdExercises?: any[];
  createdExerciseIdCounter?: number;
  totalAttempts?: number;
  correctAttempts?: number;
  userGamification?: UserGamification;
  progressByUser?: Record<string, UserProgress>;
  legacyProgressClaimedBy?: string;
  leagueHistory?: any[];
}

function loadDB(): LocalDB {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading local db", e);
  }
  return {
    users: {},
    sessions: {},
    emailVerificationTokens: {},
    passwordResetTokens: {},
    achievements: {},
    answers: {},
    posts: [],
    postIdCounter: 1,
    comments: {},
    commentIdCounter: 1,
    createdExercises: [],
    createdExerciseIdCounter: 1,
    totalAttempts: 0,
    correctAttempts: 0,
    userGamification: {
      totalXp: 0,
      weeklyXp: 0,
      leagueTier: 1,
      boardId: "bronce-initial-b1",
    },
    leagueHistory: [],
  };
}

function saveDB(data: LocalDB) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing local db", e);
  }
}

export const localDB = {
  get: loadDB,
  save: saveDB,
};
