import { useEffect, useMemo, useState } from "react";
import type { AnswerResult, Exercise } from "@workspace/api-client-react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  GripVertical,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseActivityProps {
  exercise: Exercise;
  answer: string;
  onAnswerChange: (answer: string) => void;
  result: AnswerResult | null;
  disabled: boolean;
}

function parseArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function OptionKey({ index }: { index: number }) {
  return <span className="option-key">{String.fromCharCode(65 + index)}</span>;
}

export function ExerciseActivity({
  exercise,
  answer,
  onAnswerChange,
  result,
  disabled,
}: ExerciseActivityProps) {
  const options = exercise.options ?? [];
  const selectedMany = useMemo(() => parseArray(answer), [answer]);
  const [orderedLines, setOrderedLines] = useState<string[]>(() =>
    exercise.type === "order" ? options : [],
  );
  const isAnswered = Boolean(result);

  useEffect(() => {
    if (exercise.type !== "order" || disabled || answer) return;
    setOrderedLines(options);
    onAnswerChange(JSON.stringify(options));
  }, [answer, disabled, exercise.id]);

  const chooseMany = (option: string) => {
    if (disabled) return;
    const next = selectedMany.includes(option)
      ? selectedMany.filter((item) => item !== option)
      : [...selectedMany, option];
    onAnswerChange(JSON.stringify(next));
  };

  const moveLine = (index: number, direction: -1 | 1) => {
    if (disabled) return;
    const target = index + direction;
    if (target < 0 || target >= orderedLines.length) return;
    const next = [...orderedLines];
    [next[index], next[target]] = [next[target], next[index]];
    setOrderedLines(next);
    onAnswerChange(JSON.stringify(next));
  };

  if (exercise.type === "order") {
    return (
      <div className="space-y-3" aria-label="Ordena las líneas de código">
        {orderedLines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={cn(
              "order-line",
              isAnswered && result?.correct && "order-line-correct",
              isAnswered && !result?.correct && "order-line-wrong",
            )}
          >
            <GripVertical className="h-5 w-5 shrink-0 text-slate-300" />
            <span className="order-number">{index + 1}</span>
            <code>{line}</code>
            <div className="ml-auto flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => moveLine(index, -1)}
                disabled={disabled || index === 0}
                aria-label={`Subir línea ${index + 1}`}
              >
                <ChevronUp />
              </button>
              <button
                type="button"
                onClick={() => moveLine(index, 1)}
                disabled={disabled || index === orderedLines.length - 1}
                aria-label={`Bajar línea ${index + 1}`}
              >
                <ChevronDown />
              </button>
            </div>
          </div>
        ))}
        <p className="text-xs font-bold text-slate-400">
          Usa las flechas para colocar cada instrucción en el orden correcto.
        </p>
      </div>
    );
  }

  if (exercise.type === "multiple_select") {
    return (
      <div className="space-y-3">
        <p className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-violet-500">
          <Check className="h-4 w-4" /> Selecciona todas las respuestas
          correctas
        </p>
        {options.map((option, index) => {
          const selected = selectedMany.includes(option);
          const correctOptions = result?.correctAnswer
            ? parseArray(result.correctAnswer)
            : [];
          const isCorrectOption = correctOptions.includes(option);
          return (
            <button
              type="button"
              key={option}
              onClick={() => chooseMany(option)}
              disabled={disabled}
              className={cn(
                "exercise-option",
                selected && !isAnswered && "exercise-option-selected",
                isAnswered && isCorrectOption && "exercise-option-correct",
                isAnswered &&
                  selected &&
                  !isCorrectOption &&
                  "exercise-option-wrong",
              )}
            >
              <span
                className={cn(
                  "multi-check",
                  selected && "multi-check-selected",
                )}
              >
                {selected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <span>{option}</span>
              {isAnswered && isCorrectOption && (
                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  const useOptions =
    (exercise.type === "multiple_choice" ||
      exercise.type === "bug" ||
      exercise.type === "predict_output") &&
    options.length > 1;
  if (useOptions) {
    return (
      <div
        className={cn("space-y-3", exercise.type === "bug" && "bug-options")}
      >
        {exercise.type === "bug" && (
          <div className="bug-file-label">
            <span />
            <span />
            <span />
            <strong>encuentra_el_bug.py</strong>
          </div>
        )}
        {options.map((option, index) => {
          const selected = answer === option;
          const correct = result?.correctAnswer === option;
          return (
            <button
              type="button"
              key={`${option}-${index}`}
              onClick={() => !disabled && onAnswerChange(option)}
              disabled={disabled}
              className={cn(
                "exercise-option",
                exercise.type === "bug" && "bug-line",
                selected && !isAnswered && "exercise-option-selected",
                isAnswered && correct && "exercise-option-correct",
                isAnswered && selected && !correct && "exercise-option-wrong",
                isAnswered && !selected && !correct && "exercise-option-muted",
              )}
            >
              <OptionKey index={index} />
              <code>{option}</code>
              {isAnswered && correct && (
                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0" />
              )}
              {isAnswered && selected && !correct && (
                <XCircle className="ml-auto h-5 w-5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <label
        className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400"
        htmlFor="exercise-answer"
      >
        {exercise.type === "code" ? "Tu solución" : "Tu respuesta"}
      </label>
      <div
        className={cn(
          "answer-editor",
          exercise.type === "code" && "answer-editor-code",
          isAnswered && result?.correct && "answer-editor-correct",
          isAnswered && !result?.correct && "answer-editor-wrong",
        )}
      >
        {exercise.type === "code" && (
          <div className="answer-editor-bar">
            <span />
            <span />
            <span />
            <strong>solucion.py</strong>
          </div>
        )}
        <textarea
          id="exercise-answer"
          rows={exercise.type === "code" ? 8 : 4}
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={
            exercise.type === "code"
              ? "Escribe aquí tu solución en Python..."
              : "Escribe exactamente lo que mostraría la consola..."
          }
        />
      </div>
      <p className="mt-2 text-xs font-bold text-slate-400">
        Consejo: puedes enviar con Ctrl + Enter.
      </p>
    </div>
  );
}

export function hasExerciseAnswer(exercise: Exercise, answer: string): boolean {
  if (exercise.type === "order")
    return parseArray(answer).length === (exercise.options?.length ?? 0);
  if (exercise.type === "multiple_select") return parseArray(answer).length > 0;
  return answer.trim().length > 0;
}
