import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Skull, Target, Heart, Star, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/context/GamificationContext";
import { soundEngine } from "@/utils/sound";

// ─────────────────────────────────────────────
//  TIPOS
// ─────────────────────────────────────────────
type BubbleCategory = "garbage" | "active" | "bomb";

type BubbleDef = {
  id: string;
  text: string;
  category: BubbleCategory;
  icon: string;
  hint: string;
  glowColor?: string;
  sizeMult?: number; // 0.7=small 1.0=medium 1.3=large
  speedBonus?: number;
  livesLost?: number;
  hasTimer?: boolean;
  wave?: number;
};

// ─────────────────────────────────────────────
//  DEFINICIONES DE BURBUJAS (Expert Level)
// ─────────────────────────────────────────────
const BUBBLE_DEFS: BubbleDef[] = [
  // 🗑️ GARBAGE
  { id:"g_gc_collect",       text:"gc.collect()",                category:"garbage", icon:"⚙️", hint:"Fuerza la recolección manual de basura",         glowColor:"#ff4d4d", wave:1, sizeMult:0.7, speedBonus:0.5  },
  { id:"g_none_assign",      text:"resultado = None",            category:"garbage", icon:"🗑️", hint:"Setear a None baja el refcount a cero",           glowColor:"#ff4d4d", wave:1, sizeMult:0.7, speedBonus:0.2  },
  { id:"g_rebind_cache",     text:"cache = {}",                  category:"garbage", icon:"🔁", hint:"Re-bindea la variable → el dict anterior es basura", glowColor:"#ff4d4d", wave:2, sizeMult:1.0 },
  { id:"g_ctx_manager",      text:"with open(f) as archivo:",    category:"garbage", icon:"📭", hint:"'with' cierra el archivo al salir → basura",      glowColor:"#ff4d4d", wave:2, sizeMult:1.0, speedBonus:0.1 },
  { id:"g_weakref",          text:"weakref.ref(objeto)",         category:"garbage", icon:"🧵", hint:"Referencia débil — el GC la ignora",               glowColor:"#ff4d4d", wave:3, sizeMult:0.7, speedBonus:0.3 },
  { id:"g_dict_clear",       text:"objeto.__dict__.clear()",     category:"garbage", icon:"🧹", hint:"Vacía el namespace del objeto → basura",          glowColor:"#ff4d4d", wave:3, sizeMult:1.0  },
  { id:"g_locals_override",  text:"locals()['var'] = None",      category:"garbage", icon:"📦", hint:"Sobrescribe 'var' a None → pierde referencia",    glowColor:"#ff4d4d", wave:4, sizeMult:1.3, speedBonus:-0.3 },
  { id:"g_circular_del",     text:"a.ref = None\nb.ref = None", category:"garbage", icon:"🔗", hint:"Rompe referencia circular → GC las limpia",       glowColor:"#ff6666", wave:4, sizeMult:1.3, speedBonus:-0.2 },
  { id:"g_lista_vacia",      text:"lista[:] = []",               category:"garbage", icon:"🧽", hint:"Vacía la lista en su lugar",                      glowColor:"#ff4d4d", wave:1, sizeMult:1.0  },
  { id:"g_del_var",          text:"del usuario",                 category:"garbage", icon:"💣", hint:"Elimina la variable del scope",                   glowColor:"#ff4d4d", wave:1, sizeMult:1.0  },
  // ✅ ACTIVE
  { id:"a_class_instance",   text:"usuario = Usuario('pyto')",   category:"active",  icon:"✅", hint:"Instancia de clase — tiene referencia activa",    glowColor:"#00ff88", wave:1 },
  { id:"a_import_active",    text:"import sys",                  category:"active",  icon:"✅", hint:"Módulos se cachean en sys.modules — siempre activos", glowColor:"#00ff88", wave:1 },
  { id:"a_none_check",       text:"if resultado is None:",       category:"active",  icon:"✅", hint:"Solo verifica — no destruye nada",                glowColor:"#00ff88", wave:2 },
  { id:"a_underscore_var",   text:"_ = calcular_pi(1000)",       category:"active",  icon:"✅", hint:"'_' no borra el resultado — la función SÍ usa memoria", glowColor:"#00ff88", wave:2 },
  { id:"a_self_assign",      text:"x = x",                       category:"active",  icon:"✅", hint:"Reasignación a sí mismo — referencia sigue viva", glowColor:"#00ff88", wave:2, sizeMult:0.7, speedBonus:0.4 },
  { id:"a_large_alloc",      text:"buffer = [None] * 100_000",   category:"active",  icon:"✅", hint:"Grande pero tiene referencia válida",              glowColor:"#00ff88", wave:3, sizeMult:1.3, livesLost:2 },
  { id:"a_lambda_closure",   text:"fn = lambda: objeto",         category:"active",  icon:"✅", hint:"La lambda captura 'objeto' — mientras fn viva, objeto también", glowColor:"#00ff88", wave:3 },
  { id:"a_generator_active", text:"gen = (x**2 for x in range(1000))", category:"active", icon:"✅", hint:"Generador lazy pero el objeto SÍ existe", glowColor:"#00ff88", wave:4, sizeMult:0.7, speedBonus:0.5 },
  // 💥 BOMBS
  { id:"b_system_exit_raise",text:"raise SystemExit(0)",         category:"bomb",    icon:"🔵", hint:"¡TRAMPA! Parece info pero es SystemExit disfrazado", glowColor:"#4488ff", wave:2, livesLost:2 },
  { id:"b_exec_bomb",        text:"exec(\"import os; os.abort()\")",category:"bomb",  icon:"💥", hint:"Bomba oculta dentro de exec()",                   glowColor:"#ff0066", wave:3, livesLost:3, sizeMult:1.3, speedBonus:-0.3 },
  { id:"b_atexit_bomb",      text:"atexit.register(sys.exit)",   category:"bomb",    icon:"⏱️", hint:"Bomba diferida — registra sys.exit para después", glowColor:"#ff8800", wave:3, livesLost:2, hasTimer:true },
  { id:"b_import_disguised", text:"__import__('sys').exit()",    category:"bomb",    icon:"💥", hint:"sys.exit() camuflado con __import__",              glowColor:"#ff0044", wave:3, livesLost:2 },
  { id:"b_keyboard_interrupt",text:"raise KeyboardInterrupt",    category:"bomb",    icon:"⌨️", hint:"Simula Ctrl+C — bomba de alta velocidad",          glowColor:"#ff2200", wave:4, livesLost:2, sizeMult:0.7, speedBonus:0.6 },
  { id:"b_os_kill",          text:"os.kill(os.getpid(), 9)",     category:"bomb",    icon:"☢️", hint:"SIGKILL — la bomba nuclear del SO",                glowColor:"#ff0000", wave:5, livesLost:3, sizeMult:1.3, speedBonus:-0.5 },
];

