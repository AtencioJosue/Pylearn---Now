const ANSWER_BLANK = "___";

export function countAnswerBlanks(question: string): number {
  return question.split(ANSWER_BLANK).length - 1;
}

export function normalizeAnswer(answer: string): string {
  return (answer || "")
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function areScalarAnswersEquivalent(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const user = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(correctAnswer);

  if (user === correct || user.toLowerCase() === correct.toLowerCase())
    return true;

  // Python accepts either quote style for the same string literal.
  const userQuotes = user.replace(/"/g, "'");
  const correctQuotes = correct.replace(/"/g, "'");
  if (
    userQuotes === correctQuotes ||
    userQuotes.toLowerCase() === correctQuotes.toLowerCase()
  ) {
    return true;
  }

  const stripOperatorSpaces = (value: string) =>
    value.replace(/\s*([=+\-*/:,()\[\]{}])\s*/g, "$1").trim();
  const compactUser = stripOperatorSpaces(userQuotes);
  const compactCorrect = stripOperatorSpaces(correctQuotes);

  return (
    compactUser === compactCorrect ||
    compactUser.toLowerCase() === compactCorrect.toLowerCase()
  );
}

export function parseAnswerParts(answer: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(answer);
    if (
      Array.isArray(parsed) &&
      parsed.every((part) => typeof part === "string")
    ) {
      return parsed;
    }
  } catch {
    // Older clients send one plain string; it is handled by the scalar comparison.
  }

  return null;
}

export function getExpectedAnswerParts(
  correctAnswer: string,
  blankCount: number,
): string[] {
  const structured = parseAnswerParts(correctAnswer);
  if (structured?.length === blankCount) return structured;

  const commaSeparated = correctAnswer.split(",").map((part) => part.trim());
  if (blankCount > 1 && commaSeparated.length === blankCount) {
    return commaSeparated;
  }

  // A single supplied solution can be reused in every blank, as with paired quotes.
  return Array(Math.max(blankCount, 1)).fill(correctAnswer.trim());
}

interface AnswerComparisonOptions {
  blankCount?: number;
}

export function areAnswersEquivalent(
  userAnswer: string,
  correctAnswer: string,
  options: AnswerComparisonOptions = {},
): boolean {
  const userParts = parseAnswerParts(userAnswer);
  if (userParts) {
    const expectedParts = getExpectedAnswerParts(
      correctAnswer,
      options.blankCount ?? userParts.length,
    );

    return (
      userParts.length === expectedParts.length &&
      userParts.every((part, index) =>
        areScalarAnswersEquivalent(part, expectedParts[index] ?? ""),
      )
    );
  }

  return areScalarAnswersEquivalent(userAnswer, correctAnswer);
}

export function areUnorderedAnswersEquivalent(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const userParts = parseAnswerParts(userAnswer);
  const correctParts = parseAnswerParts(correctAnswer);
  if (!userParts || !correctParts || userParts.length !== correctParts.length) {
    return false;
  }

  const normalizedUser = userParts.map(normalizeAnswer).sort();
  const normalizedCorrect = correctParts.map(normalizeAnswer).sort();
  return normalizedUser.every(
    (answer, index) =>
      answer.toLowerCase() === normalizedCorrect[index]?.toLowerCase(),
  );
}
