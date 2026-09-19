export type Difficulty = "beginner" | "intermediate" | "advanced" | "tryhard";

export type ExerciseType =
  | "multiple_choice"
  | "multiple_select"
  | "fill_blank"
  | "predict_output"
  | "bug"
  | "order"
  | "code";

export interface ExerciseData {
  id: number;
  title: string;
  description: string;
  topic: string;
  difficulty: Difficulty;
  type: ExerciseType;
  question: string;
  options?: string[];
  hint?: string;
  explanation: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  orderIndex: number;
  coins?: number;
  xp?: number;
  theme?: string;
  pytoReaction?: string;
  lesson?: string;
  skills?: string[];
}
