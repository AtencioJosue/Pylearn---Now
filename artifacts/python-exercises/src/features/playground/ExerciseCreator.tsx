import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}/api${path}`;

async function apiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) return body.error;
  } catch {
    // The fallback below is clearer than an invalid response body.
  }
  return fallback;
}

function readableError(error: unknown, fallback: string) {
  if (error instanceof TypeError && /fetch/i.test(error.message))
    return fallback;
  return error instanceof Error && error.message ? error.message : fallback;
}

const TOPICS = [
  "Variables",
  "Strings",
  "Listas",
  "Bucles",
  "Funciones",
  "Diccionarios",
  "Intermedio",
  "Difícil",
];
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

export function ExerciseCreator() {
  const { user, unlockAchievement, refreshUser } = useUser();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Variables");
  const [type, setType] = useState("fill_blank");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    exercise: CreatedExercise;
    validation: { approved: boolean; score: number; feedback: string };
  } | null>(null);
  const [myExercises, setMyExercises] = useState<CreatedExercise[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const loadMyExercises = useCallback(async () => {
    if (!user) return;
    setLoadingList(true);
    setListError("");
    try {
      const res = await fetch(api(`/created-exercises?user_id=${user.id}`));
      if (!res.ok)
        throw new Error(
          await apiError(res, "No se pudieron cargar tus ejercicios."),
        );
      const data: unknown = await res.json();
      if (!Array.isArray(data))
        throw new Error("El servidor devolvió una respuesta no válida.");
      setMyExercises(data as CreatedExercise[]);
    } catch (error) {
      setListError(
        readableError(
          error,
          "No pudimos conectar con el servidor para cargar tus ejercicios.",
        ),
      );
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  useEffect(() => {
    void loadMyExercises();
  }, [loadMyExercises]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setResult(null);
    setSubmitError("");
    try {
      const res = await fetch(api("/created-exercises"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          author_name: user.name,
          title,
          topic,
          type,
          question,
          correct_answer: answer,
          hint,
          explanation,
        }),
      });
      if (!res.ok)
        throw new Error(
          await apiError(res, "No se pudo revisar el ejercicio."),
        );
      const data = (await res.json()) as {
        exercise?: CreatedExercise;
        validation?: { approved: boolean; score: number; feedback: string };
      };
      if (!data.exercise || !data.validation)
        throw new Error("El servidor devolvió una respuesta no válida.");
      const completed = {
        exercise: data.exercise,
        validation: data.validation,
      };
      setResult(completed);
      if (data.validation?.approved) {
        const approved =
          myExercises.filter((e) => e.status === "approved").length + 1;
        const achievements = [
          approved >= 1 && "builder_1",
          approved >= 3 && "builder_3",
          approved >= 7 && "builder_7",
          approved >= 15 && "builder_15",
        ].filter((key): key is string => Boolean(key));
        await Promise.allSettled(
          achievements.map((key) => unlockAchievement(key)),
        );
        await refreshUser();
        setTitle("");
        setQuestion("");
        setAnswer("");
        setHint("");
        setExplanation("");
      }
      await loadMyExercises();
    } catch (error) {
      setResult(null);
      setSubmitError(
        readableError(
          error,
          "No pudimos enviar el ejercicio. Comprueba el servidor e inténtalo otra vez.",
        ),
      );
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
      <div className="pylearn-card p-6 rounded-2xl border-[var(--linea-conexion)]">
        <h2 className="font-display font-bold text-xl mb-1 flex items-center gap-2 text-[var(--texto-principal)]">
          <Plus className="w-5 h-5 text-primary dark:text-[#1CB0F6]" />
          Proponer nuevo ejercicio
        </h2>
        <p className="text-sm text-[var(--texto-principal)] opacity-70 mb-5">
          La IA revisará si es técnicamente correcto, educativo y original antes
          de aprobarlo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-medium text-sm transition-all"
              placeholder="Nombre descriptivo del ejercicio"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
                Tema
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-medium text-sm transition-all"
              >
                {TOPICS.map((t) => (
                  <option
                    key={t}
                    className="bg-[var(--bg-tarjetas)] text-[var(--texto-principal)]"
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-medium text-sm transition-all"
              >
                {TYPES.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}
                    className="bg-[var(--bg-tarjetas)] text-[var(--texto-principal)]"
                  >
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
              Pregunta / Código
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-mono text-sm resize-none transition-all"
              placeholder={
                type === "fill_blank"
                  ? "Código con ___ donde va la respuesta..."
                  : "Código que el alumno debe analizar..."
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
              Respuesta correcta
            </label>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none font-mono text-sm transition-all"
              placeholder="Lo que el alumno debe responder exactamente"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
              Pista (opcional)
            </label>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none text-sm transition-all"
              placeholder="Una pista para si el alumno se bloquea..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1 block">
              Explicación (opcional)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-[var(--bg-general)] text-[var(--texto-principal)] border-[var(--linea-conexion)] focus:border-primary outline-none text-sm resize-none transition-all"
              placeholder="Por qué esa es la respuesta correcta..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 border-b-4 border-blue-600 hover:translate-y-[-1px] active:translate-y-[2px] transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analizando con
                IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Enviar para revisión
              </>
            )}
          </button>
        </form>

        {submitError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-[var(--texto-principal)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <span>{submitError}</span>
          </div>
        )}

        {result && (
          <div
            className={cn(
              "mt-4 p-4 rounded-2xl border-2",
              result.validation.approved
                ? "border-green-500/30 bg-green-500/10 text-[var(--texto-principal)]"
                : "border-red-500/30 bg-red-500/10 text-[var(--texto-principal)]",
            )}
          >
            <p
              className={cn(
                "font-bold text-lg mb-1",
                result.validation.approved ? "text-green-500" : "text-red-500",
              )}
            >
              {result.validation.approved
                ? "✅ ¡Ejercicio aprobado!"
                : "❌ No aprobado"}
            </p>
            <p className="text-sm text-[var(--texto-principal)] leading-relaxed">
              {result.validation.feedback}
            </p>
            {result.validation.approved && (
              <p className="text-xs text-green-500 font-bold mt-2">
                Puntaje de calidad: {result.validation.score}/100
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mis ejercicios */}
      <div className="pylearn-card p-6 rounded-2xl border-[var(--linea-conexion)]">
        <h2 className="font-display font-bold text-xl mb-1 flex items-center gap-2 text-[var(--texto-principal)]">
          <BookOpen className="w-5 h-5 text-primary dark:text-[#1CB0F6]" />
          Mis ejercicios enviados
        </h2>
        <p className="text-sm text-[var(--texto-principal)] opacity-70 mb-5">
          {user.exercisesCreated} ejercicio
          {user.exercisesCreated !== 1 ? "s" : ""} aprobado
          {user.exercisesCreated !== 1 ? "s" : ""} de {myExercises.length}{" "}
          enviado{myExercises.length !== 1 ? "s" : ""}.
        </p>

        {listError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-[var(--texto-principal)]"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>{listError}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadMyExercises()}
              className="mt-2 inline-flex items-center gap-1.5 font-bold"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        )}

        {loadingList ? (
          <div className="text-center py-8 text-[var(--texto-principal)] opacity-60 text-sm">
            Cargando...
          </div>
        ) : myExercises.length === 0 && !listError ? (
          <div className="text-center py-12 text-[var(--texto-principal)] opacity-50">
            <Plus className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Aún no has enviado ejercicios.</p>
            <p className="text-xs mt-1">
              ¡Crea tu primero y gana el logro "Junior Creator"!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {myExercises.map((ex) => (
              <div
                key={ex.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  ex.status === "approved"
                    ? "border-green-500/20 bg-green-500/5 text-[var(--texto-principal)]"
                    : "border-red-500/20 bg-red-500/5 text-[var(--texto-principal)]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-[var(--texto-principal)]">
                      {ex.title}
                    </p>
                    <p className="text-xs text-[var(--texto-principal)] opacity-60 mt-0.5">
                      {ex.topic} · {ex.type}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0",
                      ex.status === "approved"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-red-500/20 text-red-600 dark:text-red-400",
                    )}
                  >
                    {ex.status === "approved" ? "✓ Aprobado" : "✗ Rechazado"}
                  </span>
                </div>
                {ex.ai_feedback && (
                  <p className="text-xs text-[var(--texto-principal)] opacity-60 mt-2 leading-relaxed">
                    {ex.ai_feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
