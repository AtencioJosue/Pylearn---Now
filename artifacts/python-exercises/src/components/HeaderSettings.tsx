import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sun, Moon, Palette, Check, Heart, Flame, Layout } from "lucide-react";
import { useTheme, ACCENT_COLORS, AccentColor } from "@/context/ThemeContext";

export function HeaderSettings({ sidebar = false }: { sidebar?: boolean }) {
  const panelId = useId();
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

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        dropdownRef.current?.querySelector("button")?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const colorOptions: { name: AccentColor; label: string; colorClass: string; hex: string }[] = [
    { name: "blue", label: "Azul", colorClass: "bg-[#1CB0F6]", hex: "#1CB0F6" },
    { name: "green", label: "Verde", colorClass: "bg-[#58CC02]", hex: "#58CC02" },
    { name: "purple", label: "Morado", colorClass: "bg-[#CE82FF]", hex: "#CE82FF" },
    { name: "orange", label: "Naranja", colorClass: "bg-[#FF9600]", hex: "#FF9600" },
    { name: "red", label: "Rojo", colorClass: "bg-[#FF4B4B]", hex: "#FF4B4B" },
  ];

  return (
    <div ref={dropdownRef} className={sidebar ? "sidebar-settings" : "relative inline-block"}>
      {/* Settings Button in Navbar */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.05, y: -0.5 }}
        whileTap={{ scale: 0.95 }}
        className={`${sidebar ? "sidebar-settings-trigger" : "w-10 h-10"} rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
          isOpen
            ? "bg-primary/10 border-primary text-primary"
            : "bg-[var(--bg-tarjetas)] border-[var(--linea-conexion)] text-[var(--texto-principal)] hover:text-primary hover:border-primary/50"
        }`}
        title="Ajustes de Interfaz"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <Settings className={`w-5 h-5 ${isOpen ? "rotate-45" : ""} transition-transform duration-300`} />
        {sidebar && <span>Ajustes</span>}
      </motion.button>

      {/* Dropdown Menu (Professional 2-Column Popover) */}
      {isOpen && (
        <div
          id={panelId}
          className={`${sidebar ? "sidebar-settings-panel" : "absolute right-0 top-full mt-2"} bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[24px] p-5 w-[440px] z-[9999] text-[var(--texto-principal)] pointer-events-auto block opacity-100 visible`}
          style={{ transform: "none", opacity: 1, visibility: "visible" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Inner Grid */}
          <div className="grid grid-cols-2 gap-5">
            
            {/* Column 1: Appearance */}
            <div className="border-r border-slate-100 dark:border-slate-800 pr-5">
              <div className="flex items-center gap-1.5 mb-3.5">
                <Palette className="w-4 h-4 text-primary" />
                <h4 className="font-display font-extrabold text-[13px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Apariencia
                </h4>
              </div>

              {/* Theme Switcher - Clean Segmented Control */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                    Tema de la aplicación
                  </label>
                  <div className="flex bg-slate-100/80 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/40">
                    <button
                      onClick={() => theme === "dark" && toggleTheme()}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        theme === "light"
                          ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" /> Claro
                    </button>
                    <button
                      onClick={() => theme === "light" && toggleTheme()}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        theme === "dark"
                          ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" /> Oscuro
                    </button>
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                    Color de acento
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40 justify-between">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        onClick={() => setAccentColor(opt.name)}
                        className={`w-7 h-7 rounded-full ${opt.colorClass} relative flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                          accentColor === opt.name
                            ? "ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-900 scale-105"
                            : "opacity-85 hover:opacity-100"
                        }`}
                        title={opt.label}
                      >
                        {accentColor === opt.name && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-md font-extrabold" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Interface Toggles */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-3.5">
                  <Layout className="w-4 h-4 text-primary" />
                  <h4 className="font-display font-extrabold text-[13px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Interfaz
                  </h4>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4 leading-normal">
                  Configura la visibilidad de los elementos de tu menú.
                </p>

                <div className="space-y-3">
                  {/* Show Lives Switch */}
                  <div className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                      <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Vidas</span>
                    </div>
                    <button
                      onClick={() => setShowVidas(!showVidas)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                        showVidas ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          showVidas ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Show Streak Switch */}
                  <div className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500 fill-current" />
                      <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Racha</span>
                    </div>
                    <button
                      onClick={() => setShowRacha(!showRacha)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                        showRacha ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          showRacha ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtle Branding/Footer */}
              <div className="text-right text-[10px] text-slate-400 dark:text-slate-600 font-bold mt-4 pt-2 border-t border-slate-50 dark:border-slate-800/40">
                Pylearn v1.2 · Premium
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