// Wave ID pools
const WAVE_POOLS: string[][] = [
  ["g_gc_collect","g_none_assign","g_lista_vacia","g_del_var","a_class_instance","a_import_active"],
  ["g_rebind_cache","g_ctx_manager","g_none_assign","g_lista_vacia","a_underscore_var","a_self_assign","a_none_check","b_system_exit_raise"],
  ["g_weakref","g_dict_clear","g_ctx_manager","a_large_alloc","a_lambda_closure","a_generator_active","b_exec_bomb","b_atexit_bomb","b_import_disguised"],
  ["g_locals_override","g_circular_del","g_weakref","a_generator_active","a_self_assign","a_lambda_closure","b_keyboard_interrupt","b_import_disguised"],
  // wave 5 = ALL
];

type Bubble = {
  id: number;
  def: BubbleDef;
  x: number;
  y: number;
  speed: number;
  scale: number;
  rotation: number;
  flashGreen: boolean;
  flashRed: boolean;
};

// ─────────────────────────────────────────────
//  WAVE CONFIG
// ─────────────────────────────────────────────
type Wave = { label: string; spawnIntervalMs: number; speedMult: number; bombChance: number; gcXpBonus: number; };

const WAVES: Wave[] = [
  { label:"Ola 1 — Inicialización del sistema",         spawnIntervalMs:2200, speedMult:1.0, bombChance:0,    gcXpBonus:10 },
  { label:"Ola 2 — Fuga detectada",                     spawnIntervalMs:1800, speedMult:1.2, bombChance:0.08, gcXpBonus:15 },
  { label:"Ola 3 — Alerta crítica",                     spawnIntervalMs:1400, speedMult:1.5, bombChance:0.15, gcXpBonus:20 },
  { label:"Ola 4 — Desbordamiento de memoria",          spawnIntervalMs:1000, speedMult:1.9, bombChance:0.20, gcXpBonus:30 },
  { label:"Ola 5 — ⚠ KERNEL PANIC: Modo supervivencia", spawnIntervalMs:650,  speedMult:2.5, bombChance:0.28, gcXpBonus:50 },
];

