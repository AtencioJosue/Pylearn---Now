import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useGamification } from "@/context/GamificationContext";

// ── AUDIO ──────────────────────────────────────────────────────────
const AudioEngine = {
  ctx: null as AudioContext | null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); },
  playTone(freq: number, duration = 0.12, type: OscillatorType = "square", volume = 0.15) {
    this.init();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  },
  playRingApply(i: number) {
    [[440,554,659],[523,659,784],[587,740,880]][i]?.forEach((f, j) => setTimeout(() => this.playTone(f, 0.18, "square", 0.12), j * 40));
  },
  playError() { this.playTone(150, 0.25, "sawtooth", 0.12); setTimeout(() => this.playTone(100, 0.3, "sawtooth", 0.1), 80); },
  playVictory() { [523,659,784,1047].forEach((f, i) => setTimeout(() => this.playTone(f, 0.22, "square", 0.14), i * 110)); },
  playReset() { this.playTone(300, 0.08, "triangle", 0.1); setTimeout(() => this.playTone(200, 0.1, "triangle", 0.08), 60); },
  playParticle() { [261,294,330,392,440,523].forEach(f => { if (Math.random() < 0.17) this.playTone(f, 0.08, "sine", 0.07); }); },
};

// ── DECORATORS ─────────────────────────────────────────────────────
type DecDef = { id: string; label: string; shortCode: string; description: string; color: string; ringColor: string; borderColor: string; concept: string; fn: (baseFn: (...a: any[]) => any) => (...a: any[]) => any; };

const DECORATORS: Record<string, DecDef> = {
  uppercase: { id:"uppercase", label:"@uppercase_output", shortCode:"@uppercase", description:"Convierte el resultado a MAYÚSCULAS", color:"#00d4a0", ringColor:"rgba(0,212,160,0.15)", borderColor:"#00d4a0", concept:"Transformación del valor de retorno", fn: (f) => (...a) => f(...a).toUpperCase() },
  repeat:    { id:"repeat",    label:"@repeat(3)",         shortCode:"@repeat(3)",   description:"Repite la salida 3 veces con ' — '",      color:"#7f77dd", ringColor:"rgba(127,119,221,0.15)", borderColor:"#7f77dd", concept:"Decoradores con parámetros",              fn: (f) => (...a) => Array(3).fill(f(...a)).join(" — ") },
  timer:     { id:"timer",     label:"@timer",             shortCode:"@timer",       description:"Mide tiempo y lo añade al resultado",      color:"#f5a623", ringColor:"rgba(245,166,35,0.15)",  borderColor:"#f5a623", concept:"Side-effects y wrapping con estado",      fn: (f) => (...a) => `${f(...a)} [2.3ms]` },
  log:       { id:"log",       label:"@log",               shortCode:"@log",         description:"Imprime antes y después de ejecutar",      color:"#ff6b6b", ringColor:"rgba(255,107,107,0.15)", borderColor:"#ff6b6b", concept:"Logging sin modificar la función",        fn: (f) => (...a) => f(...a) },
  cache:     { id:"cache",     label:"@lru_cache",         shortCode:"@lru_cache",   description:"Cachea resultados — segunda llamada fast", color:"#4fc3f7", ringColor:"rgba(79,195,247,0.15)",  borderColor:"#4fc3f7", concept:"Memoización y optimización",             fn: (f) => { const m = new Map(); return (...a) => { const k = JSON.stringify(a); if (m.has(k)) return `${f(...a)} [CACHED ⚡]`; const r = f(...a); m.set(k,r); return r; }; } },
  validate:  { id:"validate",  label:"@validate_input",    shortCode:"@validate",    description:"Valida que el input sea string",           color:"#66bb6a", ringColor:"rgba(102,187,106,0.15)", borderColor:"#66bb6a", concept:"Validación de tipos y defensive programming", fn: (f) => (...a) => typeof a[0] !== "string" ? "TypeError: se esperaba str" : f(...a) },
};

