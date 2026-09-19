import assert from "node:assert/strict";
import test from "node:test";
import {
  areAnswersEquivalent,
  areUnorderedAnswersEquivalent,
  countAnswerBlanks,
} from "./answer-validation";

test("normaliza mayúsculas, acentos, comillas y espacios", () => {
  assert.equal(
    areAnswersEquivalent('print( "camión" )', "PRINT('camion')"),
    true,
  );
});

test("compara cada bloque de una respuesta estructurada", () => {
  assert.equal(
    areAnswersEquivalent(
      JSON.stringify(['"Mbappé"', "250.5", "True"]),
      '"Mbappé",250.5,True',
      {
        blankCount: 3,
      },
    ),
    true,
  );
});

test("permite reutilizar una misma opción en varios espacios", () => {
  assert.equal(
    areAnswersEquivalent(JSON.stringify(['"""', '"""']), '"""', {
      blankCount: 2,
    }),
    true,
  );
});

test("mantiene compatibilidad con respuestas de clientes anteriores", () => {
  assert.equal(
    areAnswersEquivalent("sorted,reverse", "sorted,reverse", { blankCount: 2 }),
    true,
  );
});

test("cuenta los espacios del ejercicio", () => {
  assert.equal(countAnswerBlanks("inicio ___ medio ___ fin"), 2);
});

test("acepta selecciones múltiples sin depender del orden", () => {
  assert.equal(
    areUnorderedAnswersEquivalent(
      JSON.stringify(["TypeError", "ValueError"]),
      JSON.stringify(["ValueError", "TypeError"]),
    ),
    true,
  );
});

test("rechaza selecciones múltiples incompletas", () => {
  assert.equal(
    areUnorderedAnswersEquivalent(
      JSON.stringify(["ValueError"]),
      JSON.stringify(["ValueError", "TypeError"]),
    ),
    false,
  );
});
