import {
  countAnswerBlanks,
  getExpectedAnswerParts,
  parseAnswerParts,
} from "./answer-validation";

interface CatalogExercise {
  id: number;
  title: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
}

export function validateExerciseCatalog(
  exercises: CatalogExercise[],
): string[] {
  const issues: string[] = [];
  const seenIds = new Set<number>();

  for (const exercise of exercises) {
    if (seenIds.has(exercise.id)) {
      issues.push(`ID duplicado: ${exercise.id}`);
    }
    seenIds.add(exercise.id);

    if (
      (exercise.type === "multiple_choice" || exercise.type === "bug") &&
      !exercise.options?.includes(exercise.correctAnswer)
    ) {
      issues.push(
        `Ejercicio ${exercise.id}: la respuesta correcta no aparece en las opciones`,
      );
    }

    if (exercise.type === "multiple_select" || exercise.type === "order") {
      const parsedParts = parseAnswerParts(exercise.correctAnswer);

      if (!exercise.options?.length || !parsedParts?.length) {
        issues.push(
          `Ejercicio ${exercise.id}: necesita opciones y una solución estructurada`,
        );
      } else if (
        parsedParts.some((part) => !exercise.options?.includes(part))
      ) {
        issues.push(
          `Ejercicio ${exercise.id}: la solución contiene una opción inexistente`,
        );
      }
    }

    if (exercise.acceptedAnswers?.some((answer) => !answer.trim())) {
      issues.push(
        `Ejercicio ${exercise.id}: contiene una respuesta alternativa vacía`,
      );
    }

    if (exercise.type === "fill_blank") {
      const blankCount = countAnswerBlanks(exercise.question);
      if (blankCount === 0) {
        issues.push(
          `Ejercicio ${exercise.id}: no contiene espacios para completar`,
        );
      }
      if (!exercise.options?.length) {
        issues.push(
          `Ejercicio ${exercise.id}: no contiene opciones para completar`,
        );
      }
      if (
        getExpectedAnswerParts(exercise.correctAnswer, blankCount).length !==
        blankCount
      ) {
        issues.push(
          `Ejercicio ${exercise.id}: la solución no coincide con sus espacios`,
        );
      }
    }

    if (
      exercise.type === "predict_output" &&
      exercise.correctAnswer.includes("\\n")
    ) {
      issues.push(
        `Ejercicio ${exercise.id}: la salida usa \\n literal en vez de un salto de línea`,
      );
    }
  }

  return issues;
}

export function assertValidExerciseCatalog(exercises: CatalogExercise[]): void {
  const issues = validateExerciseCatalog(exercises);
  if (issues.length > 0) {
    throw new Error(
      `Catálogo de ejercicios inválido:\n- ${issues.join("\n- ")}`,
    );
  }
}
