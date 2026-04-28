import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useGetExercise, 
  useGetExercises, 
  useCheckAnswer, 
  AnswerResult,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { CodeBlock } from "@/components/CodeBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntroSlides } from "@/components/IntroSlides";
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, Zap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { playSuccessSound, playErrorSound } from "@/hooks/useSoundEffects";

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

  const { data: exercise, isLoading } = useGetExercise(id, { query: { enabled: !!id } });
  const { data: allExercises } = useGetExercises();
  const checkMutation = useCheckAnswer();
  const queryClient = useQueryClient();

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  const BASIC_TOPICS = ["Variables", "Strings", "Listas", "Bucles", "Funciones", "Diccionarios"];

  useEffect(() => {
    setSelectedAnswer("");
    setShowHint(false);
    setResult(null);
  }, [id]);

  useEffect(() => {
    if (!exercise) return;
    if (!BASIC_TOPICS.includes(exercise.topic)) return;
    const key = `pylearn_intro_seen_${exercise.topic}`;
    if (!localStorage.getItem(key)) {
      setShowIntro(true);
    }
  }, [exercise?.topic]);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    checkMutation.mutate(
      { id, data: { answer: selectedAnswer } },
      {
        onSuccess: (data) => {
          setResult(data);
          // Play sound effect based on result
          if (data.correct) {
            playSuccessSound();
            // Invalidate progress cache so Home page updates
            queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
          } else {
            playErrorSound();
          }
        }
      }
    );
  };

  const handleNext = () => {
    if (!exercise || !allExercises) return;
    
    const topicExercises = allExercises
      .filter(e => e.topic === exercise.topic)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    const currentIndex = topicExercises.findIndex(e => e.id === exercise.id);
    const nextExercise = topicExercises[currentIndex + 1];

    if (nextExercise) {
      setLocation(`/exercise/${nextExercise.id}`);
    } else {
      setLocation("/");
    }
  };

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

  const isMultipleChoice = exercise.type === "multiple_choice";
  const hasAnswered = result !== null;

  const handleIntroStart = () => {
    localStorage.setItem(`pylearn_intro_seen_${exercise.topic}`, "1");
    setShowIntro(false);
  };

  const handleIntroClose = () => {
    localStorage.setItem(`pylearn_intro_seen_${exercise.topic}`, "1");
    setShowIntro(false);
    setLocation("/");
  };

  return (
    <>
      {showIntro && BASIC_TOPICS.includes(exercise.topic) && (
        <IntroSlides
          topic={exercise.topic}
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
            <span className={cn(
              "px-3 py-1 font-bold text-xs rounded-full uppercase tracking-wider",
              difficultyColors[exercise.difficulty] ?? "bg-gray-100 text-gray-700"
            )}>
              {difficultyLabels[exercise.difficulty] ?? exercise.difficulty}
            </span>
            {BASIC_TOPICS.includes(exercise.topic) && (
              <button
                onClick={() => setShowIntro(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Ver teoría
              </button>
            )}
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

            <div className="shadow-2xl shadow-black/10 rounded-xl overflow-hidden">
              <CodeBlock code={exercise.question} />
            </div>

            {exercise.hint && (
              <div className="pt-4">
                {!showHint ? (
                  <button 
                    onClick={() => setShowHint(true)}
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
          </div>

          {/* Columna derecha: Interacción */}
          <div className="lg:col-span-2 space-y-6 relative">
            <Card className="p-6 sticky top-24">
              <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Tu respuesta
              </h3>

              {isMultipleChoice && exercise.options && (
                <div className="space-y-3">
                  {exercise.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = result?.correctAnswer === option;
                    const isWrongSelected = hasAnswered && !result.correct && isSelected;
                    
                    let buttonClass = "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-white hover:bg-slate-50 text-foreground font-mono text-base transition-all";
                    
                    if (hasAnswered) {
                      if (isCorrectOption) {
                        buttonClass = "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-success/10 border-success text-success font-mono text-base font-bold";
                      } else if (isWrongSelected) {
                        buttonClass = "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-destructive/10 border-destructive text-destructive font-mono text-base";
                      } else {
                        buttonClass = "w-full justify-start h-auto py-4 px-5 text-left border-2 border-border/50 bg-slate-50 text-muted-foreground font-mono text-base opacity-50";
                      }
                    } else if (isSelected) {
                      buttonClass = "w-full justify-start h-auto py-4 px-5 text-left border-2 bg-primary/5 border-primary text-primary font-mono text-base font-bold shadow-sm";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !hasAnswered && setSelectedAnswer(option)}
                        disabled={hasAnswered}
                        className={buttonClass}
                      >
                        <div className="flex items-center w-full">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold mr-4 shrink-0 text-slate-500">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="break-words whitespace-pre-wrap">{option}</span>
                          {hasAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 ml-auto text-success shrink-0" />}
                          {hasAnswered && isWrongSelected && <XCircle className="w-5 h-5 ml-auto text-destructive shrink-0" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {!isMultipleChoice && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !hasAnswered && handleSubmit()}
                      disabled={hasAnswered}
                      placeholder={typePlaceholders[exercise.type ?? ""] ?? "Escribe tu respuesta..."}
                      className={cn(
                        "w-full bg-slate-50 border-2 border-border rounded-xl px-5 py-4 font-mono text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                        hasAnswered && result?.correct && "border-success bg-success/5 text-success font-bold focus:ring-0",
                        hasAnswered && !result?.correct && "border-destructive bg-destructive/5 text-destructive focus:ring-0"
                      )}
                    />
                    {hasAnswered && result.correct && <CheckCircle2 className="absolute right-4 top-4 w-6 h-6 text-success" />}
                    {hasAnswered && !result.correct && <XCircle className="absolute right-4 top-4 w-6 h-6 text-destructive" />}
                  </div>
                  
                  {hasAnswered && !result?.correct && result?.correctAnswer && (
                    <div className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                      Respuesta correcta: <code className="bg-slate-100 px-2 py-1 rounded text-foreground">{result.correctAnswer}</code>
                    </div>
                  )}
                </div>
              )}

              {!hasAnswered ? (
                <Button 
                  className="w-full mt-8" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || checkMutation.isPending}
                >
                  {checkMutation.isPending ? "Verificando..." : "Enviar respuesta"}
                </Button>
              ) : (
                <Button 
                  className="w-full mt-8" 
                  size="lg"
                  variant={result.correct ? "success" : "default"}
                  onClick={handleNext}
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              {/* Área de retroalimentación */}
              <AnimatePresence>
                {hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "mt-6 p-5 rounded-xl border-l-4",
                      result.correct ? "bg-success/10 border-success text-slate-800" : "bg-destructive/10 border-destructive text-slate-800"
                    )}
                  >
                    <h4 className={cn("font-bold text-lg mb-1 flex items-center gap-2", 
                      result.correct ? "text-success" : "text-destructive"
                    )}>
                      {result.correct ? "¡Muy bien!" : "Casi, sigue intentando."}
                    </h4>
                    <p className="text-sm leading-relaxed">{result.feedback}</p>
                    {result.correct && exercise.explanation && (
                      <div className="mt-3 pt-3 border-t border-success/20 text-sm">
                        <span className="font-bold block mb-1">¿Por qué funciona así?</span>
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
    </>
  );
}
