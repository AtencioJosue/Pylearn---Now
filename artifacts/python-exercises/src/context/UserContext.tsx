import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

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
  email?: string;
  avatar_url?: string;
  created_at?: string;
  achievements: Achievement[];
  exercisesCreated: number;
}

interface UserContextValue {
  user: User | null;
  isRegistered: boolean;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, avatar_url?: string) => Promise<void>;
  uploadAvatar: (base64Data: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  unlockAchievement: (key: string) => Promise<void>;
  pendingAchievement: Achievement | null;
  clearPendingAchievement: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const ACHIEVEMENT_CATALOG: Omit<Achievement, "unlockedAt">[] = [
  { key: "registered", label: "¡Bienvenido!", description: "Creaste tu cuenta en Pylearn", icon: "🎉" },
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const achievementRequests = useRef(new Set<string>());

  const isRegistered = !!user;

  const fetchUser = useCallback(async (id: string) => {
    const res = await fetch(api(`/users/${id}`));
    if (res.status === 404) return null;
    if (!res.ok)
      throw new Error(`No se pudo cargar el usuario (${res.status}).`);
    const data = await res.json();
    const achievements: Achievement[] = (data.achievements ?? []).map(
      (a: { key: string; unlocked_at: string }) => ({
        ...getAchievementMeta(a.key),
        unlockedAt: a.unlocked_at,
      }),
    );
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      avatar_url: data.avatar_url || "",
      created_at: data.created_at || "",
      achievements,
      exercisesCreated: data.exercisesCreated ?? 0,
    } as User;
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("pylearn_user_id");
    if (!storedId) {
      setShowRegister(true);
      return;
    }

    let active = true;
    let retryTimer: number | undefined;
    const loadStoredUser = async () => {
      try {
        const storedUser = await fetchUser(storedId);
        if (!active) return;
        if (storedUser) {
          setUser(storedUser);
          setShowRegister(false);
        } else {
          localStorage.removeItem("pylearn_user_id");
          setShowRegister(true);
        }
      } catch {
        if (!active) return;
        setShowRegister(false);
        retryTimer = window.setTimeout(loadStoredUser, 3000);
      }
    };

    void loadStoredUser();
    return () => {
      active = false;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [fetchUser]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(api("/users/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      throw new Error("No se pudo conectar con el servidor backend (puerto 3001). Asegúrate de que esté en ejecución.");
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON response (e.g. proxy error or gateway timeout)
    }

    if (!res.ok) {
      throw new Error(data?.error || `Error del servidor (${res.status}). No se pudo registrar el usuario.`);
    }

    if (!data || !data.id) {
      throw new Error("Respuesta inesperada del servidor al registrar.");
    }

    const id = data.id;

    localStorage.setItem("pylearn_user_id", id);
    const registeredAchievement: Achievement = {
      ...getAchievementMeta("registered"),
      unlockedAt: data.created_at || new Date().toISOString(),
    };
    const newUser: User = {
      id,
      name,
      email,
      avatar_url: "",
      created_at: data.created_at || new Date().toISOString(),
      achievements: [registeredAchievement],
      exercisesCreated: 0,
    };

    setUser(newUser);
    setShowRegister(false);

    setPendingAchievement(registeredAchievement);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(api("/users/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("No se pudo conectar con el servidor backend (puerto 3001). Asegúrate de que esté en ejecución.");
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON response
    }

    if (!res.ok) {
      throw new Error(data?.error || "Credenciales incorrectas o error en el servidor.");
    }

    if (!data || !data.id) {
      throw new Error("Respuesta inesperada del servidor al iniciar sesión.");
    }

    localStorage.setItem("pylearn_user_id", data.id);

    // Refresh fully with achievements
    const fullUser = await fetchUser(data.id);
    if (fullUser) {
      setUser(fullUser);
      setShowRegister(false);
    }
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("pylearn_user_id");
    achievementRequests.current.clear();
    setUser(null);
    setShowRegister(true);
  }, []);

  const updateProfile = useCallback(async (name: string, avatar_url?: string) => {
    if (!user) return;
    let res: Response;
    try {
      res = await fetch(api(`/users/${user.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_url }),
      });
    } catch {
      throw new Error("No se pudo conectar con el servidor para actualizar perfil.");
    }

    let updated: any = null;
    try {
      updated = await res.json();
    } catch {
      // Non-JSON response
    }

    if (!res.ok) {
      throw new Error(updated?.error || "No se pudo actualizar el perfil");
    }

    if (updated) {
      setUser(prev => prev ? { ...prev, name: updated.name, avatar_url: updated.avatar_url } : null);
    }
  }, [user]);

  const uploadAvatar = useCallback(async (base64Data: string) => {
    if (!user) return;
    let res: Response;
    try {
      res = await fetch(api(`/users/${user.id}/avatar`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_data: base64Data }),
      });
    } catch {
      throw new Error("No se pudo conectar con el servidor para subir avatar.");
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON response
    }

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo subir la foto de perfil");
    }

    if (data?.avatar_url) {
      setUser(prev => prev ? { ...prev, avatar_url: data.avatar_url } : null);
    }
  }, [user]);

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
    if (alreadyHas || achievementRequests.current.has(key)) return;

    achievementRequests.current.add(key);
    try {
      const res = await fetch(api(`/users/${id}/achievements`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) return;

      const meta = getAchievementMeta(key);
      const newAch: Achievement = {
        ...meta,
        unlockedAt: new Date().toISOString(),
      };
      setUser(prev => {
        if (!prev || prev.id !== id || prev.achievements.some(a => a.key === key))
          return prev;
        return { ...prev, achievements: [...prev.achievements, newAch] };
      });
      setPendingAchievement(newAch);
    } catch {
      // Achievement unlocks are retried the next time progress is refreshed.
    } finally {
      achievementRequests.current.delete(key);
    }
  }, [user]);

  const clearPendingAchievement = useCallback(() => setPendingAchievement(null), []);

  return (
    <UserContext.Provider value={{
      user, isRegistered, showRegister, setShowRegister,
      register, login, logout, updateProfile, uploadAvatar,
      refreshUser, unlockAchievement,
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
