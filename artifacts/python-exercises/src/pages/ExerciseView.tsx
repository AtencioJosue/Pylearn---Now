import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetExercise,
  getGetExerciseQueryKey,
  useGetExercises,
  useCheckAnswer,
  AnswerResult,
  getGetGamificationStatusQueryKey,
  getGetProgressQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { CodeBlock } from "@/components/CodeBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntroSlides } from "@/components/IntroSlides";
import { MascotFeedback } from "@/components/MascotFeedback";
import { FillInTheBlankExercise } from "@/components/FillInTheBlankExercise";
import { AICoachPanel } from "@/components/AICoachPanel";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  BookOpen,
  BotMessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playSuccessSound, playErrorSound } from "@/hooks/useSoundEffects";
import { useGamification } from "@/context/GamificationContext";
import { useUser } from "@/context/UserContext";
import {
  ExerciseActivity,
  hasExerciseAnswer,
} from "@/features/exercises/ExerciseActivity";
import "@/features/exercises/activity.css";

const difficultyLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Difícil",
  tryhard: "Tryhard",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
  tryhard: "bg-purple-100 text-purple-700",
};

const typePlaceholders: Record<string, string> = {
  fill_blank: "Escribe el código que falta...",
  predict_output: "Escribe lo que imprimiría el código...",
};

