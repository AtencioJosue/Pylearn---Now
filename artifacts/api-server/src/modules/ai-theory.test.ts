import test from "node:test";
import assert from "node:assert/strict";
import { buildTheoryResponse, isTheoryRequest } from "../routes/ai";

test("detecta solicitudes explícitas de teoría", () => {
  assert.equal(isTheoryRequest("Enséñame la teoría paso a paso"), true);
  assert.equal(isTheoryRequest("Explica el concepto desde cero"), true);
  assert.equal(isTheoryRequest("Dame solo una pista"), false);
});

test("construye una microlección completa con un ejemplo independiente", () => {
  const response = buildTheoryResponse(
    "Módulos - Caja de herramientas",
    "Observa el alias importado.",
  );
  for (const section of [
    "Imagen mental",
    "Regla esencial",
    "Ejemplo nuevo",
    "Error frecuente",
    "Comprueba tu comprensión",
  ]) {
    assert.match(response, new RegExp(section));
  }
  assert.match(response, /import numpy as np/);
  assert.match(response, /Observa el alias importado/);
  assert.match(response, /resultado final como \*\*\?\*\*/);
});
