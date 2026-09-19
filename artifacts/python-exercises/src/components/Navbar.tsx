import { Link, useLocation } from "wouter";
import { BookOpen, ArrowLeft, Code2, MessageCircle, User, Menu } from "lucide-react";
import { HeaderSettings } from "@/components/HeaderSettings";
import { useUser } from "@/context/UserContext";
import { useCurrentUserProgress } from "@/hooks/useUserProgress";
import { useGamification } from "@/context/GamificationContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/* ── Heart SVG ── */
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill={filled ? "#FF4B4B" : "none"}
      stroke="#FF4B4B"
      strokeWidth={2.5}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ── Game Over Overlay ── */
function GameOverOverlay({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="!fixed inset-0 !z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl border-4 border-red-100"
      >
        <div className="text-7xl mb-4">💔</div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 mb-2">
          ¡Sin vidas!
        </h2>
        <p className="text-slate-500 font-semibold mb-8">
          No te rindas — ¡cada error te hace más fuerte!
        </p>
        <button
          onClick={onReset}
          className="w-full py-4 px-8 rounded-2xl bg-[#FF4B4B] hover:bg-[#e03a3a] text-white font-extrabold text-lg transition-all shadow-lg shadow-red-200 active:scale-95"
        >
          🔄 Recuperar vidas
        </button>
      </motion.div>
    </motion.div>
  );
}

export function Navbar({ backTo = null }: { backTo?: string | null }) {
  const { user, unlockAchievement } = useUser();
  const { data: progress } = useCurrentUserProgress();
  const { vidas, rachaDias, isGameOver, resetLives } = useGamification();
  const { showVidas, showRacha } = useTheme();
  const [location] = useLocation();

  const totalEx = progress?.totalExercises ?? 1;
  const completed = progress?.completedExercises ?? 0;
  const percent = Math.round((completed / totalEx) * 100);

  useEffect(() => {
    if (!user || !progress) return;
    if (percent >= 25) void unlockAchievement("progress_25");
    if (percent >= 50) void unlockAchievement("progress_50");
    if (percent >= 75) void unlockAchievement("progress_75");
    if (percent >= 100) void unlockAchievement("progress_100");
  }, [percent, user, progress, unlockAchievement]);

  /* Life lost shake */
  const prevVidas = useRef(vidas);
  const [lifeShake, setLifeShake] = useState(false);
  useEffect(() => {
    if (vidas < prevVidas.current) {
      setLifeShake(true);
      setTimeout(() => setLifeShake(false), 600);
    }
    prevVidas.current = vidas;
  }, [vidas]);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const close = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  const navLink = (href: string, label: string, icon: React.ReactNode) => {
    const active = location === href || (href === "/" && location.startsWith("/exercise/"));
    return (
      <Link href={href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined}
        className={cn("sidebar-link", active
          ? "bg-primary/15 text-primary border-[var(--linea-conexion)] shadow-sm"
          : "text-[var(--texto-principal)] border-transparent hover:bg-[var(--bg-general)] hover:border-[var(--linea-conexion)]")}>
        {icon}<span>{label}</span>
      </Link>
    );
  };
  const logo = (
    <Link href="/" onClick={() => setMenuOpen(false)} className="sidebar-brand group">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <span className="font-display font-bold text-xl tracking-tight text-foreground">Pylearn</span>
    </Link>
  );
  const sidebarContent = (
    <>
      {logo}
      <nav aria-label="Navegación principal" className="sidebar-links">
        {navLink("/", "Ejercicios", <BookOpen className="w-5 h-5" />)}
        {navLink("/ligas", "Ligas", <span aria-hidden="true" className="text-xl">🏆</span>)}
        {navLink("/playground", "Editor libre", <Code2 className="w-5 h-5" />)}
        {navLink("/foro", "Foro", <MessageCircle className="w-5 h-5" />)}
      </nav>
      {backTo && <Link href={backTo} onClick={() => setMenuOpen(false)} className="sidebar-back"><ArrowLeft className="w-4 h-4" /> Volver</Link>}
      <div className="sidebar-footer">
        {(showVidas || showRacha) && <div className="sidebar-stats">
          {showVidas && (
            <motion.div animate={lifeShake ? { x: [-5, 5, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}
              className="flex items-center gap-1 bg-[var(--bg-tarjetas)] border border-red-100/40 dark:border-red-950/40 rounded-2xl px-3 py-2"
              role="img" aria-label={vidas + " de 5 vidas"}>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.span key={i} animate={i === vidas ? { scale: [1, 0.5, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Heart filled={i < vidas} />
                </motion.span>
              ))}
            </motion.div>
          )}
          {showRacha && <div className="flex items-center gap-1 bg-[var(--bg-tarjetas)] border border-orange-100/40 dark:border-orange-950/40 rounded-2xl px-3 py-2" aria-label={"Racha de " + rachaDias + " días"}>
            <span aria-hidden="true">🔥</span><span className="text-[#FF9600] font-extrabold text-sm">{rachaDias}</span>
          </div>}
        </div>}
        {user && <Link href="/perfil" onClick={() => setMenuOpen(false)} aria-current={location === "/perfil" ? "page" : undefined} className={cn("sidebar-profile", location === "/perfil" && "border-primary/30 bg-primary/10")}>
          <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User className="w-4 h-4" /></div>
          <span className="text-sm font-bold truncate">{user.name}</span>
        </Link>}
        <HeaderSettings sidebar />
      </div>
    </>
  );
  return (
    <>
      <AnimatePresence>{isGameOver && <GameOverOverlay onReset={resetLives} />}</AnimatePresence>
      <aside className="site-sidebar" aria-label="Menú de Pylearn">{sidebarContent}</aside>
      <header className="site-mobile-header">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild><button type="button" className="sidebar-menu-button" aria-label="Abrir menú"><Menu className="w-6 h-6" /></button></SheetTrigger>
          <SheetContent side="left" className="site-sidebar-drawer" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Menú de Pylearn</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
        {logo}
        {backTo && <Link href={backTo} className="sidebar-menu-button ml-auto" aria-label="Volver"><ArrowLeft className="w-5 h-5" /></Link>}
      </header>
    </>
  );
}
