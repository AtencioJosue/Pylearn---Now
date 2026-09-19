import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

export interface AuthActionResult {
  debugCode?: string;
  message?: string;
}

interface UserContextValue {
  user: User | null;
  isRegistered: boolean;
  showRegister: boolean;
  setShowRegister: (value: boolean) => void;
  register: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<AuthActionResult>;
  login: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  resetPassword: (email: string, code: string, password: string) => Promise<AuthActionResult>;
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
  return ACHIEVEMENT_CATALOG.find((item) => item.key === key) ?? {
    key,
    label: key,
    description: "",
    icon: "🏅",
  };
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

async function readResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email || "",
    avatar_url: data.avatar_url || "",
    created_at: data.created_at || "",
    achievements: (data.achievements ?? []).map(
      (achievement: { key: string; unlocked_at?: string }) => ({
        ...getAchievementMeta(achievement.key),
        unlockedAt: achievement.unlocked_at,
      }),
    ),
    exercisesCreated: data.exercisesCreated ?? 0,
  };
}

function apiError(data: any, fallback: string) {
  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const achievementRequests = useRef(new Set<string>());

  const isRegistered = !!user;

  const fetchUser = useCallback(async () => {
    const response = await fetch(api("/users/me"), { credentials: "include" });
    if (response.status === 401) return null;
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo cargar tu cuenta."));
    return toUser(data);
  }, []);

  useEffect(() => {
    let active = true;
    let retryTimer: number | undefined;
    const loadSession = async () => {
      try {
        const currentUser = await fetchUser();
        if (!active) return;
        setUser(currentUser);
        setShowRegister(!currentUser);
      } catch {
        if (!active) return;
        retryTimer = window.setTimeout(loadSession, 3000);
      }
    };
    void loadSession();
    return () => {
      active = false;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [fetchUser]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    let response: Response;
    try {
      response = await fetch(api("/users/register"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      throw new Error("No se pudo conectar con el servidor.");
    }
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo crear la cuenta."));
    return { debugCode: data?.debug_code };
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const response = await fetch(api("/users/verify-email"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "El código no es válido."));
    setUser(toUser(data.user));
    setShowRegister(false);
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const response = await fetch(api("/users/resend-verification"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo reenviar el código."));
    return { debugCode: data?.debug_code };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(api("/users/login"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await readResponse(response);
    if (!response.ok) {
      const error = new Error(apiError(data, "Credenciales incorrectas.")) as Error & { code?: string };
      error.code = data?.code;
      throw error;
    }
    setUser(toUser(data.user));
    setShowRegister(false);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const response = await fetch(api("/users/forgot-password"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo solicitar la recuperación."));
    return { debugCode: data?.debug_code, message: data?.message };
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, password: string) => {
    const response = await fetch(api("/users/reset-password"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo cambiar la contraseña."));
    return { message: data?.message };
  }, []);

  const logout = useCallback(() => {
    void fetch(api("/users/logout"), {
      method: "POST",
      credentials: "include",
    });
    achievementRequests.current.clear();
    setUser(null);
    setShowRegister(true);
  }, []);

  const updateProfile = useCallback(async (name: string, avatar_url?: string) => {
    if (!user) return;
    const response = await fetch(api(`/users/${user.id}`), {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar_url }),
    });
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo actualizar el perfil."));
    setUser((previous) => previous ? { ...previous, name: data.name, avatar_url: data.avatar_url } : null);
  }, [user]);

  const uploadAvatar = useCallback(async (base64Data: string) => {
    if (!user) return;
    const response = await fetch(api(`/users/${user.id}/avatar`), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_data: base64Data }),
    });
    const data = await readResponse(response);
    if (!response.ok) throw new Error(apiError(data, "No se pudo subir la foto."));
    if (data?.avatar_url) setUser((previous) => previous ? { ...previous, avatar_url: data.avatar_url } : null);
  }, [user]);

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchUser();
    if (currentUser) setUser(currentUser);
  }, [fetchUser]);

  const unlockAchievement = useCallback(async (key: string) => {
    if (!user) return;
    const alreadyHas = user.achievements.some((achievement) => achievement.key === key);
    if (alreadyHas || achievementRequests.current.has(key)) return;
    achievementRequests.current.add(key);
    try {
      const response = await fetch(api(`/users/${user.id}/achievements`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!response.ok) return;
      const newAchievement: Achievement = {
        ...getAchievementMeta(key),
        unlockedAt: new Date().toISOString(),
      };
      setUser((previous) => {
        if (!previous || previous.achievements.some((item) => item.key === key)) return previous;
        return { ...previous, achievements: [...previous.achievements, newAchievement] };
      });
      setPendingAchievement(newAchievement);
    } finally {
      achievementRequests.current.delete(key);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{
      user,
      isRegistered,
      showRegister,
      setShowRegister,
      register,
      verifyEmail,
      resendVerification,
      login,
      requestPasswordReset,
      resetPassword,
      logout,
      updateProfile,
      uploadAvatar,
      refreshUser,
      unlockAchievement,
      pendingAchievement,
      clearPendingAchievement: () => setPendingAchievement(null),
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
