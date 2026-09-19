import assert from "node:assert/strict";
import test from "node:test";
import { createAnswerProgressUpdate } from "./progress-update";

test("otorga XP al resolver por primera vez", () => {
  const update = createAnswerProgressUpdate({
    answer: "42",
    correct: true,
    wasPreviouslyCorrect: false,
    baseXp: 20,
    doubleOrNothing: false,
  });

  assert.equal(update.xpEarned, 20);
  assert.equal(update.storedAnswer.correct, true);
  assert.equal(update.alreadyCompleted, false);
});

test("duplica el XP solo en el primer acierto", () => {
  const firstUpdate = createAnswerProgressUpdate({
    answer: "42",
    correct: true,
    wasPreviouslyCorrect: false,
    baseXp: 20,
    doubleOrNothing: true,
  });
  const repeatedUpdate = createAnswerProgressUpdate({
    answer: "42",
    correct: true,
    wasPreviouslyCorrect: true,
    baseXp: 20,
    doubleOrNothing: true,
  });

  assert.equal(firstUpdate.xpEarned, 40);
  assert.equal(repeatedUpdate.xpEarned, 0);
  assert.equal(repeatedUpdate.alreadyCompleted, true);
});

test("un fallo posterior no borra un ejercicio completado", () => {
  const update = createAnswerProgressUpdate({
    answer: "respuesta incorrecta",
    correct: false,
    wasPreviouslyCorrect: true,
    baseXp: 20,
    doubleOrNothing: false,
  });

  assert.equal(update.storedAnswer.correct, true);
  assert.equal(update.xpEarned, 0);
});
