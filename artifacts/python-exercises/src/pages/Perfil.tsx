import { useUser, getBuilderRank, getAchievementMeta } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";
import { User, Trophy, Code2, Star, Copy, Check, Flame } from "lucide-react";
import { useState } from "react";
import { useGetProgress } from "@workspace/api-client-react";

const ALL_ACHIEVEMENTS = [
  "registered", "progress_25", "progress_50", "progress_75", "progress_100",
  "builder_1", "builder_3", "builder_7", "builder_15",
];

export function Perfil() {
  const { user } = useUser();
  const { data: progress } = useGetProgress();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  const totalEx = progress?.totalExercises ?? 1;
  const correct = progress?.correctAnswers ?? 0;
  const percent = Math.round((correct / totalEx) * 100);
  const builderRank = getBuilderRank(user.exercisesCreated);
  const unlockedKeys = new Set(user.achievements.map(a => a.key));

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen page-bg pb-20">
      <Navbar />
      
      {/* ── Banner Decorativo ── */}
      <div className="h-40 bg-gradient-to-r from-[#1CB0F6] via-[#58CC02] to-[#1CB0F6] w-full border-b-[6px] border-[#1899D6] relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="absolute -bottom-8 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
         <div className="absolute -top-8 right-1/4 w-48 h-48 rounded-full bg-[#FFC800]/20 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-80px] relative z-10">
        
        {/* ── Header del Perfil (Avatar y Racha) ── */}
        <div className="card-bouncy p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
          
          {/* Avatar Bouncy */}
          <div className="w-32 h-32 rounded-3xl bg-[#FFC800] border-4 border-white shadow-lg flex items-center justify-center text-white flex-shrink-0 animate-bounce-slow mt-[-40px]">
            <img src={`${import.meta.env.BASE_URL}images/python-mascot.png`} alt="Avatar" className="w-24 h-24 object-contain drop-shadow-md" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-display font-extrabold text-slate-800 mb-2">{user.name}</h1>
            
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 bg-slate-50 inline-flex px-3 py-1.5 rounded-xl border-2 border-slate-200">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">ID:</span>
              <code className="text-sm font-mono text-slate-600 font-bold">{user.id}</code>
              <button onClick={copyId} className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
                {copied ? <Check className="w-5 h-5 text-[#58CC02]" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-2 rounded-2xl bg-purple-100 text-purple-700 text-sm font-extrabold uppercase tracking-wide border-b-[3px] border-purple-200 flex items-center">
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
          
          {/* ── Columna Izquierda (Estadísticas Rápidas) ── */}
          <div className="lg:col-span-1 space-y-8">
            <div className="card-bouncy p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 text-[#1CB0F6] rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-display font-extrabold text-slate-700">Estadísticas</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex items-center justify-between">
                   <span className="font-bold text-slate-500">Ejercicios</span>
                   <span className="font-display font-extrabold text-2xl text-slate-700">{correct}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex items-center justify-between">
                   <span className="font-bold text-slate-500">Completado</span>
                   <span className="font-display font-extrabold text-2xl text-[#58CC02]">{percent}%</span>
                </div>
              </div>

              <div className="mt-6 w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#58CC02] transition-all duration-1000"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Columna Derecha (Logros / Medallas) ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FFC800]/20 text-[#FFC800] rounded-2xl flex items-center justify-center">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-display font-extrabold text-slate-700">Tus Logros</h2>
                </div>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-500 font-extrabold rounded-xl text-sm">
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
                          : "border-slate-200 bg-slate-50 opacity-60 grayscale"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                        unlocked ? "bg-[#FFC800]/20 shadow-inner" : "bg-slate-200"
                      }`}>
                        {unlocked ? meta.icon : "🔒"}
                      </div>
                      <div className="flex-1 mt-1">
                        <p className={`font-extrabold text-base mb-0.5 ${unlocked ? "text-slate-800" : "text-slate-500"}`}>
                          {meta.label}
                        </p>
                        <p className="text-sm font-bold text-slate-400 leading-tight">{meta.description}</p>
                        {unlocked && ach?.unlockedAt && (
                          <div className="inline-block mt-2 px-2 py-0.5 bg-[#FFC800]/20 text-yellow-700 text-xs font-bold rounded-md">
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
    </div>
  );
}
