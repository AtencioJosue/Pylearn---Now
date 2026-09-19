import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Code2,
  Eye,
  Lightbulb,
  PlayCircle,
  Rocket,
  Sparkles,
  TriangleAlert,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import {
  getTheoryLesson,
  type TheoryLessonContext,
} from "@/features/learning/theoryLessons";

interface IntroSlidesProps extends TheoryLessonContext {
  onClose: () => void;
  onStart: () => void;
}

interface SlideMeta {
  short: string;
  title: string;
  Icon: LucideIcon;
}

const SLIDES: SlideMeta[] = [
  { short: "Idea", title: "Primero, una imagen", Icon: Lightbulb },
  { short: "Ejemplo", title: "Mira cómo cambia", Icon: PlayCircle },
  { short: "Compara", title: "Un detalle importa", Icon: TriangleAlert },
  { short: "Reto", title: "¿Qué pasará?", Icon: CircleHelp },
  { short: "Practica", title: "Ahora te toca", Icon: Rocket },
];

const FLOW_EMOJIS = ["👀", "⚙️", "✨"];

function firstSentence(text: string) {
  return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}

function SlideHeading({ slide }: { slide: SlideMeta }) {
  const Icon = slide.Icon;
  return (
    <header className="mb-5 text-center md:mb-7">
      <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
        <Icon className="h-4 w-4" />
        {slide.short}
      </div>
      <h2 className="font-display text-3xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
        {slide.title}
      </h2>
    </header>
  );
}

