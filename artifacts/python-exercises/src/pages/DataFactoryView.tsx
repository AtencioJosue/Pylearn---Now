import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Box, Cpu, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/context/GamificationContext";
import { soundEngine } from "@/utils/sound";

// ──────────────────────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────────────────────
type Machine = {
  id: string;
  code: string;
  hint: string;
  transform: (val: any) => any;
  baseColor: string; // tailwind classes when idle
};

const MACHINES: Machine[] = [
  { id: "m1", code: ".upper()", hint: "Convierte todos los caracteres a MAYÚSCULAS.", transform: (v) => typeof v === "string" ? v.toUpperCase() : v, baseColor: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { id: "m2", code: ".capitalize()", hint: "Solo la primera letra en mayúscula.", transform: (v) => typeof v === "string" ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v, baseColor: "border-purple-500 bg-purple-500/10 text-purple-400" },
  { id: "m3", code: "+ '!'", hint: "Concatena '!' al final del texto.", transform: (v) => typeof v === "string" ? v + "!" : v, baseColor: "border-red-500 bg-red-500/10 text-red-400" },
  { id: "m4", code: "len(x)", hint: "Devuelve la longitud del string o lista.", transform: (v) => (typeof v === "string" || Array.isArray(v)) ? v.length : v, baseColor: "border-green-500 bg-green-500/10 text-green-400" },
  { id: "m5", code: ".replace('o','a')", hint: "Sustituye todas las 'o' por 'a'.", transform: (v) => typeof v === "string" ? v.replace(/o/g, "a") : v, baseColor: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { id: "m6", code: "x * 2", hint: "Multiplica el número por 2.", transform: (v) => typeof v === "number" ? v * 2 : (typeof v === "string" ? v.repeat(2) : v), baseColor: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { id: "m7", code: "x + 5", hint: "Suma 5 al número.", transform: (v) => typeof v === "number" ? v + 5 : v, baseColor: "border-pink-500 bg-pink-500/10 text-pink-400" },
  { id: "m8", code: ".append(3)", hint: "Agrega el elemento 3 al final de la lista.", transform: (v) => Array.isArray(v) ? [...v, 3] : v, baseColor: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
  { id: "m9", code: "x[::-1]", hint: "Invierte el orden de la lista o texto.", transform: (v) => typeof v === "string" ? v.split("").reverse().join("") : (Array.isArray(v) ? [...v].reverse() : v), baseColor: "border-teal-500 bg-teal-500/10 text-teal-400" },
  { id: "m10", code: ".split(',')", hint: "Divide un texto separado por comas en una lista.", transform: (v) => typeof v === "string" ? v.split(",") : v, baseColor: "border-indigo-500 bg-indigo-500/10 text-indigo-400" },
  { id: "m11", code: "sum(x)", hint: "Suma todos los elementos de una lista de números.", transform: (v) => Array.isArray(v) ? v.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : v, baseColor: "border-sky-500 bg-sky-500/10 text-sky-400" },
  { id: "m12", code: "sorted(x)", hint: "Ordena los elementos de menor a mayor.", transform: (v) => Array.isArray(v) ? [...v].sort((a,b) => a - b) : v, baseColor: "border-rose-500 bg-rose-500/10 text-rose-400" },
  { id: "m13", code: "x.items()", hint: "Devuelve pares (clave, valor) de un diccionario.", transform: (v) => v && typeof v === "object" && !Array.isArray(v) ? Object.entries(v) : v, baseColor: "border-violet-500 bg-violet-500/10 text-violet-400" },
  { id: "m14", code: "set(x)", hint: "Elimina duplicados — devuelve conjunto.", transform: (v) => Array.isArray(v) ? [...new Set(v)] : v, baseColor: "border-amber-500 bg-amber-500/10 text-amber-400" },
  { id: "m15", code: "dict(x)", hint: "Construye un dict a partir de pares (clave, valor).", transform: (v) => Array.isArray(v) ? Object.fromEntries(v) : v, baseColor: "border-lime-500 bg-lime-500/10 text-lime-400" },
  { id: "m16", code: "Counter(x)", hint: "Cuenta la frecuencia de cada elemento.", transform: (v) => { if (typeof v !== "string" && !Array.isArray(v)) return v; const c: Record<string,number> = {}; for (const ch of v as any) c[String(ch)] = (c[String(ch)] || 0) + 1; return c; }, baseColor: "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400" },
  { id: "m17", code: ".most_common()", hint: "Ordena por frecuencia — retorna lista de tuplas.", transform: (v) => v && typeof v === "object" && !Array.isArray(v) ? Object.entries(v).sort((a: any, b: any) => b[1] - a[1]) : v, baseColor: "border-cyan-500 bg-cyan-500/10 text-cyan-400" },
  { id: "m18", code: "[f'{k.upper()}:{v}']", hint: "Comprehension sobre pares clave-valor.", transform: (v) => Array.isArray(v) ? v.map(([k, val]: [any, any]) => `${String(k).toUpperCase()}:${val}`) : v, baseColor: "border-orange-400 bg-orange-400/10 text-orange-300" },
];

type Level = { initialData: any; targetData: any; maxSlots: number; machines: string[]; desc: string; successMessage?: string; failMessage?: string; isBoss?: boolean; };

const LEVELS: Level[] = [
  { initialData: "python", targetData: "PYTHON!", maxSlots: 2, machines: ["m1","m3","m2","m5"], desc: "Transforma el texto a mayúsculas con exclamación.", successMessage: "¡Exacto! .upper() convierte a mayúsculas, + '!' concatena.", failMessage: "¿Seguro del orden? Prueba .upper() primero." },
  { initialData: "gato",   targetData: "gata",    maxSlots: 1, machines: ["m5","m3","m1","m2"], desc: "Reemplaza todas las 'o' por 'a'.", successMessage: "¡Correcto! .replace('o','a') sustituye todas las ocurrencias.", failMessage: ".replace() es el que cambia caracteres específicos." },
  { initialData: 10,       targetData: 25,         maxSlots: 2, machines: ["m6","m7","m4"],      desc: "Aplica operaciones matemáticas para llegar a 25.", successMessage: "¡Bien! x*2=20, luego x+5=25.", failMessage: "Prueba multiplicar primero y luego sumar." },
  { initialData: [1, 2],   targetData: [1, 2, 3],  maxSlots: 1, machines: ["m8","m4","m6"],      desc: "Añade el elemento 3 a la lista.", successMessage: "¡Perfecto! .append(3) agrega al final.", failMessage: ".append(3) es el que agrega elementos a una lista." },
  { initialData: "hola",   targetData: 8,          maxSlots: 2, machines: ["m1","m6","m4"],      desc: "Transforma el texto para obtener su longitud * 2.", successMessage: "¡Genial! 'HOLA'*2='HOLAHOLA', len()=8.", failMessage: "¿Duplicas el string primero y luego mides su longitud?" },
  { initialData: "odunm",  targetData: "mundo",    maxSlots: 2, machines: ["m9","m5","m2"],      desc: "Invierte y reemplaza para obtener 'mundo'.", successMessage: "¡Brillante! x[::-1] invierte, .replace() corrige la 'o'.", failMessage: "Prueba invertir primero con x[::-1]." },
  { initialData: "1,2,3",  targetData: [1,2,3,3],  maxSlots: 2, machines: ["m10","m8","m9"],     desc: "Divide el string por comas e inserta el número 3.", successMessage: "¡Correcto! .split(',') divide, .append(3) agrega.", failMessage: "¿Primero divides el texto y luego agregas el elemento?" },
  { initialData: [5, 10],  targetData: 15,         maxSlots: 1, machines: ["m11","m12","m6"],    desc: "Suma todos los valores de la lista.", successMessage: "¡Exacto! sum() suma todos los elementos en un paso.", failMessage: "sum() suma todos los elementos directamente." },
  { initialData: {a:1,b:2,c:3}, targetData: ["A:1","B:2","C:3"], maxSlots: 2, machines: ["m13","m18","m19" as any,"m20" as any], desc: "Autopsia de Diccionario — extrae pares y formatea.", successMessage: "¡Magistral! .items() da los pares, la comprehension los formatea.", failMessage: ".keys() y .values() van por separado. ¡.items() une clave y valor!" },
  { initialData: "mississippi", targetData: [["i",4],["s",4],["p",2],["m",1]], maxSlots: 2, machines: ["m16","m17","m14","m11"], desc: "⚡ BOSS: Mississippi Counter — frecuencia de letras.", successMessage: "¡BOSS DERROTADO! Counter cuenta, .most_common() ordena por frecuencia.", failMessage: "Counter devuelve un objeto especial. .most_common() lo ordena.", isBoss: true },
];

const fmt = (v: any) => typeof v === "string" ? `"${v}"` : JSON.stringify(v);

// ──────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────
type SlotState = "idle" | "active" | "correct" | "wrong";

export function DataFactoryView() {
  const { gainXP } = useGamification();
  const [lvl, setLvl] = useState(0);
  const level = LEVELS[lvl];

  // pipeline: ordered machines placed by user
  const [pipeline, setPipeline] = useState<Machine[]>([]);
  const [inventory, setInventory] = useState<Machine[]>([]);

  // running state
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<"none" | "success" | "fail">("none");

  // per-step data: intermediate value after each slot, slot state
  const [stepValues, setStepValues] = useState<(any | undefined)[]>([]);
  const [slotStates, setSlotStates] = useState<SlotState[]>([]);
  // current animated blob value (shown on moving data block)
  const [blobValue, setBlobValue] = useState<any>(level.initialData);
  // which slot the blob is currently at (-1 = start, pipeline.length = end)
  const [blobPos, setBlobPos] = useState(-1);

  const running = useRef(false);

  // init / level change
  useEffect(() => {
    const inv = MACHINES.filter(m => level.machines.includes(m.id));
    setPipeline([]);
    setInventory(inv);
    setPhase("idle");
    setResult("none");
    setStepValues([]);
    setSlotStates([]);
    setBlobValue(level.initialData);
    setBlobPos(-1);
    running.current = false;
    soundEngine.play("click");
  }, [lvl]);

  // ── add / remove ──
  const addToSlot = (m: Machine) => {
    if (pipeline.length >= level.maxSlots || phase !== "idle") { soundEngine.play("error"); return; }
    soundEngine.play("pop");
    setPipeline(p => [...p, m]);
    setInventory(inv => inv.filter(x => x.id !== m.id));
  };

  const removeFromSlot = (m: Machine, idx: number) => {
    if (phase !== "idle") return;
    soundEngine.play("pop");
    setPipeline(p => { const n = [...p]; n.splice(idx, 1); return n; });
    setInventory(inv => [...inv, m]);
  };

  // ── RUN ──
  const handleRun = async () => {
    if (pipeline.length === 0 || phase !== "idle") return;

    running.current = true;
    setPhase("running");
    setStepValues(Array(pipeline.length).fill(undefined));
    setSlotStates(Array(pipeline.length).fill("idle"));
    setBlobPos(-1);
    setBlobValue(level.initialData);

    let val = level.initialData;

    for (let i = 0; i < pipeline.length; i++) {
      if (!running.current) return;

      // blob moves to slot i
      setBlobPos(i);
      setSlotStates(prev => prev.map((s, idx) => idx === i ? "active" : s));
      soundEngine.play("click");
      await delay(900);

      // apply transform
      val = pipeline[i].transform(val);
      setBlobValue(val);
      setStepValues(prev => prev.map((v, idx) => idx === i ? val : v));

      // color the slot
      const slotCorrect = checkPartial(val, i, pipeline);
      const newState: SlotState = slotCorrect ? "correct" : "wrong";
      setSlotStates(prev => prev.map((s, idx) => idx === i ? newState : s));
      soundEngine.play(slotCorrect ? "heal" : "error");
      await delay(600);
    }

    // move blob to end
    setBlobPos(pipeline.length);
    await delay(700);

    const success = JSON.stringify(val) === JSON.stringify(level.targetData);
    setResult(success ? "success" : "fail");
    setPhase("done");
    if (success) { soundEngine.play("win"); gainXP(level.isBoss ? 200 : 50); }
    else soundEngine.play("error");
  };

  const reset = () => {
    running.current = false;
    const inv = MACHINES.filter(m => level.machines.includes(m.id));
    setPipeline([]);
    setInventory(inv);
    setPhase("idle");
    setResult("none");
    setStepValues([]);
    setSlotStates([]);
    setBlobValue(level.initialData);
    setBlobPos(-1);
    soundEngine.play("click");
  };

  const nextLevel = () => {
    if (lvl < LEVELS.length - 1) setLvl(l => l + 1);
    else setLvl(0);
  };

  // ── BLOB X POSITION (% of conveyor width) ──
  const SLOT_WIDTH = 160; // px per slot
  const GAP = 24;
  const blobX = blobPos < 0 ? 0 : blobPos >= pipeline.length
    ? (pipeline.length * (SLOT_WIDTH + GAP)) + SLOT_WIDTH / 2
    : blobPos * (SLOT_WIDTH + GAP) + SLOT_WIDTH / 2;

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 flex flex-col items-center">
        {/* TITLE */}
        <div className="text-center mb-8 w-full">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Cpu className="text-cyan-500 w-9 h-9" />
            <h1 className="text-4xl font-display font-extrabold text-slate-800 dark:text-slate-100">Fábrica de Datos</h1>
          </div>
          {level.isBoss && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1 mb-2 animate-pulse">
              <span className="text-yellow-400 font-black text-sm">⚡ NIVEL JEFE</span>
            </div>
          )}
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            Nivel {lvl + 1} / {LEVELS.length} — {level.desc}
          </p>
          {/* Level dots */}
          <div className="flex justify-center gap-2 mt-3">
            {LEVELS.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === lvl ? "bg-cyan-400 scale-125" : i < lvl ? "bg-green-500" : "bg-slate-700"}`} />
            ))}
          </div>
        </div>

        {/* FACTORY CARD */}
        <div className="w-full bg-slate-900 rounded-3xl border-4 border-slate-800 p-6 shadow-2xl relative mb-8">

          {/* INPUT / OUTPUT LABELS */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Entrada</span>
              <div className="bg-slate-800 border-2 border-cyan-500/40 px-5 py-2 rounded-xl font-mono text-lg text-cyan-300 font-bold shadow-inner">
                {fmt(level.initialData)}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Objetivo</span>
              <div className="bg-slate-800 border-2 border-green-500/40 px-5 py-2 rounded-xl font-mono text-lg text-green-300 font-bold shadow-inner">
                {fmt(level.targetData)}
              </div>
            </div>
          </div>

          {/* CONVEYOR */}
          <div className="bg-slate-950 rounded-2xl min-h-[200px] border-4 border-slate-800 relative flex items-center px-8 gap-6 overflow-x-auto py-10">
            {/* Conveyor belt line */}
            <div className="absolute bottom-6 left-8 right-8 h-2 bg-slate-800 rounded-full">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
            </div>

            {/* DATA BLOB */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 z-20"
              animate={{ x: blobX }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ left: 24 }}
            >
              <div className={`
                font-mono font-black text-base px-4 py-3 rounded-xl border-b-4 shadow-xl flex items-center gap-2 whitespace-nowrap
                ${result === "success" ? "bg-green-400 text-green-900 border-green-600" :
                  result === "fail" ? "bg-red-400 text-red-900 border-red-600" :
                  "bg-white text-slate-900 border-slate-300"}
              `}>
                <Box className="w-5 h-5 text-cyan-500 shrink-0" />
                {fmt(blobValue)}
              </div>
            </motion.div>

            {/* SLOTS */}
            <div className="flex items-center gap-6 relative z-10 mx-auto">
              {Array.from({ length: level.maxSlots }).map((_, i) => {
                const machine = pipeline[i];
                const sState = slotStates[i] ?? "idle";
                const stepVal = stepValues[i];

                const slotBorder = sState === "active" ? "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]" :
                  sState === "correct" ? "border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.5)]" :
                  sState === "wrong" ? "border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]" :
                  machine ? machine.baseColor.split(" ")[0] : "border-dashed border-slate-700";

                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    {/* Intermediate value badge */}
                    <div className={`
                      h-8 flex items-center justify-center font-mono text-sm font-bold px-3 py-1 rounded-lg transition-all
                      ${sState === "correct" ? "bg-green-500/20 text-green-300 border border-green-500/40" :
                        sState === "wrong" ? "bg-red-500/20 text-red-300 border border-red-500/40" :
                        "bg-transparent text-transparent border border-transparent"}
                    `}>
                      {stepVal !== undefined ? fmt(stepVal) : " "}
                    </div>

                    {/* Slot box */}
                    <div
                      className={`w-40 h-36 rounded-2xl border-2 transition-all duration-300 relative flex flex-col items-center justify-center
                        ${slotBorder}
                        ${sState === "correct" ? "bg-green-500/10" : sState === "wrong" ? "bg-red-500/10" : "bg-slate-900"}
                      `}
                    >
                      {machine ? (
                        <div
                          onClick={() => removeFromSlot(machine, i)}
                          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer rounded-2xl"
                        >
                          {/* Status indicator */}
                          {sState === "correct" && <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">✓</div>}
                          {sState === "wrong" && <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">✗</div>}

                          <Cpu className="w-8 h-8 mb-2 opacity-60" />
                          <span className={`font-mono font-bold text-sm text-center px-2 ${machine.baseColor.split(" ")[2]}`}>{machine.code}</span>
                          <span className="text-[10px] text-slate-500 mt-1 px-2 text-center leading-tight">{machine.hint}</span>
                        </div>
                      ) : (
                        <span className="text-slate-700 font-black text-4xl">+</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RUN / RESET BUTTON */}
          <div className="mt-6 flex justify-center">
            {phase === "idle" ? (
              <Button
                size="lg"
                onClick={handleRun}
                disabled={pipeline.length === 0}
                className="px-12 h-14 text-lg font-bold hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5 mr-2" /> Iniciar Fábrica
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={reset}
                variant="outline"
                disabled={phase === "running"}
                className="px-12 h-14 text-lg font-bold border-slate-700 hover:bg-slate-800 hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> {phase === "running" ? "Procesando..." : "Reiniciar"}
              </Button>
            )}
          </div>

          {/* OVERLAYS */}
          <AnimatePresence>
            {result === "success" && phase === "done" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-green-950/90 backdrop-blur-sm rounded-2xl border-4 border-green-500 flex flex-col items-center justify-center z-50"
              >
                <Sparkles className="w-20 h-20 text-green-400 mb-4 animate-bounce" />
                <h2 className="text-5xl font-black text-white mb-2">¡CORRECTO!</h2>
                <p className="text-green-300 font-bold text-xl mb-8">+50 XP</p>
                <Button
                  onClick={nextLevel}
                  className="text-xl px-10 py-6 rounded-2xl bg-green-500 hover:bg-green-400 border-none hover:scale-105 transition-transform text-white font-black"
                >
                  {lvl < LEVELS.length - 1 ? "Siguiente Nivel ➡️" : "¡Completado! 🏆"}
                </Button>
              </motion.div>
            )}
            {result === "fail" && phase === "done" && (
              <motion.div
                key="fail"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-red-950/90 backdrop-blur-sm rounded-2xl border-4 border-red-500 flex flex-col items-center justify-center z-50"
              >
                <h2 className="text-4xl font-black text-white mb-3">Pipeline Incorrecto</h2>
                <p className="font-mono text-xl text-red-200 bg-red-900/80 px-5 py-2 rounded-xl border border-red-500/40 mb-2">
                  Obtuviste: {fmt(blobValue)}
                </p>
                <p className="font-mono text-xl text-green-300 mb-8">
                  Necesitabas: {fmt(level.targetData)}
                </p>
                <Button onClick={reset} className="text-xl px-10 py-6 rounded-2xl bg-red-600 hover:bg-red-500 border-none hover:scale-105 transition-transform text-white font-black">
                  Corregir Pipeline 🛠️
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INVENTORY */}
        <div className="w-full">
          <h3 className="text-base font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            Inventario de Máquinas
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-sm">{inventory.length}</span>
            <span className="text-slate-600 text-xs font-normal normal-case tracking-normal ml-2">Haz clic para agregar al pipeline ↑</span>
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <AnimatePresence>
              {inventory.map(machine => (
                <motion.div
                  key={`inv-${machine.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => addToSlot(machine)}
                  className={`w-40 h-36 cursor-pointer border-2 rounded-2xl flex flex-col items-center justify-center transition-transform hover:-translate-y-2 shadow-lg hover:shadow-xl ${machine.baseColor}`}
                >
                  <Cpu className="w-8 h-8 mb-2 opacity-60" />
                  <span className="font-mono font-bold text-center px-2 text-sm">{machine.code}</span>
                  <span className="text-[10px] text-slate-500 mt-1 px-3 text-center leading-tight">{machine.hint}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── helpers ──
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Check if `val` at step `i` is still "on track" toward the target.
 * We simulate the remaining steps using the same machines to verify if the
 * final output would still be achievable — but since we don't know the
 * "correct" intermediate, we use a simpler heuristic: just check the final output
 * after all steps up to and including i.
 */
function checkPartial(val: any, stepIdx: number, pipeline: Machine[]): boolean {
  // Run remaining machines from stepIdx+1 onward to see if we can reach target
  // We just check that the current value is not clearly broken (NaN, wrong type)
  if (val === undefined || val === null) return false;
  if (typeof val === "number" && isNaN(val)) return false;
  return true; // partial correctness determined at end; slot "wrong" only if NaN/undefined
}