type Puzzle = { id: string; title: string; difficulty: string; xpReward: number; baseFn: { name: string; fn: (...a: any[]) => any }; inputArg: string; targetOutput: string; hint: string; solution: string[]; concept: string; };

const PUZZLES: Puzzle[] = [
  { id:"p1", title:"El Grito del Servidor",  difficulty:"Fácil",  xpReward:100, baseFn:{name:"saludar", fn:(n)=>`Hola, ${n}`},    inputArg:"pyto",   targetOutput:"HOLA, PYTO",                                                          hint:"Una función que convierta el texto a mayúsculas...", solution:["uppercase"],              concept:"Un solo decorador que transforma el retorno" },
  { id:"p2", title:"Eco del Sistema",         difficulty:"Medio",  xpReward:200, baseFn:{name:"saludar", fn:(n)=>`Hola, ${n}`},    inputArg:"pyto",   targetOutput:"HOLA, PYTO — HOLA, PYTO — HOLA, PYTO",                               hint:"Primero mayúsculas, luego repite. ¿O al revés?",    solution:["uppercase","repeat"],      concept:"El orden importa: uppercase DENTRO de repeat" },
  { id:"p3", title:"Inspector de Tiempo",     difficulty:"Medio",  xpReward:250, baseFn:{name:"procesar",fn:(n)=>`Procesando: ${n}`},inputArg:"datos", targetOutput:"PROCESANDO: DATOS [2.3ms]",                                           hint:"Mayúsculas primero, luego el timer mide el total.", solution:["uppercase","timer"],       concept:"El timer mide la función YA decorada" },
  { id:"p4", title:"La Triple Amenaza",       difficulty:"Difícil",xpReward:400, baseFn:{name:"saludar", fn:(n)=>`Hola, ${n}`},    inputArg:"mundo",  targetOutput:"HOLA, MUNDO [2.3ms] — HOLA, MUNDO [2.3ms] — HOLA, MUNDO [2.3ms]",     hint:"Tres decoradores. El orden produce este resultado exacto.", solution:["uppercase","timer","repeat"], concept:"El más externo se aplica ÚLTIMO al resultado" },
  { id:"p5", title:"Cache Mágico",            difficulty:"Medio",  xpReward:200, baseFn:{name:"buscar",  fn:(n)=>`Resultado: ${n}`},inputArg:"pyto",  targetOutput:"Resultado: pyto [CACHED ⚡]",                                          hint:"Llama una vez para guardar, la segunda vez sale el cache.", solution:["cache"],           concept:"lru_cache memoiza resultados automáticamente" },
];

type Particle = { id: number; x: number; y: number; color: string; };

function Ring({ idx, dec, active }: { idx: number; dec: DecDef | null; active: boolean }) {
  const sz = [220,164,108][idx];
  return (
    <motion.div
      style={{ position:"absolute", width:sz, height:sz, borderRadius:"50%", border:`1.5px ${active?"solid":"dashed"} ${active?dec?.borderColor||"#555":"#333"}`, background:active?dec?.ringColor:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
      animate={active?{rotate:360}:{rotate:0}}
      transition={active?{duration:[12,9,6][idx]||8, repeat:Infinity, ease:"linear"}:{duration:0}}
    >
      {active && dec && (
        <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}}
          style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"#0a0a0f", border:`1px solid ${dec.borderColor}`, borderRadius:20, padding:"2px 8px", fontSize:9, fontFamily:"monospace", color:dec.color, whiteSpace:"nowrap", fontWeight:600 }}>
          {dec.shortCode}
        </motion.div>
      )}
    </motion.div>
  );
}

