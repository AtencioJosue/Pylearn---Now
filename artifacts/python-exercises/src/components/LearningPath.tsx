import { Link } from "wouter";
import { CheckCircle2, Lock, Play } from "lucide-react";

interface Topic {
  name: string;
  total: number;
  completed: number;
  exercises: { id: number }[];
}

interface LearningPathProps {
  topics: Topic[];
  isChallenge?: boolean;
}

function getTopicMeta(topicName: string) {
  const name = topicName.toLowerCase();
  if (name.includes("variable"))
    return {
      emoji: "📦",
      color: "var(--color-marca-azul)",
      shadow: "var(--sombra-marca-azul)",
      bg: "bg-sky-50/50 dark:bg-slate-800/40",
    };
  if (name.includes("booleano") || name.includes("none"))
    return {
      emoji: "🧠",
      color: "#FF8F00",
      shadow: "#E65100",
      bg: "bg-amber-50/50 dark:bg-slate-800/40",
    };
  if (name.includes("string") || name.includes("texto"))
    return {
      emoji: "🔤",
      color: "var(--color-marca-verde)",
      shadow: "var(--sombra-marca-verde)",
      bg: "bg-emerald-50/50 dark:bg-slate-800/40",
    };
  if (name.includes("lista") || name.includes("inventario"))
    return {
      emoji: "📋",
      color: "#FFC800",
      shadow: "#E5A000",
      bg: "bg-yellow-50/50 dark:bg-slate-800/40",
    };
  if (name.includes("diccionario") || name.includes("dato"))
    return {
      emoji: "📖",
      color: "#00C3FF",
      shadow: "#0099C6",
      bg: "bg-cyan-50/50 dark:bg-slate-800/40",
    };
  if (
    name.includes("bucle") ||
    name.includes("tiempo") ||
    name.includes("iterar")
  )
    return {
      emoji: "🔄",
      color: "#CE82FF",
      shadow: "#A568CC",
      bg: "bg-purple-50/50 dark:bg-slate-800/40",
    };
  if (name.includes("funcion") || name.includes("función"))
    return {
      emoji: "⚙️",
      color: "#FF4B4B",
      shadow: "#EA2B2B",
      bg: "bg-red-50/50 dark:bg-slate-800/40",
    };
  return {
    emoji: "🐍",
    color: "var(--color-marca-azul)",
    shadow: "var(--sombra-marca-azul)",
    bg: "bg-teal-50/50 dark:bg-slate-800/40",
  };
}

/* zigzag positions */
const POSITIONS = ["left", "center", "right"] as const;
type Position = (typeof POSITIONS)[number];

function posClass(pos: Position) {
  if (pos === "left") return "ml-0 mr-auto md:translate-x-[40px]";
  if (pos === "right") return "ml-auto mr-0 md:translate-x-[-40px]";
  return "mx-auto";
}

export function LearningPath({ topics }: LearningPathProps) {
  return (
    <div className="relative max-w-xl mx-auto px-4 py-8 select-none">
      {topics.map((topic, idx) => {
        const meta = getTopicMeta(topic.name);
        const isCompleted = topic.completed >= topic.total && topic.total > 0;
        const isLocked =
          idx > 0 && topics[idx - 1].completed < topics[idx - 1].total;
        const percent =
          topic.total > 0
            ? Math.round((topic.completed / topic.total) * 100)
            : 0;
        const pos: Position = POSITIONS[idx % 3];
        const href = isLocked
          ? "#"
          : `/exercise/${topic.exercises[Math.min(topic.completed, topic.total - 1)]?.id}`;

        const activeBorderColor = isCompleted
          ? "var(--color-marca-verde)"
          : isLocked
            ? "var(--linea-conexion)"
            : "var(--color-marca-azul)";

        return (
          <div key={topic.name} className="flex flex-col items-stretch">
            {/* Línea conectora entre mundos */}
            {idx > 0 && (
              <div className="flex justify-center my-0.5">
                <div
                  className="w-1.5 h-12 rounded-full transition-colors"
                  style={{
                    backgroundColor: "var(--linea-conexion)",
                  }}
                />
              </div>
            )}

            {/* Tarjeta Rectangular con Súper Curvatura (rounded-3xl) de la primera imagen */}
            <div
              className={`w-[320px] max-w-full ${posClass(pos)} transition-transform duration-300 hover:scale-[1.02]`}
            >
              <Link href={href}>
                <div
                  className={`relative flex items-center gap-4 p-4 rounded-3xl border-2 border-b-[6px] transition-all cursor-pointer bg-[var(--bg-tarjetas)]
                    ${isLocked ? "opacity-60 grayscale cursor-not-allowed" : "hover:translate-y-[-2px] hover:shadow-md active:translate-y-[4px] active:border-b-2"}
                  `}
                  style={{
                    borderColor: activeBorderColor,
                    borderBottomColor: isCompleted
                      ? "var(--sombra-marca-verde)"
                      : isLocked
                        ? "var(--linea-conexion)"
                        : "var(--sombra-marca-azul)",
                    boxShadow: isLocked
                      ? "none"
                      : "0 4px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Círculo indicador izquierdo */}
                  <div className="relative w-14 h-14 shrink-0">
                    <div
                      className="absolute inset-0 rounded-full flex items-center justify-center text-xl text-white transition-all"
                      style={{
                        backgroundColor: isCompleted
                          ? "var(--color-marca-verde)"
                          : isLocked
                            ? "var(--gris-bloqueado)"
                            : "var(--color-marca-azul)",
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-white stroke-[3px]" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-white/80" />
                      ) : (
                        <span className="scale-110">{meta.emoji}</span>
                      )}
                    </div>
                  </div>

                  {/* Textos y barra de progreso */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-base text-[var(--texto-principal)] leading-tight truncate">
                      {topic.name}
                    </p>
                    <p
                      className="text-xs font-black mt-0.5"
                      style={{
                        color: isCompleted
                          ? "var(--color-marca-verde)"
                          : isLocked
                            ? "var(--gris-bloqueado)"
                            : "var(--color-marca-azul)",
                      }}
                    >
                      {isCompleted
                        ? "¡Completado! ✅"
                        : isLocked
                          ? "Bloqueado 🔒"
                          : `${topic.completed} / ${topic.total} lecciones`}
                    </p>

                    {/* Barra de progreso redondeada */}
                    {!isLocked && (
                      <div className="mt-2.5 w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: isCompleted
                              ? "var(--color-marca-verde)"
                              : "var(--color-marca-azul)",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Play button circular derecho para indicar acción */}
                  {!isLocked && !isCompleted && (
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                      style={{
                        backgroundColor: "var(--color-marca-azul)",
                        boxShadow: "0 2px 0 var(--sombra-marca-azul)",
                      }}
                    >
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
