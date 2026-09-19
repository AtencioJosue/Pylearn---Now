import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MascotStatus = "idle" | "success" | "error" | "hint";

interface MascotFeedbackProps {
  status: MascotStatus;
  hint?: string;
  mascotSrc?: string;
}

const SUCCESS_PHRASES = [
  "¡Excelente! 🔥",
  "¡Como un pro! 🚀",
  "¡Eres increíble! ⭐",
  "¡Python master! 🏆",
  "¡Perfecto! 💪",
  "¡Sigue así! 🎯",
];

const ERROR_PHRASES = [
  "¡Casi! Inténtalo de nuevo 💪",
  "Revisa la sintaxis 🤔",
  "¡No te rindas! 🔄",
  "¡Cada error es aprendizaje! 📚",
  "¡Tú puedes! Vuelve a intentarlo",
];

const IDLE_PHRASES = [
  "¡Hola! Soy Pylearn 🐍 ¿Listo para aprender?",
  "¡Tú puedes! Analiza bien el código 💡",
  "Lee el enunciado con calma 🧠",
];

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function MascotFeedback({ status, hint, mascotSrc }: MascotFeedbackProps) {
  const [phrase, setPhrase] = useState(() => getRandom(IDLE_PHRASES));
  const prevStatus = useRef(status);

  useEffect(() => {
    if (status !== prevStatus.current) {
      prevStatus.current = status;
      if (status === "success") setPhrase(getRandom(SUCCESS_PHRASES));
      else if (status === "error") setPhrase(getRandom(ERROR_PHRASES));
      else if (status === "idle") setPhrase(getRandom(IDLE_PHRASES));
    }
  }, [status]);

  const bubbleColor =
    status === "success" ? "bg-green-50 border-green-300 text-green-800"
    : status === "error"  ? "bg-red-50 border-red-300 text-red-800"
    : status === "hint"   ? "bg-yellow-50 border-yellow-300 text-yellow-800"
    :                       "bg-white border-slate-200 text-slate-700";

  const mascotAnimate =
    status === "success" ? { y: [0, -12, 0, -6, 0], rotate: [0, -8, 8, -4, 0] }
    : status === "error"  ? { x: [-6, 6, -5, 5, 0], rotate: [0, -5, 5, -3, 0] }
    : { y: [0, -4, 0] };

  const mascotTransition =
    status === "success" ? { duration: 0.6, ease: "easeOut" }
    : status === "error"  ? { duration: 0.5, ease: "easeOut" }
    : { duration: 3, repeat: Infinity, ease: "easeInOut" };

  const displayText = status === "hint" && hint ? hint : phrase;

  return (
    <div className="flex items-end gap-3 mb-4">
      {/* Mascot */}
      <motion.div
        animate={mascotAnimate}
        transition={mascotTransition as any}
        className="shrink-0"
      >
        <img
          src={mascotSrc ?? `${import.meta.env.BASE_URL}images/python-mascot.png`}
          alt="Pylearn"
          className="w-16 h-16 object-contain drop-shadow-md"
        />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${status}-${displayText}`}
          initial={{ opacity: 0, scale: 0.7, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className={`relative flex-1 px-4 py-3 rounded-2xl rounded-bl-none border-2 text-sm font-bold leading-snug ${bubbleColor}`}
        >
          {/* Bubble tail */}
          <div className={`absolute -left-2 bottom-3 w-0 h-0
            border-t-[8px] border-t-transparent
            border-r-[10px]
            border-b-[8px] border-b-transparent`}
            style={{ borderRightColor: status === "success" ? "#86efac"
              : status === "error" ? "#fca5a5"
              : status === "hint" ? "#fde68a"
              : "#e2e8f0" }}
          />
          {displayText}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