export function DecoratorForgeView() {
  const { gainXP } = useGamification();
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [applied, setApplied] = useState<DecDef[]>([]);
  const [output, setOutput] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [mode, setMode] = useState<"puzzle"|"sandbox">("puzzle");
  const pidRef = useRef(0);

  const puzzle = PUZZLES[puzzleIdx];
  const allDecs = Object.values(DECORATORS);
  const MAX = 3;

  const compute = useCallback((stack: DecDef[]) => {
    let fn: (...a: any[]) => any = puzzle.baseFn.fn;
    stack.forEach(d => { fn = d.fn(fn); });
    try { return fn(puzzle.inputArg); } catch(e: any) { return `Error: ${e.message}`; }
  }, [puzzle]);

  const spawnParticle = useCallback((color: string) => {
    const id = pidRef.current++;
    const x = 80 + Math.random() * 80; const y = 80 + Math.random() * 80;
    setParticles(p => [...p, {id, x, y, color}]);
    AudioEngine.playParticle();
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 800);
  }, []);

  const applyDec = useCallback((dec: DecDef) => {
    if (applied.length >= MAX || applied.find(d => d.id === dec.id)) return;
    const stack = [...applied, dec];
    setApplied(stack);
    const out = compute(stack);
    setOutput(out);
    AudioEngine.playRingApply(applied.length);
    spawnParticle(dec.color);
    if (mode === "puzzle") {
      const norm = (s: string) => s?.replace(/\s+/g, " ").trim();
      if (norm(out) === norm(puzzle.targetOutput)) {
        setSolved(true);
        setTotalXP(x => x + puzzle.xpReward);
        gainXP(puzzle.xpReward);
        AudioEngine.playVictory();
        for (let i = 0; i < 8; i++) setTimeout(() => spawnParticle(dec.color), i * 80);
      }
    }
  }, [applied, compute, mode, puzzle, spawnParticle, gainXP]);

  const reset = useCallback(() => {
    setApplied([]); setOutput(null); setSolved(false);
    AudioEngine.playReset();
  }, []);

  const next = useCallback(() => {
    if (puzzleIdx < PUZZLES.length - 1) { setPuzzleIdx(i => i + 1); reset(); }
    else { setPuzzleIdx(0); reset(); }
  }, [puzzleIdx, reset]);

  const rings = [0,1,2].map(i => applied[i] || null);

  const codePreview = [...applied].reverse().map(d => d.shortCode).join("\n") + `\ndef ${puzzle.baseFn.name}(n):\n    return f"Hola, {"{n}"}"`;

  return (
    <div style={{ background:"#080810", minHeight:"100vh", fontFamily:"'JetBrains Mono','Fira Code',monospace", color:"#e0e0ff", position:"relative", overflow:"hidden" }}>
      {/* Grid bg */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(127,119,221,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(127,119,221,0.04) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }} />
      
      <Navbar />

      <main style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px", position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:11, color:"#7f77dd", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>Minijuego 3 · Decorator Forge</div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:"#fff" }}>El Taller de Encantamientos ⚡</h1>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em" }}>XP Total</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#7f77dd" }}>{totalXP}</div>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {(["puzzle","sandbox"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); reset(); }}
              style={{ padding:"6px 20px", borderRadius:20, border:`1px solid ${mode===m?"#7f77dd":"#222"}`, background:mode===m?"rgba(127,119,221,0.15)":"transparent", color:mode===m?"#c0b8ff":"#555", cursor:"pointer", fontSize:11, fontFamily:"inherit", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:mode===m?600:400 }}>
              {m==="puzzle"?"🧩 Puzzle":"🔬 Sandbox"}
            </button>
          ))}
          {/* Puzzle selector */}
          {mode === "puzzle" && (
            <div style={{ display:"flex", gap:6, marginLeft:"auto", alignItems:"center" }}>
              {PUZZLES.map((p, i) => (
                <button key={p.id} onClick={() => { setPuzzleIdx(i); reset(); }}
                  style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${i===puzzleIdx?"#7f77dd":"#222"}`, background:i===puzzleIdx?"rgba(127,119,221,0.2)":"transparent", color:i===puzzleIdx?"#c0b8ff":"#444", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                  {i+1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
          
          {/* LEFT: Arena */}
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #1a1a2e", borderRadius:16, padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
            
            {/* Puzzle card */}
            {mode === "puzzle" && (
              <div style={{ width:"100%", background:"rgba(127,119,221,0.08)", border:"1px solid rgba(127,119,221,0.25)", borderRadius:10, padding:"12px 16px" }}>
                <div style={{ fontSize:10, color:"#7f77dd", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{puzzle.difficulty} · {puzzle.xpReward} XP · Puzzle {puzzleIdx+1}/{PUZZLES.length}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:8 }}>{puzzle.title}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ background:"#0d0d1a", borderRadius:6, padding:"8px 10px" }}>
                    <div style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Input</div>
                    <code style={{ fontSize:12, color:"#e0e0ff" }}>"{puzzle.inputArg}"</code>
                  </div>
                  <div style={{ background:"#0d0d1a", borderRadius:6, padding:"8px 10px", border:"1px solid rgba(0,212,160,0.2)" }}>
                    <div style={{ fontSize:9, color:"#00d4a0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Objetivo</div>
                    <code style={{ fontSize:10, color:"#00d4a0", wordBreak:"break-all" }}>"{puzzle.targetOutput}"</code>
                  </div>
                </div>
              </div>
            )}

            {/* Ring system */}
            <div style={{ position:"relative", width:240, height:240, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {rings.map((dec, i) => <Ring key={i} idx={i} dec={dec} active={!!dec} />)}
              
              {/* Core */}
              <motion.div
                animate={solved ? { scale:[1,1.1,1], boxShadow:["0 0 0px #7f77dd","0 0 30px #7f77dd","0 0 10px #7f77dd"] } : {}}
                transition={{ duration:0.6, repeat:solved?2:0 }}
                style={{ width:76, height:76, borderRadius:"50%", background:"#0d0d1a", border:`2px solid ${solved?"#00d4a0":"#2a2a4a"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:10, boxShadow:solved?"0 0 20px rgba(0,212,160,0.4)":"none", transition:"border-color 0.3s" }}
              >
                <div style={{ fontSize:9, color:"#555", textTransform:"uppercase" }}>fn</div>
                <div style={{ fontSize:13, color:"#c0b8ff", fontWeight:600 }}>{puzzle.baseFn.name}</div>
                <div style={{ fontSize:8, color:"#333" }}>( )</div>
              </motion.div>

              {/* Particles */}
              {particles.map(p => (
                <motion.div key={p.id}
                  initial={{ x:p.x, y:p.y, opacity:0.9, scale:1 }}
                  animate={{ y:p.y-40, opacity:0, scale:0.3 }}
                  transition={{ duration:0.7, ease:"easeOut" }}
                  style={{ position:"absolute", width:6, height:6, borderRadius:"50%", background:p.color, pointerEvents:"none", zIndex:20, boxShadow:`0 0 8px ${p.color}` }}
                />
              ))}
            </div>

            {/* Output display */}
            <div style={{ width:"100%", background:"#0d0d1a", border:`1px solid ${solved?"rgba(0,212,160,0.4)":output?"rgba(127,119,221,0.3)":"#1a1a2e"}`, borderRadius:10, padding:"12px 16px", transition:"border-color 0.3s" }}>
              <div style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Output en tiempo real</div>
              <motion.code key={output} initial={{ opacity:0.5 }} animate={{ opacity:1 }}
                style={{ fontSize:13, color:solved?"#00d4a0":output?"#c0b8ff":"#333", wordBreak:"break-all", lineHeight:1.5 }}>
                {output ? `"${output}"` : "— aplica un decorador —"}
              </motion.code>
              <AnimatePresence>
                {solved && (
                  <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    style={{ marginTop:10, padding:"6px 12px", background:"rgba(0,212,160,0.1)", border:"1px solid rgba(0,212,160,0.3)", borderRadius:6, fontSize:11, color:"#00d4a0", fontFamily:"sans-serif" }}>
                    ✓ ¡Puzzle resuelto! +{puzzle.xpReward} XP — {puzzle.concept}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Code preview */}
            <div style={{ width:"100%", cursor:"pointer" }} onClick={() => setShowCode(!showCode)}>
              <div style={{ fontSize:9, color:"#444", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                Código generado <span style={{ color:"#333" }}>{showCode?"▲":"▼"}</span>
              </div>
              <AnimatePresence>
                {showCode && (
                  <motion.pre initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                    style={{ margin:0, background:"#060610", border:"1px solid #1a1a2e", borderRadius:8, padding:"12px 14px", fontSize:11, color:"#7f77dd", lineHeight:1.7, overflow:"hidden" }}>
                    {codePreview}
                  </motion.pre>
                )}
              </AnimatePresence>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:8, width:"100%" }}>
              <button onClick={reset}
                style={{ flex:1, padding:"9px 0", background:"transparent", border:"1px solid #2a2a3a", borderRadius:8, color:"#666", cursor:"pointer", fontSize:11, fontFamily:"inherit", letterSpacing:"0.06em" }}>
                ↺ Reiniciar Forge
              </button>
              {solved && (
                <button onClick={next}
                  style={{ flex:2, padding:"9px 0", background:"rgba(0,212,160,0.15)", border:"1px solid rgba(0,212,160,0.4)", borderRadius:8, color:"#00d4a0", cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:600, letterSpacing:"0.06em" }}>
                  {puzzleIdx < PUZZLES.length-1 ? "Siguiente Puzzle →" : "¡Reiniciar! 🔄"}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Runes */}
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #1a1a2e", borderRadius:16, padding:16 }}>
              <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Runas disponibles</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {allDecs.map(dec => {
                  const isApplied = applied.some(d => d.id === dec.id);
                  const isFull = applied.length >= MAX;
                  const disabled = isApplied || (isFull && !isApplied);
                  return (
                    <motion.button key={dec.id} onClick={() => !disabled && applyDec(dec)}
                      whileHover={!disabled?{scale:1.02}:{}} whileTap={!disabled?{scale:0.97}:{}}
                      style={{ width:"100%", padding:"9px 12px", background:isApplied?dec.ringColor:"transparent", border:`1px solid ${isApplied?dec.borderColor:"#222"}`, borderRadius:8, cursor:disabled?"not-allowed":"pointer", textAlign:"left", opacity:disabled?0.35:1, transition:"all 0.2s", display:"flex", alignItems:"flex-start", gap:10 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:dec.color, flexShrink:0, marginTop:3, boxShadow:`0 0 6px ${dec.color}` }} />
                      <div>
                        <div style={{ fontSize:11, color:isApplied?dec.color:"#ccc", fontWeight:600, fontFamily:"monospace" }}>{dec.shortCode}</div>
                        <div style={{ fontSize:10, color:"#444", marginTop:2, fontFamily:"sans-serif", lineHeight:1.4 }}>{dec.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Active stack */}
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #1a1a2e", borderRadius:16, padding:16 }}>
              <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Stack activo</div>
              <div style={{ fontFamily:"monospace", fontSize:11, lineHeight:2, color:"#555" }}>
                {[0,1,2].map(i => {
                  const dec = applied[i];
                  return (
                    <motion.div key={i} animate={dec?{color:dec.color}:{color:"#2a2a3a"}} style={{ paddingLeft:i*6 }}>
                      {dec ? dec.shortCode : "@???"}
                    </motion.div>
                  );
                })}
                <div style={{ color:"#444", marginTop:2 }}>def {puzzle.baseFn.name}(n):</div>
                <div style={{ color:"#333", paddingLeft:12 }}>return f"..."</div>
              </div>
            </div>

            {/* Hint */}
            {mode === "puzzle" && (
              <div style={{ background:"rgba(127,119,221,0.06)", border:"1px solid rgba(127,119,221,0.2)", borderRadius:16, padding:16 }}>
                <div style={{ fontSize:10, color:"#7f77dd", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>💡 Pista</div>
                <div style={{ fontSize:11, color:"#666", fontFamily:"sans-serif", lineHeight:1.6 }}>{puzzle.hint}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
