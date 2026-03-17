import { useGetExercises, useGetProgress } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Code2, Brain, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export function Home() {
  const { data: exercises, isLoading: loadingEx } = useGetExercises();
  const { data: progress, isLoading: loadingProg } = useGetProgress();

  if (loadingEx || loadingProg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topicsMap = exercises?.reduce((acc, ex) => {
    if (!acc[ex.topic]) {
      acc[ex.topic] = [];
    }
    acc[ex.topic].push(ex);
    return acc;
  }, {} as Record<string, typeof exercises>) || {};

  const topics = Object.entries(topicsMap).map(([name, exs]) => ({
    name,
    exercises: exs.sort((a, b) => a.orderIndex - b.orderIndex),
    total: exs.length,
    completed: progress?.topicProgress?.[name] || 0,
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Sección Principal */}
      <div className="relative overflow-hidden bg-white border-b border-border/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Fondo educativo abstracto" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/90" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6"
              >
                <Code2 className="w-4 h-4" />
                Python para principiantes
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold font-display text-foreground leading-tight mb-6"
              >
                Aprende Python <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  una línea a la vez.
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0 mb-8 leading-relaxed"
              >
                Ejercicios interactivos, retroalimentación inmediata y explicaciones claras. Construye tu intuición de programación hoy.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-1 w-full max-w-sm hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 to-primary/40 blur-3xl rounded-full" />
                <img 
                  src={`${import.meta.env.BASE_URL}images/python-mascot.png`} 
                  alt="Mascota amigable de Python" 
                  className="w-full h-auto drop-shadow-2xl relative z-10 hover:-translate-y-2 transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resumen de progreso */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border p-6 flex items-center justify-around flex-wrap gap-8">
          <div className="text-center">
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm mb-1">Total de ejercicios</p>
            <p className="text-4xl font-display font-bold text-foreground">{progress?.totalExercises || 0}</p>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block"></div>
          <div className="text-center">
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm mb-1">Completados</p>
            <p className="text-4xl font-display font-bold text-primary">{progress?.completedExercises || 0}</p>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block"></div>
          <div className="text-center">
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm mb-1">Precisión</p>
            <p className="text-4xl font-display font-bold text-success">
              {progress?.totalExercises ? Math.round((progress.correctAnswers / progress.completedExercises) * 100) || 0 : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Cuadrícula de temas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-display font-bold">Elige un tema</h2>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {topics.map((topic) => {
            const isCompleted = topic.completed === topic.total;
            const percent = Math.round((topic.completed / topic.total) * 100);
            
            return (
              <motion.div key={topic.name} variants={item}>
                <Link 
                  href={`/exercise/${topic.exercises[0]?.id}`}
                  className={`block h-full bg-white rounded-3xl p-6 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group
                    ${isCompleted ? 'border-success/30 hover:border-success/60' : 'border-transparent hover:border-primary/30'}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-muted-foreground">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                      <span>{percent}% completado</span>
                      <span>{topic.completed} / {topic.total}</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
