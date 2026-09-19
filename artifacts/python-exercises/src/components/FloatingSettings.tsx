import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Sun, Moon, Palette, Check, Heart, Flame } from "lucide-react";
import { useTheme, ACCENT_COLORS, AccentColor } from "@/context/ThemeContext";

export function FloatingSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    toggleTheme,
    accentColor,
    setAccentColor,
    showVidas,
    setShowVidas,
    showRacha,
    setShowRacha,
  } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const colorOptions: { name: AccentColor; label: string; colorClass: string; hex: string }[] = [
    { name: "blue", label: "Azul Pylearn", colorClass: "bg-[#1CB0F6]", hex: "#1CB0F6" },
    { name: "green", label: "Verde Esmeralda", colorClass: "bg-[#58CC02]", hex: "#58CC02" },
    { name: "purple", label: "Morado Mágico", colorClass: "bg-[#CE82FF]", hex: "#CE82FF" },
    { name: "orange", label: "Naranja Atardecer", colorClass: "bg-[#FF9600]", hex: "#FF9600" },
    { name: "red", label: "Rojo Fuego", colorClass: "bg-[#FF4B4B]", hex: "#FF4B4B" },
  ];

  return (
    <div ref={containerRef} className="fixed bottom-6 left-6 z-[190] flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="mb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl p-5 w-80 text-[var(--texto-principal)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary animate-spin-slow" />
                <h3 className="font-display font-black text-base text-slate-800 dark:text-slate-100">Personalizar</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Theme Selector */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
                  Tema Visual
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => theme === "dark" && toggleTheme()}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                      theme === "light"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Sun className="w-4 h-4" /> Claro
                  </button>
                  <button
                    onClick={() => theme === "light" && toggleTheme()}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                      theme === "dark"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Moon className="w-4 h-4" /> Oscuro
                  </button>
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                    Color de Acento
                  </label>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setAccentColor(opt.name)}
                      className={`w-9 h-9 rounded-full ${opt.colorClass} border-2 relative flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:scale-110 shadow-sm ${
                        accentColor === opt.name
                          ? "border-slate-800 dark:border-white scale-105"
                          : "border-transparent"
                      }`}
                      title={opt.label}
                    >
                      {accentColor === opt.name && (
                        <Check className="w-4 h-4 text-white drop-shadow-md font-extrabold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navbar Elements (Toggle Visibility) */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 block">
                  Elementos de Cabecera
                </label>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-red-100/60 dark:bg-red-950/40 text-red-500 flex items-center justify-center rounded-lg">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Mostrar Vidas</span>
                    </div>
                    <button
                      onClick={() => setShowVidas(!showVidas)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        showVidas ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showVidas ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-100/60 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center rounded-lg">
                        <Flame className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Mostrar Racha</span>
                    </div>
                    <button
                      onClick={() => setShowRacha(!showRacha)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        showRacha ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showRacha ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Gear Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 0 }}
        className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-700 hover:border-primary text-slate-500 dark:text-slate-300 hover:text-primary transition-all shadow-xl flex items-center justify-center cursor-pointer relative"
      >
        <Settings className={`w-5 h-5 ${isOpen ? "rotate-90 text-primary" : ""} transition-transform duration-300`} />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