export function ExerciseView() {
  const [, params] = useRoute("/exercise/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const hasValidId = Number.isInteger(id) && id > 0;

  const {
    data: exercise,
    isLoading,
    isError: isExerciseError,
    error: exerciseError,
    refetch: refetchExercise,
  } = useGetExercise(id, {
    query: { enabled: hasValidId, queryKey: getGetExerciseQueryKey(id) },
  });
  const { data: allExercises } = useGetExercises();
  const checkMutation = useCheckAnswer();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [showIntro, setShowIntro] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("theory") === "1",
  );
  const [fillReady, setFillReady] = useState(false);
  const [fillAnswer, setFillAnswer] = useState("");
  const [externalFilled, setExternalFilled] = useState<(string | null)[]>([]);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [doubleOrNothing, setDoubleOrNothing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mascot status
  type MascotStatus = "idle" | "success" | "error" | "hint";
  const [mascotStatus, setMascotStatus] = useState<MascotStatus>("idle");

  const { loseLife, gainXP } = useGamification();

  // Detect fill-in-the-blank: question contains ___
  const isFillInBlank =
    exercise?.type === "fill_blank" && exercise.question?.includes("___");

  useEffect(() => {
    setSelectedAnswer("");
    setShowHint(false);
    setResult(null);
    setMascotStatus("idle");
    setFillReady(false);
    setFillAnswer("");
    setDoubleOrNothing(false);
    setSubmitError(null);

    if (exercise?.type === "fill_blank" && exercise.question?.includes("___")) {
      const blanks = (exercise.question.match(/___/g) || []).length;
      setExternalFilled(Array(blanks || 1).fill(null));
    } else {
      setExternalFilled([]);
    }
  }, [id, exercise?.id, exercise?.question]);

  const usesExtendedActivity = exercise
    ? ["multiple_select", "order", "code"].includes(exercise.type)
    : false;

  const handleSubmit = () => {
    if (checkMutation.isPending || result) return;
    const answerToSubmit = isFillInBlank ? fillAnswer : selectedAnswer;
    if (
      !answerToSubmit ||
      (exercise &&
        usesExtendedActivity &&
        !hasExerciseAnswer(exercise, answerToSubmit))
    )
      return;
    if (!user) {
      setSubmitError("Inicia sesión para guardar y comprobar tu progreso.");
      return;
    }
    setSubmitError(null);
    checkMutation.mutate(
      {
        id,
        data: { answer: answerToSubmit, userId: user.id, doubleOrNothing },
      },
      {
        onSuccess: (data) => {
          setResult(data);
          const userParams = { userId: user.id };
          queryClient.invalidateQueries({
            queryKey: getGetProgressQueryKey(userParams),
          });
          if (data.correct) {
            playSuccessSound();
            if (data.xpEarned > 0) gainXP(data.xpEarned);
            setMascotStatus("success");
            queryClient.invalidateQueries({
              queryKey: getGetGamificationStatusQueryKey(userParams),
            });
          } else {
            playErrorSound();
            const lostLives = doubleOrNothing ? 2 : 1;
            loseLife(lostLives);
            setMascotStatus("error");
          }
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo comprobar la respuesta.";
          setSubmitError(message);
          setMascotStatus("error");
        },
      },
    );
  };

  const handleNext = () => {
    if (!exercise || !allExercises) return;
    const topicExercises = allExercises
      .filter((e) => e.topic === exercise.topic)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = topicExercises.findIndex((e) => e.id === exercise.id);
    const nextExercise = topicExercises[currentIndex + 1];
    if (nextExercise) setLocation(`/exercise/${nextExercise.id}`);
    else setLocation("/");
  };

  if (!hasValidId || isExerciseError || (!isLoading && !exercise)) {
    return (
      <div className="min-h-screen page-bg flex flex-col">
        <Navbar backTo="/" />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full p-7 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="font-display font-bold text-xl mb-2">
              No pudimos cargar este ejercicio
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              {hasValidId
                ? exerciseError instanceof Error
                  ? exerciseError.message
                  : "Comprueba tu conexión e inténtalo de nuevo."
                : "El enlace del ejercicio no es válido."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setLocation("/")}>
                Volver al inicio
              </Button>
              {hasValidId && (
                <Button onClick={() => refetchExercise()}>Reintentar</Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading || !exercise) {
    return (
      <div className="min-h-screen page-bg flex flex-col">
        <Navbar backTo="/" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const isMultipleChoice =
    exercise.type === "multiple_choice" ||
    exercise.type === "bug" ||
    (exercise.type === "predict_output" && (exercise.options?.length ?? 0) > 1);
  const hasAnswered = result !== null;

  const handleIntroStart = () => {
    localStorage.setItem(`pylearn_intro_seen_${exercise.topic}`, "1");
    setShowIntro(false);
  };

  const handleIntroClose = () => {
    localStorage.setItem(`pylearn_intro_seen_${exercise.topic}`, "1");
    setShowIntro(false);
  };

  // Derive fill-in-the-blank options from exercise options
  let fillOptions = exercise.options?.length
    ? exercise.options.filter(Boolean)
    : [];
  if (fillOptions.length === 0) {
    fillOptions = [
      "print",
      "input",
      "len",
      "str",
      "int",
      "range",
      "=",
      "==",
      "+",
      "-",
      "def",
      "if",
    ];
  }

  return (
    <>
      {showIntro && (
        <IntroSlides
          topic={exercise.topic}
          exerciseTitle={exercise.title}
          description={exercise.description}
          question={exercise.question}
          explanation={exercise.explanation}
          hint={exercise.hint}
          onClose={handleIntroClose}
          onStart={handleIntroStart}
        />
      )}

      <div className="min-h-screen pb-24 page-bg">
        <Navbar backTo="/" />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider">
                {exercise.topic}
              </span>
              <span
                className={cn(
                  "px-3 py-1 font-bold text-xs rounded-full uppercase tracking-wider",
                  difficultyColors[exercise.difficulty] ??
                    "bg-gray-100 text-gray-700",
                )}
              >
                {difficultyLabels[exercise.difficulty] ?? exercise.difficulty}
              </span>
              {isFillInBlank && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold text-xs rounded-full uppercase tracking-wider">
                  Completar el código
                </span>
              )}
              <button
                onClick={() => setShowIntro(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Ver teoría
              </button>
            </div>
            <span className="text-muted-foreground font-bold text-sm">
              Ejercicio {exercise.orderIndex}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
            {exercise.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Columna izquierda: Contexto y código */}
            <div className="lg:col-span-3 space-y-6">
              <div className="prose prose-slate max-w-none text-foreground/80 leading-relaxed text-lg">
                <p>{exercise.description}</p>
              </div>

              {/* Fill-in-the-blank takes over if applicable */}
              {isFillInBlank ? (
                <FillInTheBlankExercise
                  codeTemplate={exercise.question}
                  options={fillOptions}
                  onChange={(ans, ready) => {
                    setFillAnswer(ans);
                    setFillReady(ready);
                  }}
                  submitted={hasAnswered || checkMutation.isPending}
                  isCorrect={result?.correct}
                  hideOptions={true}
                  externalFilled={externalFilled}
                  onExternalFilledChange={setExternalFilled}
                />
              ) : (
                <div className="shadow-2xl shadow-black/10 rounded-xl overflow-hidden">
                  <CodeBlock code={exercise.question} />
                </div>
              )}

              {exercise.hint && !isFillInBlank && (
                <div className="pt-4">
                  {!showHint ? (
                    <button
                      onClick={() => {
                        setShowHint(true);
                        setMascotStatus("hint");
                      }}
                      className="flex items-center gap-2 text-secondary font-bold hover:text-secondary/80 transition-colors"
                    >
                      <Lightbulb className="w-5 h-5" />
                      Ver pista
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-secondary-foreground flex gap-3"
                    >
                      <Lightbulb className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
                      <p className="font-medium">{exercise.hint}</p>
                    </motion.div>
                  )}
                </div>
              )}
              {/* ── Pylearn Coach Button (below hint) ── */}
              <motion.button
                onClick={() => setIsCoachOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors mt-2"
              >
                <BotMessageSquare className="w-4 h-4" />
                Pregúntale a Pylearn Coach
              </motion.button>
            </div>

            {/* Columna derecha: Mascota + Interacción */}
            <div className="lg:col-span-2 space-y-4 relative">
              {/* Mascot Feedback */}
              <MascotFeedback
                status={mascotStatus}
                hint={mascotStatus === "hint" ? exercise.hint : undefined}
              />

              {/* The right column panel shows for ALL exercise types now */}
              <Card
                className={cn(
                  "p-6 sticky top-24 transition-all duration-300",
                  doubleOrNothing &&
                    !hasAnswered &&
                    "border-amber-400 dark:border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] dark:shadow-[0_0_35px_rgba(245,158,11,0.15)] bg-gradient-to-b from-amber-500/5 to-transparent",
                  hasAnswered &&
                    result?.correct &&
                    doubleOrNothing &&
                    "border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.3)] bg-gradient-to-b from-green-500/5 to-transparent",
                  hasAnswered &&
                    !result?.correct &&
                    doubleOrNothing &&
                    "border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] bg-gradient-to-b from-red-500/5 to-transparent",
                )}
              >
                <h3 className="font-display font-bold text-xl mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    {isFillInBlank ? "Acciones" : "Tu respuesta"}
                  </span>

                  {!hasAnswered && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setDoubleOrNothing(!doubleOrNothing);
                        playSuccessSound();
                      }}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all border shadow-sm cursor-pointer select-none",
                        doubleOrNothing
                          ? "bg-gradient-to-r from-amber-500 to-red-500 border-amber-600 text-white shadow-amber-500/20 animate-pulse"
                          : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                      )}
                    >
                      <Sparkles
                        className={cn(
                          "w-3.5 h-3.5",
                          doubleOrNothing && "text-yellow-200 fill-yellow-200",
                        )}
                      />
                      <span>
                        {doubleOrNothing ? "🔥 Doble o Nada" : "🎲 Apostar?"}
                      </span>
                    </motion.button>
                  )}
                </h3>

                {doubleOrNothing && !hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold leading-relaxed flex items-center gap-2.5"
                  >
                    <Zap className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
                    <div>
                      <span className="uppercase block font-black text-[10px] tracking-wider mb-0.5">
                        ¡Peligro activo!
                      </span>
                      <span>
                        Ganarás **2x XP** si respondes bien, pero perderás **2
                        vidas** si fallas.
                      </span>
                    </div>
                  </motion.div>
                )}

                {isFillInBlank && (
                  <div className="mb-6">
                    <FillInTheBlankExercise
                      codeTemplate={exercise.question}
                      options={fillOptions}
                      onChange={(ans, ready) => {
                        setFillAnswer(ans);
                        setFillReady(ready);
                      }}
                      submitted={hasAnswered || checkMutation.isPending}
                      isCorrect={result?.correct}
                      hideCode={true}
                      externalFilled={externalFilled}
                      onExternalFilledChange={setExternalFilled}
                    />
                  </div>
                )}

                {!isFillInBlank && isMultipleChoice && exercise.options && (
                  <div
                    className={
                      exercise.type === "bug"
                        ? "bg-[#1e1e1e] rounded-xl p-4 shadow-xl border border-slate-700/50 space-y-1"
                        : "space-y-3"
                    }
                  >
                    {exercise.type === "bug" && (
                      <div className="flex gap-2 mb-3 pb-3 border-b border-slate-700/50">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-400 text-xs ml-2 font-mono font-bold uppercase tracking-wider">
                          encuentra el bug.py
                        </span>
                      </div>
                    )}
                    {exercise.options.map((option, idx) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrectOption = result?.correctAnswer === option;
                      const isWrongSelected =
                        hasAnswered && !result.correct && isSelected;

                      if (exercise.type === "bug") {
                        let lineClass =
                          "flex items-center w-full px-3 py-1.5 rounded-md font-mono text-[15px] transition-all cursor-pointer text-left ";

                        if (hasAnswered) {
                          if (isCorrectOption)
                            lineClass +=
                              "bg-green-500/20 text-green-400 border border-green-500/50";
                          else if (isWrongSelected)
                            lineClass +=
                              "bg-red-500/20 text-red-400 border border-red-500/50 line-through";
                          else
                            lineClass +=
                              "text-slate-300 opacity-60 border border-transparent";
                        } else if (isSelected) {
                          lineClass +=
                            "bg-primary/20 text-primary-300 border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]";
                        } else {
                          lineClass +=
                            "text-slate-300 hover:bg-slate-800 border border-transparent";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              !hasAnswered && setSelectedAnswer(option)
                            }
                            disabled={hasAnswered || checkMutation.isPending}
                            className={lineClass}
                          >
                            <span className="w-6 text-slate-600 select-none shrink-0 text-right mr-4">
                              {idx + 1}
                            </span>
                            <span className="break-words whitespace-pre-wrap flex-1">
                              {option}
                            </span>
                            {hasAnswered && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 ml-2 text-green-400 shrink-0" />
                            )}
                            {hasAnswered && isWrongSelected && (
                              <XCircle className="w-4 h-4 ml-2 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      }

                      let buttonClass =
                        "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-foreground font-mono text-base transition-all rounded-xl";
                      if (hasAnswered) {
                        if (isCorrectOption)
                          buttonClass =
                            "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-success/10 border-success text-success font-mono text-base font-bold rounded-xl";
                        else if (isWrongSelected)
                          buttonClass =
                            "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-destructive/10 border-destructive text-destructive font-mono text-base rounded-xl";
                        else
                          buttonClass =
                            "w-full justify-start h-auto py-4 px-5 text-left border-2 border-border/40 bg-slate-50/50 dark:bg-slate-900/20 text-muted-foreground font-mono text-base opacity-40 rounded-xl";
                      } else if (isSelected) {
                        buttonClass =
                          "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-primary/5 dark:bg-primary/10 border-primary text-primary font-mono text-base font-bold shadow-sm rounded-xl";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            !hasAnswered && setSelectedAnswer(option)
                          }
                          disabled={hasAnswered || checkMutation.isPending}
                          aria-pressed={isSelected}
                          className={buttonClass}
                        >
                          <div className="flex items-center w-full">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold mr-4 shrink-0 text-slate-500 dark:text-slate-400">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="break-words whitespace-pre-wrap">
                              {option}
                            </span>
                            {hasAnswered && isCorrectOption && (
                              <CheckCircle2 className="w-5 h-5 ml-auto text-success shrink-0" />
                            )}
                            {hasAnswered && isWrongSelected && (
                              <XCircle className="w-5 h-5 ml-auto text-destructive shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {usesExtendedActivity && (
                  <div
                    className="legacy-extra-activity"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        (event.ctrlKey || event.metaKey)
                      ) {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                  >
                    <ExerciseActivity
                      key={exercise.id}
                      exercise={exercise}
                      answer={selectedAnswer}
                      onAnswerChange={setSelectedAnswer}
                      result={result}
                      disabled={hasAnswered || checkMutation.isPending}
                    />
                  </div>
                )}

                {!isFillInBlank &&
                  !isMultipleChoice &&
                  !usesExtendedActivity && (
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={selectedAnswer}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              (e.ctrlKey || e.metaKey) &&
                              !hasAnswered
                            ) {
                              e.preventDefault();
                              handleSubmit();
                            }
                          }}
                          disabled={hasAnswered || checkMutation.isPending}
                          placeholder={
                            typePlaceholders[exercise.type ?? ""] ??
                            "Escribe tu respuesta..."
                          }
                          className={cn(
                            "w-full bg-slate-50 dark:bg-slate-900/60 text-foreground border-2 border-border rounded-xl px-5 py-4 font-mono text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                            hasAnswered &&
                              result?.correct &&
                              "border-success bg-success/5 text-success font-bold focus:ring-0",
                            hasAnswered &&
                              !result?.correct &&
                              "border-destructive bg-destructive/5 text-destructive focus:ring-0",
                          )}
                        />
                        {hasAnswered && result.correct && (
                          <CheckCircle2 className="absolute right-4 top-4 w-6 h-6 text-success" />
                        )}
                        {hasAnswered && !result.correct && (
                          <XCircle className="absolute right-4 top-4 w-6 h-6 text-destructive" />
                        )}
                      </div>
                    </div>
                  )}

                {hasAnswered && !result?.correct && result?.correctAnswer && (
                  <div className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                    Respuesta correcta:{" "}
                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-foreground">
                      {result.correctAnswer}
                    </code>
                  </div>
                )}

                {submitError && !hasAnswered && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    No se pudo comprobar tu respuesta: {submitError}
                  </div>
                )}

                {!hasAnswered ? (
                  <Button
                    className="w-full mt-8"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={
                      (isFillInBlank
                        ? !fillReady
                        : !hasExerciseAnswer(exercise, selectedAnswer)) ||
                      checkMutation.isPending
                    }
                  >
                    {checkMutation.isPending
                      ? "Verificando..."
                      : isFillInBlank
                        ? "Comprobar ✓"
                        : "Enviar respuesta"}
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-8"
                    size="lg"
                    variant={result.correct ? "success" : "default"}
                    onClick={
                      result.correct
                        ? handleNext
                        : () => {
                            setResult(null);
                            setSelectedAnswer("");
                            setDoubleOrNothing(false);
                            if (isFillInBlank && exercise) {
                              const blanks = (
                                exercise.question.match(/___/g) || []
                              ).length;
                              setExternalFilled(Array(blanks || 1).fill(null));
                              setFillReady(false);
                              setFillAnswer("");
                            }
                          }
                    }
                  >
                    {result.correct ? (
                      <>
                        Continuar <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      "Reintentar"
                    )}
                  </Button>
                )}

                {/* ── Pylearn Coach CTA — prominent after wrong answer ── */}
                <AnimatePresence>
                  {hasAnswered && !result?.correct && (
                    <motion.button
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        delay: 0.4,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      onClick={() => setIsCoachOpen(true)}
                      className="w-full mt-3 py-3 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <BotMessageSquare className="w-4 h-4" />
                      Pylearn puede ayudarte 🐍
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-2 h-2 bg-emerald-400 rounded-full inline-block"
                      />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Feedback */}
                <AnimatePresence>
                  {hasAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "mt-6 p-5 rounded-xl border-l-4",
                        result.correct
                          ? "bg-success/10 border-success text-slate-800 dark:text-slate-200"
                          : "bg-destructive/10 border-destructive text-slate-800 dark:text-slate-200",
                      )}
                    >
                      <h4
                        className={cn(
                          "font-bold text-lg mb-1 flex items-center gap-2",
                          result.correct ? "text-success" : "text-destructive",
                        )}
                      >
                        {result.correct
                          ? result.xpEarned > 0
                            ? `¡Muy bien! +${result.xpEarned} XP ⚡ ${doubleOrNothing ? "(¡Doble o Nada Ganado! 🎲)" : ""}`
                            : "¡Muy bien! Este ejercicio ya estaba completado."
                          : doubleOrNothing
                            ? "¡Oh no! Has fallado la apuesta y perdiste 2 vidas. 💔"
                            : "Casi, sigue intentando."}
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {result.feedback}
                      </p>
                      {result.correct && exercise.explanation && (
                        <div className="mt-3 pt-3 border-t border-success/20 text-sm">
                          <span className="font-bold block mb-1">
                            ¿Por qué funciona así?
                          </span>
                          {exercise.explanation}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* ── AI Coach Panel Portal ── */}
      <AICoachPanel
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        exercise={{
          id: exercise.id,
          title: exercise.title,
          topic: exercise.topic,
          question: exercise.question,
          explanation: exercise.explanation,
          hint: exercise.hint,
        }}
        userAnswer={isFillInBlank ? fillAnswer : selectedAnswer}
        wasCorrect={result ? result.correct : null}
        correctAnswer={result?.correctAnswer}
      />
    </>
  );
}
