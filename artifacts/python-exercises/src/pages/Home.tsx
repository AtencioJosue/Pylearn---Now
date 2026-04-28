import { useGetExercises, useGetProgress } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Play, Code2, Brain, CheckCircle2, Flame, Zap, Skull, ShieldCheck, Sparkles, Trophy, Target, BookOpen, Rocket } from "lucide-react";
import { Navbar } from "@/components/Navbar";
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
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
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
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count}</>;
}

/* ── Quick action card ── */
function QuickActionCard({ icon: Icon, title, subtitle, href, color, shadowColor }: {
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
          style={{ backgroundColor: color, boxShadow: `0 4px 0 ${shadowColor}` }}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-display font-extrabold text-slate-700 text-lg">{title}</h4>
          <p className="text-slate-400 font-bold text-sm">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

export function Home() {
  const { data: exercises, isLoading: loadingEx } = useGetExercises();
  const { data: progress, isLoading: loadingProg } = useGetProgress();

  if (loadingEx || loadingProg) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          <p className="text-slate-400 font-bold animate-pulse">Cargando tu aventura...</p>
        </div>
      </div>
    );
  }

  const LEVEL_TOPICS = ["Intermedio", "Difícil", "Tryhard"];

  const topicsMap = exercises?.reduce((acc, ex) => {
    if (!acc[ex.topic]) acc[ex.topic] = [];
    acc[ex.topic].push(ex);
    return acc;
  }, {} as Record<string, typeof exercises>) || {};

  const allTopics = Object.entries(topicsMap).map(([name, exs]) => ({
    name,
    exercises: exs.sort((a, b) => a.orderIndex - b.orderIndex),
    total: exs.length,
    completed: progress?.topicProgress?.[name] || 0,
  }));

  const basicTopics = allTopics.filter(t => !LEVEL_TOPICS.includes(t.name));
  const levelTopics = allTopics.filter(t => LEVEL_TOPICS.includes(t.name))
    .sort((a, b) => LEVEL_TOPICS.indexOf(a.name) - LEVEL_TOPICS.indexOf(b.name));

  const totalCompleted = progress?.completedExercises || 0;
  const totalExercises = progress?.totalExercises || 0;
  const accuracy = totalExercises ? Math.round((progress?.correctAnswers || 0) / (progress?.completedExercises || 1) * 100) : 0;

  return (
    <div className="min-h-screen page-bg pb-20">
      <Navbar />
      
      {/* ── Hero Section ── Clean gradient with animated particles ── */}
      <div className="relative overflow-hidden">
        {/* Gradient background - no image needed */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E0F7FA] via-[#F0F9FF] to-[#ECFDF5]" />
        
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#58CC02]/8 blur-3xl" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full bg-[#FFC800]/5 blur-3xl" />
        
        {/* Floating particles */}
        <FloatingParticles />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#eef4f9] to-transparent" />

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#58CC02]/10 text-[#58CC02] font-bold text-sm mb-6 border-2 border-[#58CC02]/20 animate-pulse-soft">
                <Sparkles className="w-5 h-5" />
                ¡Aprende programación jugando!
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-800 leading-tight mb-6 tracking-tight">
                Domina Python <br/>
                <span className="bg-gradient-to-r from-primary via-[#58CC02] to-[#FFC800] bg-clip-text text-transparent">
                  paso a paso.
                </span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto md:mx-0 mb-10 font-semibold leading-relaxed">
                Lecciones cortas y divertidas con ejercicios interactivos. 
                Avanza a tu ritmo y conviértete en un experto programador. 🎮
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href={basicTopics.length ? `/exercise/${basicTopics[0].exercises[0].id}` : "#"} className="inline-block">
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
                {/* Glow behind mascot */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#58CC02]/20 to-transparent rounded-full blur-3xl scale-90" />
                <div className="relative animate-bounce-slow">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/python-mascot.png`} 
                    alt="Pyto - Tu compañero de aprendizaje" 
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
                {/* Floating badge next to mascot */}
                <div className="absolute -top-2 -right-2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-[#FFC800] animate-pulse-soft">
                  <span className="text-sm font-bold text-slate-700">¡Hola! Soy <span className="text-[#58CC02]">Pyto</span> 🐍</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-slate-200/60 border-b-[6px] p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-xl shadow-primary/5">
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px] mb-1">Total</p>
            <p className="text-3xl font-display font-extrabold text-slate-700">
              <AnimatedCounter target={totalExercises} />
            </p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-[#58CC02]/10 rounded-2xl flex items-center justify-center text-[#58CC02] group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px] mb-1">Completados</p>
            <p className="text-3xl font-display font-extrabold text-[#58CC02]">
              <AnimatedCounter target={totalCompleted} />
            </p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-[#FFC800]/10 rounded-2xl flex items-center justify-center text-[#FFC800] group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px] mb-1">Precisión</p>
            <p className="text-3xl font-display font-extrabold text-[#FFC800]">
              <AnimatedCounter target={accuracy} />%
            </p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-[#CE82FF]/10 rounded-2xl flex items-center justify-center text-[#CE82FF] group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px] mb-1">Temas</p>
            <p className="text-3xl font-display font-extrabold text-[#CE82FF]">
              <AnimatedCounter target={allTopics.length} />
            </p>
          </div>
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
              // Find the first topic with uncompleted exercises
              const nextTopic = basicTopics.find(t => t.completed < t.total);
              if (!nextTopic) return basicTopics.length ? `/exercise/${basicTopics[0].exercises[0].id}` : "#";
              const nextIdx = Math.min(nextTopic.completed, nextTopic.total - 1);
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
            href={levelTopics.length ? `/exercise/${levelTopics[0].exercises[0]?.id}` : "#"}
            color="#FF4B4B"
            shadowColor="#EA2B2B"
          />
        </div>
      </div>

      {/* ── Section divider wave ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* ── Camino de Aprendizaje Básico ── */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-100/70 backdrop-blur-sm rounded-2xl flex items-center justify-center text-[#1CB0F6] shadow-lg shadow-blue-200/30">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800">Conceptos Core</h2>
            <p className="text-slate-500 font-bold">Domina los fundamentos de Python paso a paso.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {basicTopics.map((topic, idx) => {
            const isCompleted = topic.completed === topic.total && topic.total > 0;
            const percent = topic.total > 0 ? Math.round((topic.completed / topic.total) * 100) : 0;
            
            // Topic-specific accent colors
            const topicColors = [
              { bg: "bg-blue-50", text: "text-[#1CB0F6]", accent: "#1CB0F6" },
              { bg: "bg-green-50", text: "text-[#58CC02]", accent: "#58CC02" },
              { bg: "bg-yellow-50", text: "text-[#FFC800]", accent: "#FFC800" },
              { bg: "bg-purple-50", text: "text-[#CE82FF]", accent: "#CE82FF" },
              { bg: "bg-red-50", text: "text-[#FF4B4B]", accent: "#FF4B4B" },
              { bg: "bg-teal-50", text: "text-[#1CB0F6]", accent: "#1CB0F6" },
            ];
            const colorSet = topicColors[idx % topicColors.length];
            
            // Topic emojis for visual flair
            const topicEmojis: Record<string, string> = {
              "Variables": "📦",
              "Strings": "🔤",
              "Listas": "📋",
              "Bucles": "🔄",
              "Funciones": "⚙️",
              "Diccionarios": "📖",
            };
            
            return (
              <Link key={topic.name} href={`/exercise/${topic.exercises[Math.min(topic.completed, topic.total - 1)]?.id}`}>
                <div 
                  className={`card-bouncy p-6 h-full flex flex-col backdrop-blur-sm ${isCompleted ? "!border-[#58CC02] !border-b-[6px] bg-[#58CC02]/5" : "bg-white/70"}`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{topicEmojis[topic.name] || "🐍"}</span>
                      <h3 className={`text-2xl font-display font-extrabold ${isCompleted ? "text-[#58CC02]" : "text-slate-700"}`}>
                        {topic.name}
                      </h3>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                      isCompleted ? "bg-[#58CC02] shadow-[0_4px_0_#58A700]" : "bg-[#1CB0F6] shadow-[0_4px_0_#1899D6]"
                    }`}>
                      {isCompleted ? <ShieldCheck className="w-7 h-7" /> : <Play className="w-6 h-6 ml-1" />}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 font-semibold mb-4 flex-1">
                    {topic.total} ejercicios interactivos
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      <span>Progreso:</span>
                      <span className={isCompleted ? "text-[#58CC02]" : ""}>{topic.completed}/{topic.total}</span>
                    </div>
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[#58CC02]' : 'bg-[#FFC800]'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Section divider wave ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-[#FF4B4B]/20 to-transparent" />
      </div>

      {/* ── Niveles de Desafío ── */}
      <div className="max-w-5xl mx-auto px-4 mt-12 pb-10">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-red-100/70 backdrop-blur-sm rounded-2xl flex items-center justify-center text-[#FF4B4B] shadow-lg shadow-red-200/30">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800">Zona de Desafío</h2>
            <p className="text-slate-500 font-bold">Pon a prueba tu lógica y velocidad. Solo para valientes. 🔥</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levelTopics.map((topic) => {
            const isCompleted = topic.completed === topic.total && topic.total > 0;
            const percent = topic.total > 0 ? Math.round((topic.completed / topic.total) * 100) : 0;
            
            // Colores por nivel de desafío (Amarillo -> Rojo -> Púrpura)
            let colorHex = "#FFC800";
            let shadowHex = "#E5B400";
            let bgLight = "bg-yellow-50";
            let Icon = Zap;
            let levelEmoji = "⚡";
            
            if (topic.name === "Difícil") {
              colorHex = "#FF4B4B"; shadowHex = "#EA2B2B"; bgLight = "bg-red-50"; Icon = Flame; levelEmoji = "🔥";
            } else if (topic.name === "Tryhard") {
              colorHex = "#CE82FF"; shadowHex = "#A568CC"; bgLight = "bg-purple-50"; Icon = Skull; levelEmoji = "💀";
            }
            
            return (
              <Link key={topic.name} href={`/exercise/${topic.exercises[Math.min(topic.completed, topic.total - 1)]?.id}`}>
               <div className={`card-bouncy p-6 h-full flex flex-col backdrop-blur-sm ${isCompleted ? "!border-[#58CC02] !border-b-[6px] bg-[#58CC02]/5" : "bg-white/70"}`}
                    style={!isCompleted ? { borderBottomColor: shadowHex, borderColor: colorHex } : {}}>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl uppercase mb-3 text-white"
                            style={{ backgroundColor: isCompleted ? "#58CC02" : colorHex }}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4"/> : <Icon className="w-4 h-4" />}
                        {topic.name}
                      </span>
                      <h3 className="text-xl font-display font-extrabold text-slate-700 flex items-center gap-2">
                        <span>{levelEmoji}</span> {topic.total} Desafíos
                      </h3>
                    </div>
                    {isCompleted ? (
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-[#58CC02] shadow-[0_4px_0_#58A700]">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                           style={{ backgroundColor: colorHex, boxShadow: `0 4px 0 ${shadowHex}` }}>
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      <span>Logro:</span>
                      <span>{topic.completed}/{topic.total}</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%`, backgroundColor: isCompleted ? "#58CC02" : colorHex }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Section divider wave ── */}
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="h-px bg-gradient-to-r from-transparent via-[#58CC02]/20 to-transparent" />
      </div>

      {/* ── Motivational Footer ── */}
      <div className="max-w-3xl mx-auto px-4 mt-10 text-center">
        <div className="bg-gradient-to-r from-primary/10 via-[#58CC02]/10 to-[#FFC800]/10 rounded-3xl p-10 border-2 border-white/50 backdrop-blur-xl shadow-xl shadow-primary/5 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FFC800]/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <span className="text-5xl mb-4 block relative z-10">🐍</span>
          <h3 className="text-2xl font-display font-extrabold text-slate-700 mb-3 relative z-10">
            ¡Cada ejercicio te acerca a ser un experto!
          </h3>
          <p className="text-slate-500 font-semibold relative z-10">
            La práctica constante es la clave del éxito. No te rindas, sigue adelante. 💪
          </p>
        </div>
      </div>
    </div>
  );
}
