import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";

export function AchievementToast() {
  const { pendingAchievement, clearPendingAchievement } = useUser();

  useEffect(() => {
    if (!pendingAchievement) return;
    const timer = setTimeout(clearPendingAchievement, 4000);
    return () => clearTimeout(timer);
  }, [pendingAchievement, clearPendingAchievement]);

  return (
    <AnimatePresence>
      {pendingAchievement && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={clearPendingAchievement}
          className="fixed bottom-6 right-6 z-[200] cursor-pointer"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 p-4 flex items-center gap-4 max-w-sm">
            <div className="w-14 h-14 rounded-xl bg-yellow-50 flex items-center justify-center text-3xl flex-shrink-0">
              {pendingAchievement.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">¡Logro desbloqueado!</p>
              <p className="font-bold text-foreground text-lg leading-tight">{pendingAchievement.label}</p>
              <p className="text-sm text-muted-foreground">{pendingAchievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
