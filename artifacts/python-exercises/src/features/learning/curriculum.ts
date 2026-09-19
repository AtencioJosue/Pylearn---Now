import type { Exercise } from "@workspace/api-client-react";

export interface CurriculumUnit {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  shadow: string;
  topics: string[];
  skills: string[];
}

export interface CourseLesson {
  id: string;
  topic: string;
  title: string;
  exercises: Exercise[];
  completed: number;
  total: number;
  isComplete: boolean;
  isLocked: boolean;
  href: string;
}

export interface CourseUnitProgress extends CurriculumUnit {
  lessons: CourseLesson[];
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
  isLocked: boolean;
}

export const CURRICULUM: CurriculumUnit[] = [
  {
    id: "variables",
    eyebrow: "Unidad 1",
    title: "El despertar de las variables",
    description:
      "Guarda datos, reconoce sus tipos y empieza a pensar como Python.",
    icon: "📦",
    color: "#15a4e0",
    shadow: "#0b7fb4",
    topics: [
      "Variables",
      "Variables básicas - Misión 1",
      "Variables básicas - Misión 2",
    ],
    skills: ["Asignación", "Tipos", "Entrada y salida"],
  },
  {
    id: "strings",
    eyebrow: "Unidad 2",
    title: "El bosque de los textos",
    description:
      "Transforma mensajes, domina índices y construye cadenas dinámicas.",
    icon: "💬",
    color: "#8b5cf6",
    shadow: "#6d3fd1",
    topics: [
      "Strings",
      "Strings básicas - Misión 1",
      "Strings básicas - Misión 2",
    ],
    skills: ["Strings", "Métodos", "Formato"],
  },
  {
    id: "conditionals",
    eyebrow: "Unidad 3",
    title: "El templo de las decisiones",
    description: "Crea programas que eligen rutas según sus datos.",
    icon: "🧭",
    color: "#f59e0b",
    shadow: "#c97904",
    topics: ["Condicionales - Decisiones inteligentes"],
    skills: ["if", "elif", "Lógica"],
  },
  {
    id: "lists",
    eyebrow: "Unidad 4",
    title: "La mochila de colecciones",
    description:
      "Organiza muchos valores y aprende a encontrarlos y transformarlos.",
    icon: "🎒",
    color: "#ec4899",
    shadow: "#be2e73",
    topics: [
      "Listas",
      "Listas básicas - Misión 1",
      "Listas básicas - Misión 2",
      "Tuplas y conjuntos - Colecciones únicas",
    ],
    skills: ["Listas", "Tuplas", "Sets"],
  },
  {
    id: "loops",
    eyebrow: "Unidad 5",
    title: "El circuito de los bucles",
    description: "Automatiza tareas repetitivas y controla cada recorrido.",
    icon: "🔁",
    color: "#06b6d4",
    shadow: "#078ba3",
    topics: [
      "Bucles",
      "Bucles básicas - Misión 1",
      "Bucles básicas - Misión 2",
    ],
    skills: ["for", "while", "range"],
  },
  {
    id: "functions",
    eyebrow: "Unidad 6",
    title: "El taller de funciones",
    description:
      "Divide problemas grandes en herramientas pequeñas y reutilizables.",
    icon: "⚙️",
    color: "#ef4444",
    shadow: "#c62f2f",
    topics: [
      "Funciones",
      "Funciones básicas - Misión 1",
      "Funciones básicas - Misión 2",
    ],
    skills: ["Parámetros", "return", "Alcance"],
  },
  {
    id: "dictionaries",
    eyebrow: "Unidad 7",
    title: "La biblioteca de diccionarios",
    description:
      "Relaciona claves y valores para modelar información del mundo real.",
    icon: "📚",
    color: "#22c55e",
    shadow: "#168c3d",
    topics: [
      "Diccionarios",
      "Diccionarios básicas - Misión 1",
      "Diccionarios básicas - Misión 2",
    ],
    skills: ["Claves", "Valores", "Datos anidados"],
  },
  {
    id: "errors",
    eyebrow: "Unidad 8",
    title: "El laboratorio de errores",
    description:
      "Investiga fallos, protege el programa y comunica problemas con claridad.",
    icon: "🧪",
    color: "#f97316",
    shadow: "#c6530e",
    topics: ["Errores - Laboratorio de bugs"],
    skills: ["try", "except", "raise"],
  },
  {
    id: "files-modules",
    eyebrow: "Unidad 9",
    title: "La expedición de herramientas",
    description:
      "Trabaja con archivos e incorpora módulos de la biblioteca estándar.",
    icon: "🧰",
    color: "#0ea5e9",
    shadow: "#087cad",
    topics: [
      "Archivos - Expedición de datos",
      "Módulos - Caja de herramientas",
    ],
    skills: ["Archivos", "with", "Imports"],
  },
  {
    id: "oop",
    eyebrow: "Unidad 10",
    title: "La academia de objetos",
    description: "Crea clases con estado, comportamiento y poderes heredados.",
    icon: "🏛️",
    color: "#6366f1",
    shadow: "#4447bd",
    topics: ["POO - Academia de objetos"],
    skills: ["Clases", "Métodos", "Herencia"],
  },
  {
    id: "pythonic",
    eyebrow: "Unidad 11",
    title: "La forja pythónica",
    description:
      "Escribe transformaciones expresivas y resuelve problemas con estrategia.",
    icon: "✨",
    color: "#a855f7",
    shadow: "#7e35c0",
    topics: [
      "Comprensiones - Atajos pythónicos",
      "Algoritmos - Desafíos de lógica",
      "Intermedio",
      "Difícil",
      "Tryhard",
    ],
    skills: ["Comprensiones", "Algoritmos", "Buenas prácticas"],
  },
  {
    id: "final-project",
    eyebrow: "Unidad 12",
    title: "Pylearn Quest",
    description:
      "Combina todo lo aprendido para diseñar una aventura completa.",
    icon: "🏆",
    color: "#eab308",
    shadow: "#b78a03",
    topics: ["Proyecto final - Pylearn Quest"],
    skills: ["Diseño", "Validación", "Proyecto final"],
  },
];

