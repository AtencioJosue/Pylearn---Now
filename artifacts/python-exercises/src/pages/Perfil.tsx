import { useUser, getBuilderRank, getAchievementMeta } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";
import { User, Trophy, Code2, Star, Copy, Check, Flame, Settings, X, Camera, Save, LogOut } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCurrentUserGamification,
  useCurrentUserProgress,
} from "@/hooks/useUserProgress";
import { ProfileXPBar } from "@/components/ProfileXPBar";
import { createPortal } from "react-dom";
import { 
  MASCOTS, 
  HATS, 
  ACCESSORIES, 
  BACKGROUNDS, 
  getCombinedAvatarSvg, 
  getCombinedAvatarDataUrl 
} from "@/utils/avatarSvg";

const ALL_ACHIEVEMENTS = [
  "registered", "progress_25", "progress_50", "progress_75", "progress_100",
  "builder_1", "builder_3", "builder_7", "builder_15",
];

export function Perfil() {
  const { user, updateProfile, uploadAvatar, logout } = useUser();
  const { data: progress } = useCurrentUserProgress();
  const { data: gamification } = useCurrentUserGamification();
  
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [nameError, setNameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempAvatarUrl, setTempAvatarUrl] = useState<string>("");

  // Mascot/Character customizer local states
  const [avatarSourceType, setAvatarSourceType] = useState<"upload" | "customizer">("upload");
  const [customBase, setCustomBase] = useState("pyto");
  const [customHat, setCustomHat] = useState("none");
  const [customAcc, setCustomAcc] = useState("none");
  const [customBg, setCustomBg] = useState("sunset");
  const [customCategory, setCustomCategory] = useState<"base" | "hat" | "acc" | "bg">("base");

  if (!user) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  const totalEx = progress?.totalExercises ?? 1;
  const completed = progress?.completedExercises ?? 0;
  const percent = Math.round((completed / totalEx) * 100);
  const builderRank = getBuilderRank(user.exercisesCreated);
  const unlockedKeys = new Set(user.achievements.map(a => a.key));

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSettings = () => {
    setEditName(user.name);
    setNameError("");
    setAvatarError("");
    setGeneralError("");
    setTempAvatarUrl("");
    
    // Check if the current avatar_url belongs to the SVG Mascot Creator
    if (user.avatar_url && (user.avatar_url.startsWith("data:image/svg+xml") || user.avatar_url.includes("<svg"))) {
      setAvatarSourceType("customizer");
      try {
        const saved = localStorage.getItem(`pylearn_avatar_config_${user.id}`);
        if (saved) {
          const cfg = JSON.parse(saved);
          setCustomBase(cfg.base || "pyto");
          setCustomHat(cfg.hat || "none");
          setCustomAcc(cfg.acc || "none");
          setCustomBg(cfg.bg || "sunset");
        }
      } catch (e) {
        // Fallback
      }
    } else {
      setAvatarSourceType("upload");
    }
    setShowSettings(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
      return;
    }
    try {
      setSavingProfile(true);
      setNameError("");
      setAvatarError("");
      setGeneralError("");

      // 1. Save Avatar based on selected source tab
      if (avatarSourceType === "customizer") {
        const compiledSvgDataUrl = getCombinedAvatarDataUrl(customBase, customHat, customAcc, customBg);
        await uploadAvatar(compiledSvgDataUrl);
        // Persist choice configuration
        localStorage.setItem(
          `pylearn_avatar_config_${user.id}`,
          JSON.stringify({ base: customBase, hat: customHat, acc: customAcc, bg: customBg })
        );
      } else if (tempAvatarUrl && tempAvatarUrl !== user.avatar_url && tempAvatarUrl.startsWith("data:")) {
        await uploadAvatar(tempAvatarUrl);
      }

      // 2. Update name
      await updateProfile(editName.trim());
      setShowSettings(false);
    } catch (err: any) {
      setGeneralError(err.message || "Error al actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("La imagen no debe superar los 2MB de tamaño");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setTempAvatarUrl(base64String);
      setAvatarError("");
    };
    reader.readAsDataURL(file);
  };

  // Determine avatar source (uploaded custom avatar vs default Pylearn logo)
  const avatarSource = user.avatar_url 
    ? user.avatar_url 
    : `${import.meta.env.BASE_URL}images/python-mascot.png`;

  const previewAvatarSource = tempAvatarUrl || avatarSource;

  return (
    <div className="min-h-screen page-bg pb-20">
      <Navbar />
      
      {/* ── Banner Decorativo High-Tech Premium ── */}
      <div className="h-48 w-full relative overflow-hidden border-b-4 border-[var(--linea-conexion)] bg-gradient-to-r from-sky-100 via-[#E0F2FE] to-indigo-100 dark:from-[#0B1219] dark:via-[#16222F] dark:to-[#0B1219] transition-all duration-300">
         {/* Animated Glowing blobs */}
         <div className="absolute top-[-50%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-400/20 dark:bg-indigo-500/10 blur-3xl" />
         <div className="absolute bottom-[-50%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-3xl animate-pulse-soft" />
         {/* Futuristic Tech Grid Overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-80px] relative z-10">
        
        {/* ── Header del Perfil (Avatar y Racha) ── */}
        <div className="pylearn-card p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
          
          {/* Avatar Bouncy with Settings hover triggers */}
          <div 
            onClick={openSettings}
            className="w-32 h-32 rounded-3xl bg-[#FFC800] border-4 border-[var(--bg-tarjetas)] shadow-lg flex items-center justify-center text-white flex-shrink-0 animate-bounce-slow mt-[-40px] overflow-hidden relative group cursor-pointer"
            title="Editar Perfil"
          >
            <img 
              src={avatarSource} 
              alt="Avatar" 
              className={`w-full h-full object-cover drop-shadow-md transition-transform duration-300 group-hover:scale-105 ${!user.avatar_url ? 'p-3' : ''}`} 
            />
            {/* Hover Camera overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-white gap-1.5">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Editar Perfil</span>
            </div>
          </div>
 
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-display font-black text-[var(--texto-principal)]">{user.name}</h1>
              <button 
                onClick={openSettings}
                className="p-2 text-slate-400 hover:text-[#1CB0F6] bg-slate-500/10 hover:bg-[#1CB0F6]/10 rounded-xl transition-all duration-300 hover:rotate-90"
                title="Editar Perfil"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 bg-[var(--bg-general)] inline-flex px-3 py-1.5 rounded-xl border-2 border-[var(--linea-conexion)]">
              <span className="text-sm font-bold text-[var(--texto-principal)] opacity-50 uppercase tracking-wider">ID:</span>
              <code className="text-sm font-mono text-[var(--texto-principal)] font-bold">{user.id}</code>
              <button onClick={copyId} className="ml-2 text-[var(--texto-principal)] opacity-60 hover:opacity-100 transition-colors">
                {copied ? <Check className="w-5 h-5 text-[#58CC02]" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
 
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-2 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-sm font-extrabold uppercase tracking-wide border-b-[3px] border-purple-200 dark:border-purple-900 flex items-center">
                <Star className="w-4 h-4 mr-1.5 fill-current" /> {builderRank}
              </span>
              <span className="px-4 py-2 rounded-2xl bg-[#58CC02]/10 text-[#58CC02] text-sm font-extrabold uppercase tracking-wide border-b-[3px] border-[#58CC02]/20">
                {user.exercisesCreated} ejercicios creados
              </span>
            </div>
          </div>
 
          {/* Racha Flotante (Gamificación Simulada) */}
          <div className="md:absolute md:top-6 md:right-6 bg-[#FF4B4B]/10 border-2 border-[#FF4B4B]/20 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
             <Flame className="w-10 h-10 text-[#FF4B4B] mb-1 animate-pulse-soft" fill="currentColor" />
             <span className="text-2xl font-display font-extrabold text-[#FF4B4B]">3</span>
             <span className="text-xs uppercase tracking-widest font-bold text-[#FF4B4B]/70">Días seguidos</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Columna Izquierda (Estadísticas Rápidas y XP) ── */}
          <div className="lg:col-span-1 space-y-8">
            {gamification && (
              <ProfileXPBar 
                currentLevel={gamification.currentLevel}
                xpInCurrentLevel={gamification.xpInCurrentLevel}
                xpNeededForNextLevel={gamification.xpNeededForNextLevel}
                percentage={gamification.percentage}
                leagueTier={gamification.leagueTier}
                className=""
              />
            )}
            
            <div className="pylearn-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-sky-950/40 text-[var(--color-marca-azul)] rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-display font-extrabold text-[var(--texto-principal)]">Estadísticas</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                   <span className="font-bold text-[var(--texto-principal)] opacity-70">Ejercicios</span>
                   <span className="font-display font-extrabold text-2xl text-[var(--texto-principal)]">{completed}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                   <span className="font-bold text-[var(--texto-principal)] opacity-70">Completado</span>
                   <span className="font-display font-extrabold text-2xl text-[var(--color-marca-verde)]">{percent}%</span>
                </div>
              </div>

              <div className="mt-6 w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${percent}%`, backgroundColor: 'var(--color-marca-verde)' }}
                />
              </div>
            </div>
          </div>

          {/* ── Columna Derecha (Logros / Medallas) ── */}
          <div className="lg:col-span-2">
            <div className="pylearn-card">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FFC800]/20 text-[#FFC800] rounded-2xl flex items-center justify-center">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-display font-extrabold text-[var(--texto-principal)]">Tus Logros</h2>
                </div>
                <span className="px-4 py-1.5 bg-[var(--bg-general)] border border-[var(--linea-conexion)] text-[var(--texto-principal)] opacity-80 font-extrabold rounded-xl text-sm">
                  {unlockedKeys.size} / {ALL_ACHIEVEMENTS.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALL_ACHIEVEMENTS.map(key => {
                  const meta = getAchievementMeta(key);
                  const unlocked = unlockedKeys.has(key);
                  const ach = user.achievements.find(a => a.key === key);
                  
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
                        unlocked
                          ? "border-[#FFC800] bg-[#FFC800]/5 hover:bg-[#FFC800]/10"
                          : "border-[var(--linea-conexion)] bg-[var(--bg-general)]/40 opacity-60 grayscale"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                        unlocked ? "bg-[#FFC800]/20 shadow-inner" : "bg-[var(--bg-general)]"
                      }`}>
                        {unlocked ? meta.icon : "🔒"}
                      </div>
                      <div className="flex-1 mt-1">
                        <p className={`font-extrabold text-base mb-0.5 ${unlocked ? "text-[var(--texto-principal)]" : "text-[var(--texto-principal)] opacity-50"}`}>
                          {meta.label}
                        </p>
                        <p className="text-sm font-bold text-[var(--texto-principal)] opacity-60 leading-tight">{meta.description}</p>
                        {unlocked && ach?.unlockedAt && (
                          <div className="inline-block mt-2 px-2 py-0.5 bg-[#FFC800]/15 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-md">
                            {new Date(ach.unlockedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* ── MODAL CONFIGURACIÓN / EDICIÓN PERFIL PREMIUM ── */}
      {createPortal(
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.92, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 15, opacity: 0 }}
                transition={{ type: "spring", duration: 0.4 }}
                className={`w-full ${avatarSourceType === "customizer" ? "max-w-3xl" : "max-w-md"} overflow-hidden rounded-[2.5rem] bg-[var(--bg-tarjetas)] p-8 shadow-2xl border-4 border-[#1CB0F6]/30 text-[var(--texto-principal)] cursor-default transition-all duration-300`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-display font-black text-[var(--texto-principal)] flex items-center gap-2">
                    <Settings className="w-6 h-6 text-[#1CB0F6] animate-spin-slow" />
                    Ajustes de Perfil
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-[var(--texto-principal)] transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tab Selector: Upload vs Mascot Creator */}
                <div className="flex gap-2 p-1 bg-[var(--bg-general)] rounded-2xl border-2 border-[var(--linea-conexion)] mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarSourceType("upload");
                      setAvatarError("");
                    }}
                    className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
                      avatarSourceType === "upload"
                        ? "bg-[#1CB0F6] text-white shadow-md shadow-[#1CB0F6]/20"
                        : "text-[var(--texto-principal)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    Subir Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarSourceType("customizer");
                      setAvatarError("");
                    }}
                    className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
                      avatarSourceType === "customizer"
                        ? "bg-[#1CB0F6] text-white shadow-md shadow-[#1CB0F6]/20"
                        : "text-[var(--texto-principal)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    Crear Personaje 🎭
                  </button>
                </div>

                {/* CONDITIONAL RENDER: Upload vs Mascot Creator */}
                {avatarSourceType === "upload" ? (
                  /* Standard Image Upload Flow */
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div 
                      className="relative group cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Cambiar foto de perfil"
                    >
                      <div className="w-28 h-28 rounded-3xl bg-[#FFC800] border-4 border-[var(--bg-tarjetas)] shadow-lg flex items-center justify-center text-white overflow-hidden relative">
                        <img 
                          src={previewAvatarSource} 
                          alt="Preview" 
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${(!tempAvatarUrl && !user.avatar_url) ? 'p-3' : ''}`} 
                        />
                        
                        {/* Hover Camera overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-white gap-1">
                          <Camera className="w-6 h-6 text-white" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Subir Foto</span>
                        </div>

                        {/* Upload spinner */}
                        {savingProfile && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-[#1CB0F6] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={e => {
                        handleAvatarChange(e);
                        if (generalError) setGeneralError("");
                      }} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    {/* Elegant themed info callout/badge card for avatar help */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-sky-100/60 dark:bg-sky-950/30 border-2 border-[#1CB0F6]/20 text-[var(--texto-principal)] text-xs font-semibold flex items-start gap-2.5 text-left max-w-sm">
                      <Camera className="w-4.5 h-4.5 text-[#1CB0F6] mt-0.5 flex-shrink-0" />
                      <span className="leading-normal opacity-85">
                        Haz clic sobre el avatar para cambiar tu foto de perfil. Soporta formatos <strong>PNG, JPG</strong> de hasta <strong>2MB</strong>.
                      </span>
                    </div>

                    {/* Localized Avatar Error message (Just like the forum's file error notice) */}
                    {avatarError && (
                      <p className="mt-3 text-sm font-bold text-red-500 animate-pulse-soft">
                        {avatarError}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Interactive SVG Mascot Customizer Flow */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                    {/* Left: Preview Box */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[var(--bg-general)] rounded-3xl border-2 border-[var(--linea-conexion)] relative overflow-hidden group min-h-[220px]">
                      {/* Interactive hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/5 to-indigo-500/5 opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                      
                      {/* Real-time Compiled SVG Live Avatar */}
                      <div className="w-40 h-40 drop-shadow-xl animate-bounce-slow relative z-10 flex items-center justify-center">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: getCombinedAvatarSvg(customBase, customHat, customAcc, customBg) 
                          }} 
                          className="w-full h-full"
                        />
                      </div>
                      
                      <span className="mt-3 text-[10px] font-black text-[#1CB0F6] tracking-widest uppercase opacity-80 relative z-10 animate-pulse-soft">
                        ¡Tu mascota cobra vida! 🌟
                      </span>
                    </div>

                    {/* Right: Choices Controls Panel */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Selection Category Tabs */}
                      <div className="flex gap-1 border-b-2 border-[var(--linea-conexion)] pb-1 overflow-x-auto scrollbar-none">
                        {(["base", "hat", "acc", "bg"] as const).map((cat) => {
                          const labels = { base: "Mascota", hat: "Sombrero", acc: "Accesorio", bg: "Fondo" };
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCustomCategory(cat)}
                              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all border-b-3 rounded-t-lg ${
                                customCategory === cat
                                  ? "border-[#1CB0F6] text-[#1CB0F6]"
                                  : "border-transparent text-[var(--texto-principal)] opacity-50 hover:opacity-100"
                              }`}
                            >
                              {labels[cat]}
                            </button>
                          );
                        })}
                      </div>

                      {/* Items Grid */}
                      <div className="bg-[var(--bg-general)] p-4 rounded-2xl border-2 border-[var(--linea-conexion)] max-h-[170px] overflow-y-auto custom-scrollbar">
                        {customCategory === "base" && (
                          <div className="grid grid-cols-2 gap-2">
                            {MASCOTS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCustomBase(opt.id)}
                                className={`flex items-center gap-2 p-2 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                                  customBase === opt.id
                                    ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]"
                                    : "border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-500/5 text-[var(--texto-principal)]"
                                }`}
                              >
                                <span className="text-xl">{opt.icon}</span>
                                <span>{opt.label.split(" ")[0]}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {customCategory === "hat" && (
                          <div className="grid grid-cols-2 gap-2">
                            {HATS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCustomHat(opt.id)}
                                className={`flex items-center gap-2 p-2 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                                  customHat === opt.id
                                    ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]"
                                    : "border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-500/5 text-[var(--texto-principal)]"
                                }`}
                              >
                                <span className="text-lg">{opt.icon}</span>
                                <span className="truncate">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {customCategory === "acc" && (
                          <div className="grid grid-cols-2 gap-2">
                            {ACCESSORIES.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCustomAcc(opt.id)}
                                className={`flex items-center gap-2 p-2 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                                  customAcc === opt.id
                                    ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]"
                                    : "border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-500/5 text-[var(--texto-principal)]"
                                }`}
                              >
                                <span className="text-lg">{opt.icon}</span>
                                <span className="truncate">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {customCategory === "bg" && (
                          <div className="grid grid-cols-2 gap-2">
                            {BACKGROUNDS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCustomBg(opt.id)}
                                className={`flex items-center gap-2 p-2 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                                  customBg === opt.id
                                    ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]"
                                    : "border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-500/5 text-[var(--texto-principal)]"
                                }`}
                              >
                                <span className="text-lg">{opt.icon}</span>
                                <span className="truncate">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Fields Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">

                  {/* Username Input Field */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--texto-principal)] opacity-70 mb-2 block">
                      Nombre de Usuario
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editName}
                        onChange={e => {
                          setEditName(e.target.value);
                          if (nameError) setNameError("");
                          if (generalError) setGeneralError("");
                        }}
                        placeholder="Nombre..."
                        maxLength={50}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[var(--linea-conexion)] focus:border-[#1CB0F6] focus:outline-none font-medium text-[var(--texto-principal)] bg-[var(--bg-general)] transition-colors text-base placeholder-[var(--texto-principal)]/30"
                        required
                      />
                    </div>
                    {/* Localized Username Error message */}
                    {nameError && (
                      <p className="mt-2 text-sm font-bold text-red-500 animate-pulse-soft">
                        {nameError}
                      </p>
                    )}
                  </div>

                  {/* General Save Error Box */}
                  {generalError && (
                    <p className="text-sm font-bold text-red-500 text-center animate-pulse-soft">
                      {generalError}
                    </p>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full py-3.5 bg-[#1CB0F6] hover:bg-[#158fc7] text-white rounded-2xl font-extrabold text-base transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 shadow-lg shadow-[#1CB0F6]/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-5 h-5" />
                      {savingProfile ? "Guardando..." : "Guardar Cambios"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowSettings(false);
                      }}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 dark:text-red-400 hover:text-white rounded-2xl font-extrabold text-base transition-all duration-300 flex items-center justify-center gap-2 border-2 border-red-500/20 hover:border-transparent cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar Sesión
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
