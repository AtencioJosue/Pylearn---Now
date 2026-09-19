import { Link } from "wouter";
import { useGetExercises } from "@workspace/api-client-react";
import {
  ArrowRight,
  Brain,
  Bug,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  RotateCcw,
  Shuffle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getUnitForTopic } from "@/features/learning/curriculum";
import { useCurrentUserProgress } from "@/hooks/useUserProgress";

export function Practice() {
  const { data: exercises, isLoading: loadingExercises } = useGetExercises();
  const { data: progress, isLoading: loadingProgress } =
    useCurrentUserProgress();

  if (loadingExercises || loadingProgress) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="mx-auto mt-24 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  const byTopic = Object.values(
    (exercises ?? []).reduce(
      (groups, exercise) => {
        const current = groups[exercise.topic] ?? {
          topic: exercise.topic,
          exercises: [] as typeof exercises,
        };
        current.exercises?.push(exercise);
        groups[exercise.topic] = current;
        return groups;
      },
      {} as Record<string, { topic: string; exercises: typeof exercises }>,
    ),
  );

  const weakTopics = byTopic
    .map((group) => {
      const topicExercises = [...(group.exercises ?? [])].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
      const completed = Math.min(
        progress?.topicProgress?.[group.topic] ?? 0,
        topicExercises.length,
      );
      return {
        ...group,
        exercises: topicExercises,
        completed,
        ratio: topicExercises.length ? completed / topicExercises.length : 0,
        next: topicExercises[
          Math.min(completed, Math.max(0, topicExercises.length - 1))
        ],
        unit: getUnitForTopic(group.topic),
      };
    })
    .filter((topic) => topic.exercises.length > 0 && topic.ratio < 1)
    .sort(
      (a, b) =>
        a.ratio - b.ratio ||
        a.exercises[0].orderIndex - b.exercises[0].orderIndex,
    )
    .slice(0, 6);

  const reviewIds = progress?.reviewExerciseIds ?? [];
  const firstReview = reviewIds[0];
  const quickExercise = weakTopics[0]?.next ?? exercises?.[0];
  const randomExercise = exercises?.length
    ? exercises[Math.floor((new Date().getMinutes() / 60) * exercises.length)]
    : undefined;

  return (
    <div className="min-h-screen page-bg pb-24 md:pb-12">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <section className="practice-hero">
          <div>
            <div className="welcome-kicker">
              <Brain className="h-4 w-4" /> Entrenamiento personalizado
            </div>
            <h1>Convierte tus errores en experiencia.</h1>
            <p>
              Pylearn mezcla conceptos pendientes y ejercicios cortos para que
              recuerdes más con menos esfuerzo.
            </p>
          </div>
          <div className="hidden items-center gap-3 rounded-[24px] bg-white/15 p-4 text-white sm:flex">
            <Target className="h-10 w-10" />
            <div>
              <strong className="block text-2xl font-black">
                {reviewIds.length}
              </strong>
              <span className="text-sm font-bold text-white/80">
                retos para repasar
              </span>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <PracticeMode
            icon={<Bug className="h-6 w-6" />}
            color="#ef4444"
            title="Repasar errores"
            description={
              firstReview
                ? `${reviewIds.length} ejercicios esperan una segunda oportunidad.`
                : "No tienes errores pendientes. ¡Buen trabajo!"
            }
            href={
              firstReview
                ? `/exercise/${firstReview}`
                : quickExercise
                  ? `/exercise/${quickExercise.id}`
                  : "#"
            }
            badge={firstReview ? "Recomendado" : "Práctica extra"}
          />
          <PracticeMode
            icon={<Clock3 className="h-6 w-6" />}
            color="#0ea5e9"
            title="Sesión de 5 minutos"
            description="Una mezcla rápida para mantener activo lo aprendido."
            href={quickExercise ? `/exercise/${quickExercise.id}` : "#"}
            badge="+50 XP posibles"
          />
          <PracticeMode
            icon={<Shuffle className="h-6 w-6" />}
            color="#8b5cf6"
            title="Reto sorpresa"
            description="Deja que Pylearn elija un desafío de cualquier unidad."
            href={randomExercise ? `/exercise/${randomExercise.id}` : "#"}
            badge="Modo aventura"
          />
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-violet-500">
                Recomendado para ti
              </span>
              <h2 className="mt-1 text-2xl font-black">
                Temas que puedes fortalecer
              </h2>
            </div>
            <Link
              href="/"
              className="hidden items-center gap-1 text-sm font-extrabold text-sky-500 sm:flex"
            >
              Ver ruta completa <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weakTopics.map((topic) => {
              const percent = Math.round(topic.ratio * 100);
              return (
                <Link
                  key={topic.topic}
                  href={topic.next ? `/exercise/${topic.next.id}` : "#"}
                  className="topic-practice-card group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="topic-practice-icon"
                      style={{
                        backgroundColor: `${topic.unit?.color ?? "#0ea5e9"}18`,
                        color: topic.unit?.color ?? "#0ea5e9",
                      }}
                    >
                      {topic.unit?.icon ?? "🐍"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span>{topic.unit?.eyebrow ?? "Práctica"}</span>
                      <strong>{topic.topic.replace(" básicas", "")}</strong>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs font-extrabold text-slate-400">
                    <span>
                      {topic.completed}/{topic.exercises.length} completados
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: topic.unit?.color ?? "#0ea5e9",
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="practice-tip">
          <div className="practice-tip-mascot">
            <img
              src={`${import.meta.env.BASE_URL}images/python-mascot.png`}
              alt="Pylearn"
            />
          </div>
          <div>
            <span>
              <Sparkles className="h-4 w-4" /> Consejo de Pylearn
            </span>
            <h3>Repetir con espacio ayuda más que repetir de inmediato.</h3>
            <p>
              Vuelve mañana a los ejercicios difíciles. Tu cerebro hará parte
              del trabajo mientras descansas.
            </p>
          </div>
          <div className="ml-auto hidden gap-3 lg:flex">
            <span className="practice-tip-stat">
              <Flame className="h-4 w-4 text-orange-500" /> Constancia
            </span>
            <span className="practice-tip-stat">
              <Zap className="h-4 w-4 text-amber-500" /> Sesiones cortas
            </span>
            <span className="practice-tip-stat">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Feedback
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

function PracticeMode({
  icon,
  color,
  title,
  description,
  href,
  badge,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  href: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="practice-mode group"
      style={{ "--mode-color": color } as React.CSSProperties}
    >
      <div className="practice-mode-top">
        <div className="practice-mode-icon">{icon}</div>
        <span>{badge}</span>
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="practice-mode-action">
        Comenzar{" "}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
