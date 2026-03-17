import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Achievement {
  key: string;
  label: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface User {
  id: string;
  name: string;
  achievements: Achievement[];
  exercisesCreated: number;
}

interface UserContextValue {
  user: User | null;
  isRegistered: boolean;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
  register: (name: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  unlockAchievement: (key: string) => Promise<void>;
  pendingAchievement: Achievement | null;
  clearPendingAchievement: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const ACHIEVEMENT_CATALOG: Omit<Achievement, "unlockedAt">[] = [
  { key: "registered", label: "¡Bienvenido!", description: "Creaste tu cuenta en PyLearn", icon: "🎉" },
  { key: "progress_25", label: "Aprendiz", description: "Completaste el 25% de ejercicios", icon: "📚" },
  { key: "progress_50", label: "Practicante", description: "Completaste el 50% de ejercicios", icon: "⚡" },
  { key: "progress_75", label: "Desarrollador", description: "Completaste el 75% de ejercicios", icon: "🔥" },
  { key: "progress_100", label: "Experto Python", description: "¡Completaste todos los ejercicios!", icon: "🏆" },
  { key: "builder_1", label: "Junior Creator", description: "Creaste tu primer ejercicio aprobado", icon: "✏️" },
  { key: "builder_3", label: "Builder", description: "Tienes 3 ejercicios aprobados", icon: "🔨" },
  { key: "builder_7", label: "Senior Builder", description: "Tienes 7 ejercicios aprobados", icon: "⚙️" },
  { key: "builder_15", label: "Master Builder", description: "¡15 ejercicios aprobados! Eres una leyenda", icon: "🌟" },
];

export function getAchievementMeta(key: string) {
  return ACHIEVEMENT_CATALOG.find(a => a.key === key) ?? { key, label: key, description: "", icon: "🏅" };
}

export function getBuilderRank(exercisesCreated: number): string {
  if (exercisesCreated >= 15) return "Master Builder";
  if (exercisesCreated >= 7) return "Senior Builder";
  if (exercisesCreated >= 3) return "Builder";
  if (exercisesCreated >= 1) return "Junior Creator";
  return "Explorador";
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}/api${path}`;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);

  const isRegistered = !!user;

  const fetchUser = useCallback(async (id: string) => {
    try {
      const res = await fetch(api(`/users/${id}`));
      if (!res.ok) return null;
      const data = await res.json();
      const achievements: Achievement[] = (data.achievements ?? []).map((a: { key: string; unlocked_at: string }) => ({
        ...getAchievementMeta(a.key),
        unlockedAt: a.unlocked_at,
      }));
      return { id: data.id, name: data.name, achievements, exercisesCreated: data.exercisesCreated ?? 0 } as User;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("pylearn_user_id");
    if (!storedId) {
      setShowRegister(true);
      return;
    }
    fetchUser(storedId).then(u => {
      if (u) setUser(u);
      else setShowRegister(true);
    });
  }, [fetchUser]);

  const register = useCallback(async (name: string) => {
    const id = generateUUID();
    const res = await fetch(api("/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) throw new Error("No se pudo crear el usuario");
    localStorage.setItem("pylearn_user_id", id);
    const newUser: User = { id, name, achievements: [], exercisesCreated: 0 };
    setUser(newUser);
    setShowRegister(false);
    await fetch(api(`/users/${id}/achievements`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "registered" }),
    });
    const meta = getAchievementMeta("registered");
    setPendingAchievement({ ...meta, unlockedAt: new Date().toISOString() });
  }, []);

  const refreshUser = useCallback(async () => {
    const id = localStorage.getItem("pylearn_user_id");
    if (!id) return;
    const u = await fetchUser(id);
    if (u) setUser(u);
  }, [fetchUser]);

  const unlockAchievement = useCallback(async (key: string) => {
    const id = localStorage.getItem("pylearn_user_id");
    if (!id || !user) return;
    const alreadyHas = user.achievements.some(a => a.key === key);
    if (alreadyHas) return;
    await fetch(api(`/users/${id}/achievements`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const meta = getAchievementMeta(key);
    const newAch: Achievement = { ...meta, unlockedAt: new Date().toISOString() };
    setUser(prev => prev ? { ...prev, achievements: [...prev.achievements, newAch] } : prev);
    setPendingAchievement(newAch);
  }, [user]);

  const clearPendingAchievement = useCallback(() => setPendingAchievement(null), []);

  return (
    <UserContext.Provider value={{
      user, isRegistered, showRegister, setShowRegister,
      register, refreshUser, unlockAchievement,
      pendingAchievement, clearPendingAchievement,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