function lessonTitle(topic: string): string {
  return topic
    .replace(/ básicas?/gi, "")
    .replace(/ - Misión/gi, " · Misión")
    .replace(/ - /g, " · ");
}

export function buildCourse(
  exercises: Exercise[],
  topicProgress: Record<string, number> = {},
): CourseUnitProgress[] {
  let previousUnitComplete = true;

  return CURRICULUM.map((unit, unitIndex) => {
    const isLocked = unitIndex > 0 && !previousUnitComplete;
    let previousLessonComplete = true;
    const lessons: CourseLesson[] = [];

    for (const topic of unit.topics) {
      const topicExercises = exercises
        .filter((exercise) => exercise.topic === topic)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const topicCompleted = Math.min(
        topicProgress[topic] ?? 0,
        topicExercises.length,
      );
      const exerciseGroups = new Map<string, Exercise[]>();

      for (const exercise of topicExercises) {
        const groupName = exercise.lesson ?? lessonTitle(topic);
        exerciseGroups.set(groupName, [
          ...(exerciseGroups.get(groupName) ?? []),
          exercise,
        ]);
      }

      let exercisesBeforeLesson = 0;
      for (const [groupName, lessonExercises] of exerciseGroups) {
        const completed = Math.min(
          lessonExercises.length,
          Math.max(0, topicCompleted - exercisesBeforeLesson),
        );
        const lessonLocked = isLocked || !previousLessonComplete;
        const nextExercise =
          lessonExercises[
            Math.min(completed, Math.max(lessonExercises.length - 1, 0))
          ];
        const lesson: CourseLesson = {
          id: `${topic}:${groupName}`,
          topic,
          title: groupName,
          exercises: lessonExercises,
          completed,
          total: lessonExercises.length,
          isComplete:
            lessonExercises.length > 0 && completed >= lessonExercises.length,
          isLocked: lessonLocked,
          href: nextExercise ? `/exercise/${nextExercise.id}` : "#",
        };
        previousLessonComplete =
          completed >= Math.min(lessonExercises.length, 8);
        exercisesBeforeLesson += lessonExercises.length;
        if (lesson.total > 0) lessons.push(lesson);
      }
    }

    const total = lessons.reduce((sum, lesson) => sum + lesson.total, 0);
    const completed = lessons.reduce(
      (sum, lesson) => sum + lesson.completed,
      0,
    );
    const isComplete = total > 0 && completed >= total;
    // A learner unlocks the next world after proving the fundamentals of this one.
    // This keeps momentum without forcing every optional challenge first.
    previousUnitComplete = completed >= Math.min(total, 8);

    return {
      ...unit,
      lessons,
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0,
      isComplete,
      isLocked,
    };
  });
}

export function getContinueLesson(
  course: CourseUnitProgress[],
): CourseLesson | undefined {
  return course
    .flatMap((unit) => unit.lessons)
    .find((lesson) => !lesson.isLocked && !lesson.isComplete);
}

export function getUnitForTopic(topic: string): CurriculumUnit | undefined {
  return CURRICULUM.find((unit) => unit.topics.includes(topic));
}
