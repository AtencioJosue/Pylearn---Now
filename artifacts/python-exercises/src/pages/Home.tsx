import { useGetExercises } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Code2,
  Brain,
  CheckCircle2,
  Flame,
  Zap,
  Skull,
  Sparkles,
  Trophy,
  Target,
  BookOpen,
  Rocket,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { LearningPath } from "@/components/LearningPath";
import { useCurrentUserProgress } from "@/hooks/useUserProgress";
import { useState, useEffect } from "react";

/* ── Animated floating particles for hero ── */
function FloatingParticles() {
  const particles = [
    { emoji: "🐍", x: 8, y: 20, delay: 0, size: "text-3xl" },
    { emoji: "⚡", x: 85, y: 15, delay: 1.2, size: "text-2xl" },
    { emoji: "🎯", x: 75, y: 70, delay: 0.6, size: "text-2xl" },
    { emoji: "💡", x: 15, y: 75, delay: 1.8, size: "text-xl" },
    { emoji: "🚀", x: 92, y: 45, delay: 0.3, size: "text-xl" },
    { emoji: "✨", x: 50, y: 10, delay: 2.0, size: "text-lg" },
    { emoji: "🏆", x: 30, y: 85, delay: 1.5, size: "text-xl" },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className={`absolute ${p.size} animate-float pointer-events-none select-none`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            opacity: 0.5,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </>
  );
}

/* ── Animated counter ── */
function AnimatedCounter({
  target,
  duration = 1500,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}</>;
}

/* ── Quick action card ── */
function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  href,
  color,
  shadowColor,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href: string;
  color: string;
  shadowColor: string;
}) {
  return (
    <Link href={href}>
      <div className="card-bouncy p-5 flex items-center gap-4 group">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-110"
          style={{
            backgroundColor: color,
            boxShadow: `0 4px 0 ${shadowColor}`,
          }}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-display font-extrabold text-slate-700 dark:text-slate-100 text-lg">
            {title}
          </h4>
          <p className="text-slate-400 font-bold text-sm">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

export function Home() {
  const { data: exercises, isLoading: loadingEx } = useGetExercises();
  const { data: progress, isLoading: loadingProg } = useCurrentUserProgress();

  if (loadingEx || loadingProg) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          <p className="text-slate-400 font-bold animate-pulse">
            Cargando tu aventura...
          </p>
        </div>
      </div>
    );
  }

  const LEVEL_TOPICS = ["Intermedio", "Difícil", "Tryhard"];

  const topicsMap =
    exercises?.reduce(
      (acc, ex) => {
        if (!acc[ex.topic]) acc[ex.topic] = [];
        acc[ex.topic].push(ex);
        return acc;
      },
      {} as Record<string, typeof exercises>,
    ) || {};

  const allTopics = Object.entries(topicsMap).map(([name, exs]) => ({
    name,
    exercises: exs.sort((a, b) => a.orderIndex - b.orderIndex),
    total: exs.length,
    completed: progress?.topicProgress?.[name] || 0,
  }));

  const basicTopics = allTopics.filter((t) => !LEVEL_TOPICS.includes(t.name));
  const levelTopics = allTopics
    .filter((t) => LEVEL_TOPICS.includes(t.name))
    .sort(
      (a, b) => LEVEL_TOPICS.indexOf(a.name) - LEVEL_TOPICS.indexOf(b.name),
    );

  const totalCompleted = progress?.completedExercises || 0;
  const totalExercises = progress?.totalExercises || 0;
  const accuracy = progress?.totalAttempts
    ? Math.round(
        ((progress?.correctAnswers || 0) / progress.totalAttempts) * 100,
      )
    : 100;

  return (
    <div className="min-h-screen page-bg pb-20">
      <Navbar />

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E0F7FA] via-[#F0F9FF] to-[#ECFDF5] dark:from-[#1E262E] dark:via-[#1e262e] dark:to-[#1E262E]" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#58CC02]/8 blur-3xl" />
        <FloatingParticles />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-general)] to-transparent" />

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#58CC02]/10 text-[#58CC02] font-bold text-sm mb-6 border-2 border-[#58CC02]/20 animate-pulse-soft">
                <Sparkles className="w-5 h-5" />
                ¡Aprende programación jugando!
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-6 tracking-tight">
                Domina Python <br />
                <span className="bg-gradient-to-r from-primary via-[#58CC02] to-[#FFC800] bg-clip-text text-transparent">
                  paso a paso.
                </span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-300 max-w-2xl mx-auto md:mx-0 mb-10 font-semibold leading-relaxed">
                Lecciones cortas y divertidas con ejercicios interactivos.
                Avanza a tu ritmo y conviértete en un experto programador. 🎮
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href={
                    basicTopics.length
                      ? `/exercise/${basicTopics[0].exercises[0].id}?theory=1`
                      : "#"
                  }
                  className="inline-block"
                >
                  <button className="btn-bouncy btn-green text-xl font-bold py-4 px-10 flex items-center gap-3">
                    <Rocket className="w-6 h-6" />
                    EMPEZAR AHORA
                  </button>
                </Link>
                <Link href="/playground" className="inline-block">
                  <button className="btn-bouncy btn-outline-gray text-lg font-bold py-4 px-8 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Editor Libre
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full max-w-sm hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#58CC02]/20 to-transparent rounded-full blur-3xl scale-90" />
                <div className="relative animate-bounce-slow">
                  <img
                    src={`${import.meta.env.BASE_URL}images/python-mascot.png`}
                    alt="Pylearn - Tu compañero de aprendizaje"
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 shadow-lg border-2 border-[#FFC800] animate-pulse-soft">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    ¡Hola! Soy <span className="text-[#58CC02]">Pylearn</span>{" "}
                    🐍
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border-2 border-slate-200/60 dark:border-slate-700 border-b-[6px] dark:border-b-[6px] p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-xl shadow-primary/5">
          {[
            {
              label: "Total",
              value: totalExercises,
              icon: <BookOpen className="w-6 h-6" />,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Completados",
              value: totalCompleted,
              icon: <CheckCircle2 className="w-6 h-6" />,
              color: "text-[#58CC02]",
              bg: "bg-[#58CC02]/10",
            },
            {
              label: "Precisión",
              value: `${accuracy}%`,
              icon: <Target className="w-6 h-6" />,
              color: "text-[#FFC800]",
              bg: "bg-[#FFC800]/10",
            },
            {
              label: "Temas",
              value: allTopics.length,
              icon: <Trophy className="w-6 h-6" />,
              color: "text-[#CE82FF]",
              bg: "bg-[#CE82FF]/10",
            },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="text-center group">
              <div
                className={`w-12 h-12 mx-auto mb-2 ${bg} rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
              >
                {icon}
              </div>
              <p className="text-slate-400 dark:text-slate-300 font-extrabold uppercase tracking-widest text-[10px] mb-1">
                {label}
              </p>
              <p className={`text-3xl font-display font-extrabold ${color}`}>
                {typeof value === "number" ? (
                  <AnimatedCounter target={value} />
                ) : (
                  value
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={Rocket}
            title="Continuar Aprendiendo"
            subtitle="Desde donde lo dejaste"
            href={(() => {
              const nextTopic = basicTopics.find((t) => t.completed < t.total);
              if (!nextTopic)
                return basicTopics.length
                  ? `/exercise/${basicTopics[0].exercises[0].id}`
                  : "#";
              const nextIdx = Math.min(
                nextTopic.completed,
                nextTopic.total - 1,
              );
              return `/exercise/${nextTopic.exercises[nextIdx]?.id}`;
            })()}
            color="#58CC02"
            shadowColor="#58A700"
          />
          <QuickActionCard
            icon={Code2}
            title="Playground"
            subtitle="Experimenta con código"
            href="/playground"
            color="#1CB0F6"
            shadowColor="#1899D6"
          />
          <QuickActionCard
            icon={Flame}
            title="Zona Desafío"
            subtitle="Pon a prueba tu nivel"
            href={
              levelTopics.length
                ? `/exercise/${levelTopics[0].exercises[0]?.id}`
                : "#"
            }
            color="#FF4B4B"
            shadowColor="#EA2B2B"
          />
        </div>
      </div>

      {/* ── Learning Path — Bloques ── */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        {[
          {
            title: "Bloque 1: Fundamentos Básicos",
            subtitle: "Aprende lo esencial para comenzar.",
            keywords: [
              "variable",
              "tipo",
              "type",
              "booleano",
              "none",
              "string",
              "texto",
            ],
            color: "#1CB0F6",
            bg: "bg-blue-100/70 dark:bg-sky-950/40",
            text: "text-[#1CB0F6]",
            shadow: "shadow-blue-200/30 dark:shadow-none",
            icon: <Brain className="w-8 h-8" />,
          },
          {
            title: "Bloque 2: Colecciones Épicas",
            subtitle: "Organiza y almacena información como un pro.",
            keywords: [
              "lista",
              "diccionario",
              "dict",
              "inventario",
              "tupla",
              "conjunto",
            ],
            color: "#58CC02",
            bg: "bg-green-100/70 dark:bg-emerald-950/40",
            text: "text-[#58CC02]",
            shadow: "shadow-green-200/30 dark:shadow-none",
            icon: <BookOpen className="w-8 h-8" />,
          },
          {
            title: "Bloque 3: Lógica y Magia",
            subtitle: "Dale inteligencia y automatización a tu código.",
            keywords: [
              "bucle",
              "iterar",
              "while",
              "for",
              "control",
              "iterador",
              "función",
              "funcion",
              "parámetro",
              "retorno",
              "proyecto",
              "error",
              "clases",
              "funcional",
              "poo",
              "condicional",
              "archivo",
              "módulo",
              "algoritmo",
              "comprensi",
            ],
            color: "#CE82FF",
            bg: "bg-purple-100/70 dark:bg-purple-950/40",
            text: "text-[#CE82FF]",
            shadow: "shadow-purple-200/30 dark:shadow-none",
            icon: <Zap className="w-8 h-8" />,
          },
        ].map((block, idx) => {
          const blockTopics = basicTopics.filter((t) => {
            const nameLower = t.name.toLowerCase();
            return block.keywords.some((k) => nameLower.includes(k));
          });
          if (blockTopics.length === 0) return null;

          return (
            <div key={idx} className="mb-16">
              <div className="flex items-center gap-4 mb-10">
                <div
                  className={`w-14 h-14 ${block.bg} backdrop-blur-sm rounded-2xl flex items-center justify-center ${block.text} shadow-lg ${block.shadow}`}
                >
                  {block.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">
                    {block.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold">
                    {block.subtitle}
                  </p>
                </div>
              </div>
              <LearningPath topics={blockTopics} />
            </div>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-[#FF4B4B]/20 to-transparent" />
      </div>

      {/* ── Challenge Zone ── */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-red-100/70 dark:bg-red-950/40 backdrop-blur-sm rounded-2xl flex items-center justify-center text-[#FF4B4B] shadow-lg shadow-red-200/30 dark:shadow-none">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">
              Zona de Desafío
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              Pon a prueba tu lógica y velocidad. Solo para valientes. 🔥
            </p>
          </div>
        </div>

        <LearningPath topics={levelTopics} isChallenge />
      </div>

      {/* ── Motivational Footer ── */}
      <div className="max-w-3xl mx-auto px-4 mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-[#58CC02]/20 to-transparent mb-10" />
        <div className="bg-gradient-to-r from-primary/10 via-[#58CC02]/10 to-[#FFC800]/10 dark:from-primary/5 dark:via-[#58CC02]/5 dark:to-[#FFC800]/5 rounded-3xl p-10 border-2 border-white/50 dark:border-slate-700 backdrop-blur-xl shadow-xl shadow-primary/5 relative overflow-hidden text-center">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FFC800]/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <span className="text-5xl mb-4 block relative z-10">🐍</span>
          <h3 className="text-2xl font-display font-extrabold text-slate-700 dark:text-slate-100 mb-3 relative z-10">
            ¡Cada ejercicio te acerca a ser un experto!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-semibold relative z-10">
            La práctica constante es la clave del éxito. No te rindas, sigue
            adelante. 💪
          </p>
        </div>
      </div>
    </div>
  );
}
