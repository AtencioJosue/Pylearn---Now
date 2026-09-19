import test from "node:test";
import assert from "node:assert/strict";
import { getTheoryLesson } from "./theoryLessons.ts";

test("matches specific lessons despite accents and mission suffixes", () => {
  assert.match(
    getTheoryLesson({ topic: "Variables básicas - Misión 2" }).title,
    /Variables/,
  );
  assert.match(
    getTheoryLesson({ topic: "Módulos - Caja de herramientas" }).title,
    /Módulos/,
  );
  assert.match(
    getTheoryLesson({ topic: "Búsqueda avanzada" }).title,
    /Búsqueda/,
  );
});

test("builds a contextual generic lesson for an unknown topic", () => {
  const lesson = getTheoryLesson({
    topic: "Decoradores",
    exerciseTitle: "Registrar llamadas",
    description: "Comprender cómo una función envuelve a otra.",
    question: "@registrar\ndef saludar():\n    pass",
    hint: "Observa qué función recibe el decorador.",
  });
  assert.match(lesson.title, /Decoradores/);
  assert.match(lesson.objective, /envuelve/);
  assert.match(lesson.code, /@registrar/);
  assert.match(lesson.correction, /decorador/);
  assert.equal(lesson.quiz.options.length, 3);
});