export function IntroSlides({
  topic,
  exerciseTitle,
  description,
  question,
  explanation,
  hint,
  onClose,
  onStart,
}: IntroSlidesProps) {
  const lesson = useMemo(
    () =>
      getTheoryLesson({
        topic,
        exerciseTitle,
        description,
        question,
        explanation,
        hint,
      }),
    [topic, exerciseTitle, description, question, explanation, hint],
  );
  const [current, setCurrent] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [traceStep, setTraceStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const visualAnalogy = firstSentence(lesson.analogy);

  const lastTraceStep = Math.max(lesson.trace.length - 1, 0);
  const isLastSlide = current === SLIDES.length - 1;
  const quizCorrect = selectedAnswer === lesson.quiz.answer;
  const quizNeedsAnswer = current === 3 && !quizCorrect;
  const percent = ((current + 1) / SLIDES.length) * 100;

  useEffect(() => {
    setCurrent(0);
    setFurthest(0);
    setTraceStep(0);
    setSelectedAnswer(null);
  }, [topic]);

  const openSlide = useCallback((slide: number) => {
    setCurrent(slide);
    setFurthest((reached) => Math.max(reached, slide));
  }, []);

  const goNext = useCallback(() => {
    if (current === 1 && traceStep < lastTraceStep) {
      setTraceStep((step) => step + 1);
      return;
    }
    if (quizNeedsAnswer) return;
    if (isLastSlide) {
      onStart();
      return;
    }
    openSlide(current + 1);
  }, [
    current,
    isLastSlide,
    lastTraceStep,
    onStart,
    openSlide,
    quizNeedsAnswer,
    traceStep,
  ]);

  const goBack = useCallback(() => {
    if (current === 1 && traceStep > 0) {
      setTraceStep((step) => step - 1);
      return;
    }
    setCurrent((slide) => Math.max(0, slide - 1));
  }, [current, traceStep]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goBack();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goBack, goNext, onClose]);

  const renderContent = () => {
    if (current === 0) {
      return (
        <div>
          <SlideHeading slide={SLIDES[current]} />
          <div className="grid items-center gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6 text-center dark:border-amber-900/60 dark:from-amber-950/35 dark:via-orange-950/20 dark:to-slate-900 md:p-8">
              <motion.div
                animate={{ y: [0, -7, 0], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl md:text-8xl"
                aria-hidden="true"
              >
                {lesson.emoji}
              </motion.div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
                {lesson.analogyTitle}
              </p>
              <p className="mx-auto mt-3 max-w-md text-base font-bold leading-relaxed text-slate-700 dark:text-slate-200 md:text-lg">
                {visualAnalogy}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-950/45 md:p-7">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                {lesson.recap.slice(0, 3).map((item, index) => (
                  <div key={item} className="contents">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.14 }}
                      className="flex min-h-28 flex-1 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white p-4 text-center shadow-md shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20"
                    >
                      <span className="text-3xl" aria-hidden="true">
                        {FLOW_EMOJIS[index]}
                      </span>
                      <span className="mt-2 text-sm font-black text-slate-800 dark:text-white">
                        {item}
                      </span>
                    </motion.div>
                    {index < Math.min(lesson.recap.length, 3) - 1 && (
                      <ArrowRight className="mx-auto h-5 w-5 shrink-0 rotate-90 text-primary sm:rotate-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-sky-100 px-4 py-3 text-center text-sm font-black text-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
                <Eye className="h-5 w-5 shrink-0" />
                Entiende el recorrido; no memorices la respuesta.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (current === 1) {
      const activeTrace =
        lesson.trace[traceStep] ?? lesson.trace[0] ?? "Observa el cambio.";
      const traceFinished = traceStep === lastTraceStep;
      return (
        <div>
          <SlideHeading slide={SLIDES[current]} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
            <CodeBlock code={lesson.code} />
            <div className="flex flex-col rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                  Paso {traceStep + 1}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {traceStep + 1}/{lesson.trace.length}
                </span>
              </div>
              <div className="my-5 flex gap-2" aria-hidden="true">
                {lesson.trace.map((_, index) => (
                  <motion.span
                    key={index}
                    animate={{
                      backgroundColor:
                        index <= traceStep ? "hsl(var(--primary))" : "#cbd5e1",
                      scale: index === traceStep ? 1.12 : 1,
                    }}
                    className="h-2.5 flex-1 rounded-full"
                  />
                ))}
              </div>
              <motion.div
                key={traceStep}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 items-center justify-center rounded-2xl border-2 border-primary/20 bg-white p-6 text-center dark:bg-slate-900"
                aria-live="polite"
              >
                <p className="text-lg font-black leading-relaxed text-slate-800 dark:text-white">
                  {activeTrace}
                </p>
              </motion.div>
              {traceFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-950/40"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                    Resultado
                  </p>
                  <code className="mt-1 block whitespace-pre-wrap font-mono text-base font-black text-emerald-800 dark:text-emerald-100">
                    {lesson.output}
                  </code>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (current === 2) {
      return (
        <div>
          <SlideHeading slide={SLIDES[current]} />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border-2 border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
              <h3 className="mb-3 flex items-center justify-center gap-2 font-black text-rose-700 dark:text-rose-300">
                <XCircle className="h-5 w-5" /> Así no
              </h3>
              <CodeBlock code={lesson.mistake} />
            </div>
            <div className="rounded-[2rem] border-2 border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <h3 className="mb-3 flex items-center justify-center gap-2 font-black text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" /> Así sí
              </h3>
              <CodeBlock code={lesson.correction} />
            </div>
          </div>
          <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-100">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
            <p className="font-bold leading-relaxed">{lesson.why}</p>
          </div>
        </div>
      );
    }

    if (current === 3) {
      return (
        <div>
          <SlideHeading slide={SLIDES[current]} />
          <div className="mx-auto max-w-3xl rounded-[2rem] border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 dark:border-violet-900/60 dark:from-violet-950/35 dark:to-fuchsia-950/20 md:p-7">
            <p className="text-center text-xl font-black leading-relaxed text-slate-900 dark:text-white md:text-2xl">
              {lesson.quiz.prompt}
            </p>
            <div className="mt-6 grid gap-3">
              {lesson.quiz.options.map((option, index) => {
                const selected = selectedAnswer === index;
                const correct = selected && index === lesson.quiz.answer;
                const incorrect = selected && index !== lesson.quiz.answer;
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswer(index)}
                    aria-pressed={selected}
                    className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left font-bold transition-all hover:-translate-y-0.5 dark:bg-slate-900 ${
                      correct
                        ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : incorrect
                          ? "border-rose-400 text-rose-700 dark:text-rose-300"
                          : "border-slate-200 text-slate-700 hover:border-primary/50 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm dark:bg-slate-800">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {correct && <CheckCircle2 className="h-5 w-5" />}
                    {incorrect && <XCircle className="h-5 w-5" />}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedAnswer !== null && (
            <motion.div
              key={selectedAnswer}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-auto mt-4 max-w-3xl rounded-2xl border p-4 text-center font-bold ${
                quizCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100"
                  : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100"
              }`}
            >
              {quizCorrect
                ? `✓ ${lesson.quiz.explanation}`
                : "Casi. Mira el ejemplo y prueba otra opción."}
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <div>
        <SlideHeading slide={SLIDES[current]} />
        <div className="mx-auto max-w-4xl rounded-[2rem] border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-white to-emerald-50 p-6 text-center dark:via-slate-900 dark:to-emerald-950/25 md:p-9">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-primary text-white shadow-xl shadow-primary/25"
          >
            <Code2 className="h-10 w-10" />
          </motion.div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-primary">
            Mini misión
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-xl font-black leading-relaxed text-slate-800 dark:text-white md:text-2xl">
            {lesson.challenge}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {lesson.recap.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-3 py-1.5 text-sm font-bold text-primary dark:bg-slate-900"
              >
                <Check className="h-3.5 w-3.5" /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const nextLabel = isLastSlide
    ? "Ir al ejercicio"
    : current === 1 && traceStep < lastTraceStep
      ? "Ver siguiente cambio"
      : quizNeedsAnswer
        ? "Elige la respuesta"
        : "Siguiente";

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Teoría de ${topic}`}
    >
      <div className="pointer-events-none absolute -left-28 top-28 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <header className="relative z-10 shrink-0 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Cerrar teoría"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-2xl" aria-hidden="true">
            {lesson.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <span className="truncate">{lesson.title}</span>
              <span className="shrink-0">
                {current + 1}/{SLIDES.length}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-primary to-emerald-500"
                animate={{ width: `${percent}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
              />
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="Diapositivas de teoría"
        className="relative z-10 shrink-0 border-b border-slate-200/70 bg-white/60 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60"
      >
        <div className="mx-auto flex max-w-3xl justify-center gap-1.5 sm:gap-3">
          {SLIDES.map((slide, index) => {
            const Icon = slide.Icon;
            const reached = index <= furthest;
            return (
              <button
                key={slide.short}
                disabled={!reached}
                onClick={() => reached && setCurrent(index)}
                className={`flex min-w-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-black transition-all sm:px-3 ${
                  index === current
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : reached
                      ? "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                      : "text-slate-300 dark:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{slide.short}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="relative z-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 md:px-6 md:py-7">
        <motion.section
          key={current}
          initial={{ opacity: 0, x: 24, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 md:p-8"
        >
          {renderContent()}
        </motion.section>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            onClick={goBack}
            disabled={current === 0 && traceStep === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-200 px-4 font-black text-slate-600 disabled:invisible dark:border-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Atrás</span>
          </button>
          <p className="hidden text-xs font-bold text-slate-400 md:block">
            Usa ← → para avanzar
          </p>
          <button
            onClick={goNext}
            disabled={quizNeedsAnswer}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-black text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0 dark:disabled:bg-slate-700"
          >
            {nextLabel}
            {isLastSlide ? (
              <ArrowRight className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
