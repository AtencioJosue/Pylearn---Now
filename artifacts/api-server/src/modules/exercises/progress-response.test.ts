import assert from "node:assert/strict";
import test from "node:test";
import { buildProgressResponse } from "../../routes/exercises";
import { createEmptyUserProgress } from "./user-progress";

test("separa ejercicios completados de aciertos totales", () => {
  const progress = createEmptyUserProgress();
  progress.answers["1"] = { answer: "x = 10", correct: true };
  progress.answers["2"] = { answer: "7", correct: false };
  progress.totalAttempts = 4;
  progress.correctAttempts = 3;

  const response = buildProgressResponse(progress);

  assert.equal(response.completedExercises, 1);
  assert.equal(response.correctAnswers, 3);
  assert.equal(response.totalAttempts, 4);
  assert.deepEqual(response.reviewExerciseIds, [2]);
  assert.equal(response.topicProgress.Variables, 1);
});