// ─────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export function MemoryLeakView() {
  const { gainXP } = useGamification();

  const [phase, setPhase] = useState<"menu" | "playing" | "gameover" | "victory">("menu");
  const [waveIdx, setWaveIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);  // consecutive correct hits
  const [floatingLabels, setFloatingLabels] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);

  const bubblesRef = useRef<Bubble[]>([]);
  const [bubblesRender, setBubblesRender] = useState<Bubble[]>([]);

  const frameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const livesRef = useRef(5);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const waveIdxRef = useRef(0);
  const phaseRef = useRef<"menu" | "playing" | "gameover" | "victory">("menu");

  // keep refs in sync
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { waveIdxRef.current = waveIdx; }, [waveIdx]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── WAVE progression: every 20 correct collections advance the wave
  useEffect(() => {
    if (phase !== "playing") return;
    const newWave = Math.min(Math.floor(score / 200), WAVES.length - 1);
    if (newWave !== waveIdx) {
      setWaveIdx(newWave);
      soundEngine.play("win");
    }
  }, [score, phase, waveIdx]);

  // ── SPAWN + PHYSICS LOOP
  const startLoop = useCallback(() => {
    const loop = (time: number) => {
      if (phaseRef.current !== "playing") return;

      const wave = WAVES[waveIdxRef.current];

      // Spawn
      if (time - lastSpawnRef.current > wave.spawnIntervalMs) {
        lastSpawnRef.current = time;
        const waveI = waveIdxRef.current;
        // Build pool: use WAVE_POOLS if available, else all
        const poolIds = waveI < WAVE_POOLS.length ? WAVE_POOLS[waveI] : null;
        let pool = poolIds
          ? BUBBLE_DEFS.filter(d => poolIds.includes(d.id))
          : BUBBLE_DEFS;
        // Apply bomb chance
        const spawnBomb = Math.random() < wave.bombChance;
        const bombPool = pool.filter(d => d.category === "bomb");
        const nonBombPool = pool.filter(d => d.category !== "bomb");
        if (spawnBomb && bombPool.length > 0) pool = bombPool;
        else pool = nonBombPool.length > 0 ? nonBombPool : pool;

        const def = pool[Math.floor(Math.random() * pool.length)];
        const baseSpeed = (0.10 + Math.random() * 0.07) * wave.speedMult;
        const newBubble: Bubble = {
          id: Date.now() + Math.random(),
          def,
          x: 5 + Math.random() * 90,
          y: 108,
          speed: baseSpeed + (def.speedBonus ?? 0) * 0.05,
          scale: (def.sizeMult ?? 1.0) * (0.85 + Math.random() * 0.15),
          rotation: (Math.random() - 0.5) * 8,
          flashGreen: false,
          flashRed: false,
        };
        bubblesRef.current = [...bubblesRef.current, newBubble];
      }

      // Move + out-of-bounds check
      let lostLife = false;
      bubblesRef.current = bubblesRef.current.filter(b => {
        b.y -= b.speed;
        if (b.y < -12) {
          // garbage escaped → lose life
          if (b.def.category === "garbage") {
            lostLife = true;
          }
          return false;
        }
        return true;
      });

      if (lostLife) {
        const newLives = Math.max(0, livesRef.current - 1);
        setLives(newLives);
        soundEngine.play("error");
        if (newLives <= 0) {
          setPhase("gameover");
          bubblesRef.current = [];
          setBubblesRender([]);
          return;
        }
      }

      setBubblesRender([...bubblesRef.current]);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const startGame = () => {
    bubblesRef.current = [];
    setBubblesRender([]);
    setScore(0); scoreRef.current = 0;
    setLives(5); livesRef.current = 5;
    setCombo(0); comboRef.current = 0;
    setWaveIdx(0); waveIdxRef.current = 0;
    setFloatingLabels([]);
    lastSpawnRef.current = performance.now();
    setPhase("playing");
    soundEngine.play("click");
  };

  useEffect(() => {
    if (phase === "playing") startLoop();
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase, startLoop]);

  // ── CLICK HANDLER
  const handleBubbleClick = (b: Bubble) => {
    if (phaseRef.current !== "playing") return;

    // Remove from pool immediately
    bubblesRef.current = bubblesRef.current.filter(x => x.id !== b.id);
    setBubblesRender([...bubblesRef.current]);

    const wave = WAVES[waveIdxRef.current];

    if (b.def.category === "garbage") {
      // ✅ Correct — GC collection
      const newCombo = comboRef.current + 1;
      setCombo(newCombo);
      const xpGain = wave.gcXpBonus * (newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1);
      const newScore = scoreRef.current + xpGain;
      setScore(newScore);
      soundEngine.play("pop");
      spawnLabel(b.x, b.y, `+${xpGain} XP${newCombo >= 3 ? ` 🔥x${newCombo}` : ""}`, "text-green-400");

    } else if (b.def.category === "active") {
      const dmg = b.def.livesLost ?? 1;
      const newLives = Math.max(0, livesRef.current - dmg);
      setLives(newLives);
      setCombo(0);
      soundEngine.play("hit");
      spawnLabel(b.x, b.y, `-${dmg} ❌ ${b.def.hint.split("—")[0].trim()}`, "text-red-400");
      if (newLives <= 0) { setPhase("gameover"); bubblesRef.current = []; setBubblesRender([]); }

    } else if (b.def.category === "bomb") {
      const dmg = b.def.livesLost ?? 2;
      const newLives = Math.max(0, livesRef.current - dmg);
      setLives(newLives);
      setCombo(0);
      soundEngine.play("error");
      spawnLabel(b.x, b.y, `💥 -${dmg} VIDAS`, "text-yellow-400");
      if (newLives <= 0) { setPhase("gameover"); bubblesRef.current = []; setBubblesRender([]); }
    }
  };

  const spawnLabel = (x: number, y: number, text: string, color: string) => {
    const id = Date.now() + Math.random();
    setFloatingLabels(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatingLabels(prev => prev.filter(l => l.id !== id)), 1000);
  };

  const endScore = score;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4" style={{ height: "calc(100vh - 64px)" }}>

        {/* ─ HUD ─ */}
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur rounded-2xl px-6 py-3 border border-slate-800 shadow-xl shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-purple-400" />
            <div>
              <p className="font-black text-white text-lg leading-none">Defensa de Fugas</p>
              <p className="text-purple-400 text-xs font-bold mt-0.5">
                {phase === "playing" ? WAVES[waveIdx].label : "Garbage Collector Simulator"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Combo */}
            {combo >= 3 && (
              <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 rounded-xl px-3 py-1.5 animate-pulse">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="font-black text-orange-300 text-sm">x{combo} COMBO</span>
              </div>
            )}

            {/* Score */}
            <div className="text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">XP</p>
              <motion.p key={score} initial={{ scale: 1.3, color: "#4ade80" }} animate={{ scale: 1, color: "#4ade80" }} className="text-2xl font-black text-green-400">
                {score}
              </motion.p>
            </div>

            {/* Lives */}
            <div className="text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Vidas</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={i === lives ? { scale: [1, 0.5, 1.2, 1] } : {}}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${i < lives ? "text-red-500 fill-red-500" : "text-slate-700"}`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─ LEGEND ─ */}
        {phase === "playing" && (
          <div className="flex gap-3 justify-center text-xs font-bold shrink-0">
            <span className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full">🗑️ Basura = DESTRUIR</span>
            <span className="bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-1 rounded-full">✅ Activa = DEJAR PASAR</span>
            <span className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1 rounded-full">💥 Bomba = EVITAR</span>
          </div>
        )}

        {/* ─ ARENA ─ */}
        <div
          className="flex-1 relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] cursor-crosshair"
          style={{
            background: "radial-gradient(ellipse at center bottom, #0f172a 0%, #020617 100%)",
          }}
        >
          {/* Animated grid floor */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-30"
            style={{
              background: "linear-gradient(to top, rgba(139,92,246,0.3), transparent)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg,rgba(139,92,246,0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              transform: "perspective(600px) rotateX(55deg)",
              transformOrigin: "bottom",
            }}
          />

          {/* Top danger zone */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-red-600/40 to-transparent pointer-events-none z-20">
            <p className="text-center text-red-300 text-[10px] font-black uppercase tracking-[0.3em] leading-8">⚠ ZONA DE FUGA ⚠</p>
          </div>

          {/* Floating score labels */}
          <AnimatePresence>
            {floatingLabels.map(l => (
              <motion.div
                key={l.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className={`absolute font-black text-sm pointer-events-none z-40 ${l.color}`}
                style={{ left: `${l.x}%`, top: `${l.y}%`, transform: "translate(-50%,-50%)" }}
              >
                {l.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* BUBBLES */}
          <AnimatePresence>
            {bubblesRender.map(b => {
              const isGarbage = b.def.category === "garbage";
              const isBomb    = b.def.category === "bomb";
              const isActive  = b.def.category === "active";

              return (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: b.scale, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleBubbleClick(b)}
                  className="absolute select-none cursor-pointer group"
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    transform: `translate(-50%, -50%) rotate(${b.rotation}deg)`,
                    zIndex: 10,
                  }}
                >
                  <div
                    className={`
                      relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1
                      border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform
                      group-hover:scale-110
                      ${isGarbage ? "bg-purple-900/60 border-purple-400/60 hover:bg-purple-700/80 shadow-purple-500/20" : ""}
                      ${isActive  ? "bg-slate-800/60 border-slate-400/40 hover:bg-red-900/60 hover:border-red-500/60" : ""}
                      ${isBomb    ? "bg-orange-900/60 border-orange-400/60 hover:bg-orange-700/80 shadow-orange-500/30 animate-pulse" : ""}
                    `}
                  >
                    {/* Glowing inner ring */}
                    <div className={`
                      absolute inset-2 rounded-full border opacity-30
                      ${isGarbage ? "border-purple-300" : isActive ? "border-slate-300" : "border-orange-300"}
                    `} />

                    <span className="text-xl leading-none relative z-10">{b.def.icon}</span>
                    <span className={`
                      font-mono font-black text-[9px] text-center px-2 leading-tight relative z-10 break-all
                      ${isGarbage ? "text-purple-200" : isActive ? "text-slate-300" : "text-orange-200"}
                    `}>
                      {b.def.text}
                    </span>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900/95 border border-slate-700 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                    <p className="text-[10px] text-slate-300 leading-tight">{b.def.hint}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ─ OVERLAYS ─ */}
          <AnimatePresence>
            {/* MENU */}
            {phase === "menu" && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-50 p-8"
              >
                <motion.div
                  initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_60px_rgba(139,92,246,0.2)]"
                >
                  <Target className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-pulse" />
                  <h2 className="text-4xl font-black text-white mb-2">Garbage Collector</h2>
                  <p className="text-purple-300 font-bold mb-6 text-lg">Simulator</p>
                  
                  <div className="bg-slate-800/80 rounded-2xl p-4 mb-8 text-left space-y-2">
                    <p className="flex items-center gap-2 text-sm text-slate-300"><span className="text-xl">🗑️</span> Haz clic en variables <span className="text-purple-300 font-bold">basura</span> para recolectarlas.</p>
                    <p className="flex items-center gap-2 text-sm text-slate-300"><span className="text-xl">✅</span> <span className="text-green-300 font-bold">No toques</span> las variables activas o perderás vida.</p>
                    <p className="flex items-center gap-2 text-sm text-slate-300"><span className="text-xl">💥</span> Las <span className="text-orange-300 font-bold">bombas</span> quitan 2 vidas si las tocas.</p>
                    <p className="flex items-center gap-2 text-sm text-slate-300"><span className="text-xl">🔥</span> Los <span className="text-yellow-300 font-bold">combos</span> multiplican tu XP hasta 3x.</p>
                  </div>
                  
                  <Button size="lg" onClick={startGame} className="w-full h-16 text-xl font-black bg-gradient-to-r from-purple-600 to-violet-600 border-none hover:scale-105 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                    INICIAR DEFENSA ⚡
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* GAME OVER */}
            {phase === "gameover" && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="bg-red-950/90 border-2 border-red-500/60 rounded-3xl p-10 max-w-sm w-full text-center mx-4 shadow-[0_0_60px_rgba(239,68,68,0.3)]"
                >
                  <Skull className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce" />
                  <h2 className="text-5xl font-black text-white mb-2">FUGA TOTAL</h2>
                  <p className="text-red-300 font-bold mb-4 text-lg">La memoria se ha corrompido.</p>
                  <div className="bg-red-900/50 rounded-xl p-4 mb-8">
                    <p className="text-3xl font-black text-white">{endScore} XP</p>
                    <p className="text-red-400 text-sm font-bold">recolectados esta partida</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-black bg-white text-red-700 hover:bg-red-50 hover:scale-105 transition-transform border-none"
                    onClick={() => {
                      gainXP(endScore);
                      setPhase("menu");
                    }}
                  >
                    +{endScore} XP → REINTENTAR 🔄
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
