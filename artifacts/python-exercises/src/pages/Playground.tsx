import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Navbar } from "@/components/Navbar";
import { Play, RotateCcw, Loader2, Terminal, Trash2, Copy, Check, Plus, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (config: { batched: (output: string) => void }) => void;
  setStderr: (config: { batched: (output: string) => void }) => void;
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

const INITIAL_CODE = `# ¡Bienvenido al editor libre de Python!
# Aquí puedes escribir y ejecutar cualquier código Python.

# Ejemplo: variables y operaciones básicas
nombre = "Mundo"
print(f"¡Hola, {nombre}!")

# Ejemplo: lista y bucle
numeros = [1, 2, 3, 4, 5]
suma = sum(numeros)
print(f"La suma de {numeros} es {suma}")

# Ejemplo: función
def cuadrado(x):
    return x ** 2

for n in range(1, 6):
    print(f"{n}² = {cuadrado(n)}")
`;

type OutputLine = { type: "stdout" | "stderr" | "info" | "error"; text: string };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}/api${path}`;

const TOPICS = ["Variables", "Strings", "Listas", "Bucles", "Funciones", "Diccionarios", "Intermedio", "Difícil"];
const TYPES = [
  { value: "fill_blank", label: "Completar código (fill_blank)" },
  { value: "predict_output", label: "Predecir salida (predict_output)" },
  { value: "multiple_choice", label: "Opción múltiple (multiple_choice)" },
];

interface CreatedExercise {
  id: number;
  title: string;
  topic: string;
  type: string;
  status: string;
  ai_feedback: string;
  created_at: string;
}

function ExerciseCreator() {
  const { user, unlockAchievement, refreshUser } = useUser();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Variables");
  const [type, setType] = useState("fill_blank");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ exercise: CreatedExercise; validation: { approved: boolean; score: number; feedback: string } } | null>(null);
  const [myExercises, setMyExercises] = useState<CreatedExercise[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadMyExercises = useCallback(async () => {
    if (!user) return;
    setLoadingList(true);
    const res = await fetch(api(`/created-exercises?user_id=${user.id}`));
    if (res.ok) setMyExercises(await res.json());
    setLoadingList(false);
  }, [user]);

  useEffect(() => { loadMyExercises(); }, [loadMyExercises]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(api("/created-exercises"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          author_name: user.name,
          title, topic, type, question,
          correct_answer: answer,
          hint, explanation,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.validation?.approved) {
        await refreshUser();
        const approved = (myExercises.filter(e => e.status === "approved").length) + 1;
        if (approved >= 1) unlockAchievement("builder_1");
        if (approved >= 3) unlockAchievement("builder_3");
        if (approved >= 7) unlockAchievement("builder_7");
        if (approved >= 15) unlockAchievement("builder_15");
        setTitle(""); setQuestion(""); setAnswer(""); setHint(""); setExplanation("");
      }
      loadMyExercises();
    } catch {
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-bold">Regístrate para crear ejercicios</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="font-display font-bold text-xl mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Proponer nuevo ejercicio
        </h2>
        <p className="text-sm text-muted-foreground mb-5">La IA revisará si es técnicamente correcto, educativo y original antes de aprobarlo.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-medium text-sm transition-colors"
              placeholder="Nombre descriptivo del ejercicio" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Tema</label>
              <select value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-medium text-sm bg-white transition-colors">
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-medium text-sm bg-white transition-colors">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Pregunta / Código</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} required rows={6}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-mono text-sm resize-none transition-colors"
              placeholder={type === "fill_blank" ? "Código con ___ donde va la respuesta..." : "Código que el alumno debe analizar..."} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Respuesta correcta</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none font-mono text-sm transition-colors"
              placeholder="Lo que el alumno debe responder exactamente" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Pista (opcional)</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm transition-colors"
              placeholder="Una pista para si el alumno se bloquea..." />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Explicación (opcional)</label>
            <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm resize-none transition-colors"
              placeholder="Por qué esa es la respuesta correcta..." />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analizando con IA...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Enviar para revisión</>
            )}
          </button>
        </form>

        {result && (
          <div className={cn(
            "mt-4 p-4 rounded-2xl border-2",
            result.validation.approved ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          )}>
            <p className={cn("font-bold text-lg mb-1", result.validation.approved ? "text-green-700" : "text-red-700")}>
              {result.validation.approved ? "✅ ¡Ejercicio aprobado!" : "❌ No aprobado"}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{result.validation.feedback}</p>
            {result.validation.approved && (
              <p className="text-xs text-green-600 font-bold mt-2">
                Puntaje de calidad: {result.validation.score}/100
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mis ejercicios */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="font-display font-bold text-xl mb-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Mis ejercicios enviados
        </h2>
        <p className="text-sm text-muted-foreground mb-5">{user.exercisesCreated} ejercicio{user.exercisesCreated !== 1 ? "s" : ""} aprobado{user.exercisesCreated !== 1 ? "s" : ""} de {myExercises.length} enviado{myExercises.length !== 1 ? "s" : ""}.</p>

        {loadingList ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
        ) : myExercises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Plus className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Aún no has enviado ejercicios.</p>
            <p className="text-xs mt-1">¡Crea tu primero y gana el logro "Junior Creator"!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {myExercises.map(ex => (
              <div key={ex.id} className={cn(
                "p-3 rounded-xl border-2 transition-all",
                ex.status === "approved" ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50/50"
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{ex.title}</p>
                    <p className="text-xs text-muted-foreground">{ex.topic} · {ex.type}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0",
                    ex.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {ex.status === "approved" ? "✓ Aprobado" : "✗ Rechazado"}
                  </span>
                </div>
                {ex.ai_feedback && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ex.ai_feedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Playground() {
  const [activeTab, setActiveTab] = useState<"editor" | "creator">("editor");
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Load Pyodide from CDN once on mount
  useEffect(() => {
    if (document.querySelector('script[data-pyodide]')) return;

    const script = document.createElement("script");
    script.src = `${PYODIDE_CDN}pyodide.js`;
    script.dataset.pyodide = "true";
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
        pyodideRef.current = pyodide;
        setPyodideReady(true);
        setLoading(false);
        appendOutput({ type: "info", text: "✓ Python listo. ¡Presiona Ejecutar o Ctrl+Enter para correr tu código!" });
      } catch {
        setLoading(false);
        appendOutput({ type: "error", text: "✗ Error al cargar Python. Recarga la página." });
      }
    };
    script.onerror = () => {
      setLoading(false);
      appendOutput({ type: "error", text: "✗ No se pudo cargar Python. Verifica tu conexión a internet." });
    };
    document.head.appendChild(script);
  }, []);

  const appendOutput = useCallback((line: OutputLine) => {
    setOutput(prev => [...prev, line]);
  }, []);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const runCode = useCallback(async () => {
    if (!pyodideRef.current || running) return;
    setRunning(true);
    setOutput([]);

    const pyodide = pyodideRef.current;

    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];

    pyodide.setStdout({
      batched: (text: string) => {
        stdoutLines.push(text);
      }
    });

    pyodide.setStderr({
      batched: (text: string) => {
        stderrLines.push(text);
      }
    });

    try {
      await pyodide.runPythonAsync(code);

      // Flush stdout
      if (stdoutLines.length > 0) {
        for (const line of stdoutLines) {
          setOutput(prev => [...prev, { type: "stdout", text: line }]);
        }
      }
      if (stderrLines.length > 0) {
        for (const line of stderrLines) {
          setOutput(prev => [...prev, { type: "stderr", text: line }]);
        }
      }
      if (stdoutLines.length === 0 && stderrLines.length === 0) {
        setOutput([{ type: "info", text: "Código ejecutado (sin salida)" }]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(prev => [...prev, { type: "error", text: msg }]);
    } finally {
      setRunning(false);
    }
  }, [code, running]);

  // Keyboard shortcut: Ctrl+Enter to run
  const handleEditorMount: OnMount = (_editor, monaco) => {
    monaco.editor.addEditorAction({
      id: "run-python",
      label: "Ejecutar Python",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        runCode();
      }
    });
  };

  const clearOutput = () => setOutput([]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode(INITIAL_CODE);
    setOutput([]);
  };

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-full px-4 sm:px-6 lg:px-8 py-6 gap-4">

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("editor")}
            className={cn(
              "px-5 py-2 rounded-xl font-bold text-sm transition-all",
              activeTab === "editor" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Play className="w-4 h-4 inline mr-1.5" />
            Editor libre
          </button>
          <button
            onClick={() => setActiveTab("creator")}
            className={cn(
              "px-5 py-2 rounded-xl font-bold text-sm transition-all",
              activeTab === "creator" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4 inline mr-1.5" />
            Crear ejercicio
          </button>
        </div>

        {activeTab === "creator" && <ExerciseCreator />}

        {activeTab === "editor" && <React.Fragment>
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Editor Libre de Python</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Escribe y ejecuta cualquier código Python directamente en tu navegador</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
            <button
              onClick={resetCode}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
            <button
              onClick={runCode}
              disabled={!pyodideReady || running}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all",
                pyodideReady && !running
                  ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {running ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ejecutando...</>
              ) : loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Cargando Python...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Ejecutar</>
              )}
            </button>
          </div>
        </div>

        {/* Atajo de teclado hint */}
        <p className="text-xs text-muted-foreground -mt-2">
          Atajo: <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Enter</kbd> para ejecutar
        </p>

        {/* Editor + Output */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0" style={{ minHeight: "500px" }}>
          {/* Editor */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-border shadow-lg bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs text-[#858585] font-mono">main.py</span>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(val) => setCode(val ?? "")}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  tabSize: 4,
                  insertSpaces: true,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Output Console */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-border shadow-lg bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
              <div className="flex items-center gap-2 text-[#8b949e]">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-mono font-bold">Consola de salida</span>
              </div>
              <button
                onClick={clearOutput}
                className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-white transition-colors"
                title="Limpiar consola"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm min-h-0">
              {output.length === 0 && !loading && (
                <p className="text-[#484f58] italic text-sm">
                  La salida de tu código aparecerá aquí...
                </p>
              )}
              {output.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "whitespace-pre-wrap break-all leading-6",
                    line.type === "stdout" && "text-[#e6edf3]",
                    line.type === "stderr" && "text-[#f85149]",
                    line.type === "error" && "text-[#f85149]",
                    line.type === "info" && "text-[#3fb950] italic text-xs",
                  )}
                >
                  {line.text}
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {[
            { title: "print()", desc: "Usa print() para ver resultados en la consola" },
            { title: "Indentación", desc: "Python usa 4 espacios para los bloques de código" },
            { title: "Comentarios", desc: "Usa # para escribir comentarios en tu código" },
          ].map(tip => (
            <div key={tip.title} className="bg-white rounded-xl p-3 border border-border">
              <span className="font-mono font-bold text-primary text-sm">{tip.title}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
            </div>
          ))}
        </div>
        </React.Fragment>}
      </div>
    </div>
  );
}
