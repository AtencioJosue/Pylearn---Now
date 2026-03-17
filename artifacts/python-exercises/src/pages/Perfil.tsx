import { useUser, getBuilderRank, getAchievementMeta } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { User, Trophy, Code2, Star, Copy, Check } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-medium">Cargando perfil...</p>
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-border/50 mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-display font-bold truncate">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-muted-foreground">ID:</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                  {user.id}
                </code>
                <button onClick={copyId} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Star className="w-3 h-3 inline mr-1" />{builderRank}
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {user.exercisesCreated} ejercicios creados
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progreso general */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-display font-bold">Progreso general</h2>
          </div>
          <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
            <span>Ejercicios completados correctamente</span>
            <span>{correct} / {totalEx}</span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
          <p className="text-right text-2xl font-display font-bold text-primary">{percent}%</p>
        </motion.div>

        {/* Logros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-display font-bold">Logros</h2>
            <span className="ml-auto text-sm font-bold text-muted-foreground">
              {unlockedKeys.size} / {ALL_ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_ACHIEVEMENTS.map(key => {
              const meta = getAchievementMeta(key);
              const unlocked = unlockedKeys.has(key);
              const ach = user.achievements.find(a => a.key === key);
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    unlocked
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-border/30 bg-muted/30 opacity-50 grayscale"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    unlocked ? "bg-yellow-100" : "bg-muted"
                  }`}>
                    {unlocked ? meta.icon : "🔒"}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                    {unlocked && ach?.unlockedAt && (
                      <p className="text-xs text-yellow-600 font-medium mt-0.5">
                        {new Date(ach.unlockedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
