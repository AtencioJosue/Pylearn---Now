interface AnswerProgressInput {
  answer: string;
  correct: boolean;
  wasPreviouslyCorrect: boolean;
  baseXp: number;
  doubleOrNothing: boolean;
}

interface AnswerProgressUpdate {
  storedAnswer: {
    answer: string;
    correct: boolean;
  };
  xpEarned: number;
  alreadyCompleted: boolean;
}

export function createAnswerProgressUpdate({
  answer,
  correct,
  wasPreviouslyCorrect,
  baseXp,
  doubleOrNothing,
}: AnswerProgressInput): AnswerProgressUpdate {
  return {
    storedAnswer: {
      answer,
      // A later failed attempt must not erase an exercise that was already mastered.
      correct: wasPreviouslyCorrect || correct,
    },
    xpEarned:
      correct && !wasPreviouslyCorrect
        ? baseXp * (doubleOrNothing ? 2 : 1)
        : 0,
    alreadyCompleted: wasPreviouslyCorrect,
  };
}
