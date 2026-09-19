export const BASE_XP = 100;
export const EXPONENT = 1.8;

export interface XPProgress {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  percentage: number;
  totalXp: number;
}

// Obtener el Nivel General a partir de la XP Total
export function getLevelFromXP(totalXp: number): number {
  if (totalXp <= 0) return 1;
  // totalXp = BASE * (N - 1)^EXPONENT  =>  N = (totalXp / BASE)^(1 / EXPONENT) + 1
  return Math.floor(Math.pow(totalXp / BASE_XP, 1 / EXPONENT)) + 1;
}

// Obtener la XP necesaria acumulada para llegar al inicio de un Nivel N
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(level - 1, EXPONENT));
}

// Calcular el Progreso Detallado para la interfaz de la Barra
export function getXPProgress(totalXp: number): XPProgress {
  const currentLevel = getLevelFromXP(totalXp);
  const xpAtLevelStart = getXPRequiredForLevel(currentLevel);
  const xpAtLevelEnd = getXPRequiredForLevel(currentLevel + 1);

  const xpInCurrentLevel = totalXp - xpAtLevelStart;
  const xpNeededForNextLevel = xpAtLevelEnd - xpAtLevelStart;
  
  let percentage = 0;
  if (xpNeededForNextLevel > 0) {
    percentage = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)));
  }

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    percentage,
    totalXp,
  };
}

import { localDB } from "./local_db";

export function runWeeklyLeagueResolution(currentWeek: string, nextWeek: string) {
  console.log(`Iniciando resolución de ligas para la semana: ${currentWeek}...`);

  const db = localDB.get();
  if (!db.leagueHistory) db.leagueHistory = [];

  const userProgressEntries = Object.entries(db.progressByUser ?? {});
  for (const [userId, progress] of userProgressEntries) {
    const gamification = progress.gamification;
    const position = 1;
    const previousTier = gamification.leagueTier;
    const newTier = previousTier < 6 ? previousTier + 1 : previousTier;
    const status = newTier > previousTier ? "promoted" : "stayed";

    db.leagueHistory.push({
      userId,
      weekIdentifier: currentWeek,
      leagueTier: previousTier,
      finalPosition: position,
      finalWeeklyXp: gamification.weeklyXp,
      status,
    });

    gamification.leagueTier = newTier;
    gamification.weeklyXp = 0;
    gamification.boardId = `tier-${newTier}-${nextWeek}-b1`;
  }

  localDB.save(db);
  console.log(`¡Ligas procesadas para ${userProgressEntries.length} usuarios!`);
}
