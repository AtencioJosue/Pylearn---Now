import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@/context/UserContext";
import { useCurrentUserGamification } from "@/hooks/useUserProgress";

const MAX_LIVES = 5;
const XP_PER_CORRECT = 10;
const STORAGE_KEY = "pylearn_gamification";

interface GamificationState {
  vidas: number;
  rachaDias: number;
  xp: number;
  lastVisitDate: string | null;
  dailyXp: number;
  dailyXpDate: string | null;
}

interface GamificationContextValue extends GamificationState {
  isGameOver: boolean;
  loseLife: (amount?: number) => void;
  gainXP: (amount?: number) => void;
  resetLives: () => void;
}

const defaultState: GamificationState = {
  vidas: MAX_LIVES,
  rachaDias: 1,
  xp: 0,
  lastVisitDate: null,
  dailyXp: 0,
  dailyXpDate: null,
};

const GamificationContext = createContext<GamificationContextValue | null>(
  null,
);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function diffDays(firstDate: string, secondDate: string): number {
  const millisecondsPerDay = 86_400_000;
  return Math.round(
    (new Date(secondDate).getTime() - new Date(firstDate).getTime()) /
      millisecondsPerDay,
  );
}

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}:${userId}` : `${STORAGE_KEY}:guest`;
}

function loadState(
  storageKey: string,
  migrateLegacy = false,
): GamificationState {
  try {
    let rawState = localStorage.getItem(storageKey);
    if (!rawState && migrateLegacy) {
      rawState = localStorage.getItem(STORAGE_KEY);
      if (rawState) {
        localStorage.setItem(storageKey, rawState);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (rawState) {
      return { ...defaultState, ...JSON.parse(rawState) };
    }
  } catch {
    // Ignore malformed local data and start from a valid state.
  }

  return { ...defaultState };
}

function saveState(storageKey: string, state: GamificationState): void {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateDailyStreak(state: GamificationState): GamificationState {
  const today = todayISO();
  if (state.lastVisitDate === today && state.dailyXpDate === today)
    return state;

  let rachaDias = state.rachaDias;
  if (state.lastVisitDate) {
    const difference = diffDays(state.lastVisitDate, today);
    if (difference === 1) rachaDias += 1;
    if (difference > 1) rachaDias = 1;
  }

  return {
    ...state,
    rachaDias,
    lastVisitDate: today,
    dailyXp: state.dailyXpDate === today ? state.dailyXp : 0,
    dailyXpDate: today,
  };
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const storageKey = getStorageKey(user?.id);
  const shouldMigrateLegacy = Boolean(user);
  const [state, setState] = useState<GamificationState>(() =>
    updateDailyStreak(loadState(storageKey)),
  );
  const [loadedStorageKey, setLoadedStorageKey] = useState(storageKey);
  const { data: serverGamification } = useCurrentUserGamification();

  useEffect(() => {
    const nextState = updateDailyStreak(
      loadState(storageKey, shouldMigrateLegacy),
    );
    saveState(storageKey, nextState);
    setState(nextState);
    setLoadedStorageKey(storageKey);
  }, [shouldMigrateLegacy, storageKey]);

  useEffect(() => {
    if (!serverGamification || loadedStorageKey !== storageKey) return;
    setState((previous) => ({
      ...previous,
      // Minigames can add local XP, while exercise XP comes from the server.
      xp: Math.max(previous.xp, serverGamification.totalXp),
    }));
  }, [loadedStorageKey, serverGamification, storageKey]);

  useEffect(() => {
    if (loadedStorageKey === storageKey) {
      saveState(storageKey, state);
    }
  }, [loadedStorageKey, state, storageKey]);

  const loseLife = useCallback((amount = 1) => {
    setState((previous) => ({
      ...previous,
      vidas: Math.max(0, previous.vidas - amount),
    }));
  }, []);

  const gainXP = useCallback((amount = XP_PER_CORRECT) => {
    setState((previous) => ({
      ...previous,
      xp: previous.xp + amount,
      dailyXp: previous.dailyXp + amount,
      dailyXpDate: todayISO(),
    }));
  }, []);

  const resetLives = useCallback(() => {
    setState((previous) => ({ ...previous, vidas: MAX_LIVES }));
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        isGameOver: state.vidas === 0,
        loseLife,
        gainXP,
        resetLives,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within GamificationProvider");
  }
  return context;
}
