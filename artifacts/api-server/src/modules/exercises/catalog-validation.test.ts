import assert from "node:assert/strict";
import test from "node:test";
import { exercises } from "../../routes/exercises";
import { validateExerciseCatalog } from "./catalog-validation";

test("el catálogo activo mantiene IDs y respuestas válidas", () => {
  assert.equal(exercises.length, 400);
  assert.deepEqual(validateExerciseCatalog(exercises), []);
});
