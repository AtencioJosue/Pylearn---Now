import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";

// ── Heart icon (filled red) ───────────────────────────────────────────────────
function HeartIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 drop-shadow-sm"
      fill={filled ? "#FF4B4B" : "none"}
      stroke={filled ? "#FF4B4B" : "#FF4B4B"}
      strokeWidth={2}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ── Game Over overlay ────────────────────────────────────────────────────────
function GameOverOverlay({ onReset }: { onReset: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl border-4 border-red-100"
        >
          <div className="text-7xl mb-4">💔</div>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 mb-2">
            ¡Sin vidas!
          </h2>
          <p className="text-slate-500 font-semibold mb-8">
            No te rindas — ¡cada error es un paso hacia el éxito!
          </p>
          <button
            onClick={onReset}
            className="w-full py-4 px-8 rounded-2xl bg-[#FF4B4B] hover:bg-[#e03a3a] text-white font-extrabold text-lg transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            🔄 Recuperar vidas
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function GamificationHeader() {
  const { vidas, rachaDias, xp, isGameOver, resetLives } = useGamification();

  // Detect XP increase to trigger bounce animation
  const prevXP = useRef(xp);
  const [xpBounce, setXpBounce] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout | undefined;
    if (xp > prevXP.current) {
      setXpBounce(true);
      t = setTimeout(() => setXpBounce(false), 700);
      prevXP.current = xp;
    } else {
      prevXP.current = xp;
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [xp]);

  // Detect life lost to trigger shake animation
  const prevVidas = useRef(vidas);
  const [lifeLostShake, setLifeLostShake] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout | undefined;
    if (vidas < prevVidas.current) {
      setLifeLostShake(true);
      t = setTimeout(() => setLifeLostShake(false), 600);
      prevVidas.current = vidas;
    } else {
      prevVidas.current = vidas;
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [vidas]);

  return (
    <>
      {isGameOver && <GameOverOverlay onReset={resetLives} />}

      <div className="sticky top-16 z-40 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-3 sm:gap-4">

            {/* ── Vidas (Hearts) ── */}
            <motion.div
              animate={lifeLostShake ? { x: [-6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-red-100 shadow-sm rounded-2xl px-4 py-2"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={i >= vidas ? { scale: [1, 0.6, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <HeartIcon filled={i < vidas} />
                  </motion.span>
                ))}
              </div>
              <span className="text-[#FF4B4B] font-extrabold text-sm hidden sm:inline">
                {vidas}/{5}
              </span>
            </motion.div>

            {/* ── Racha (Streak) ── */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-orange-100 shadow-sm rounded-2xl px-4 py-2">
              <span className="text-xl leading-none">🔥</span>
              <div className="leading-none">
                <span className="text-[#FF9600] font-extrabold text-lg leading-none">
                  {rachaDias}
                </span>
                <span className="text-slate-400 font-bold text-xs ml-1 hidden sm:inline">
                  {rachaDias === 1 ? "día" : "días"}
                </span>
              </div>
            </div>

            {/* ── XP (Experience) ── */}
            <motion.div
              animate={
                xpBounce
                  ? { scale: [1, 1.25, 0.9, 1.1, 1], y: [0, -6, 0] }
                  : {}
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-yellow-100 shadow-sm rounded-2xl px-4 py-2 relative overflow-hidden"
            >
              {/* XP gain flash */}
              <AnimatePresence>
                {xpBounce && (
                  <motion.div
                    key="flash"
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-yellow-300 rounded-2xl pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <span className="text-xl leading-none relative z-10">⚡</span>
              <div className="leading-none relative z-10">
                <motion.span
                  key={xp}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[#FFC800] font-extrabold text-lg leading-none inline-block"
                >
                  {xp}
                </motion.span>
                <span className="text-slate-400 font-bold text-xs ml-1 hidden sm:inline">XP</span>
              </div>

              {/* +XP floating label */}
              <AnimatePresence>
                {xpBounce && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -24 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute -top-1 right-2 text-xs font-extrabold text-[#FFC800] pointer-events-none"
                  >
                    +10 XP
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
