import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzePythonSemantics,
  type PythonSemanticKind,
} from "./pythonEditor.ts";

function valuesFor(source: string, kind: PythonSemanticKind) {
  return analyzePythonSemantics(source)
    .filter((token) => token.kind === kind)
    .map((token) => source.slice(token.start, token.start + token.length));
}

test("recognizes imported modules, aliases and library methods", () => {
  const source = `import numpy as np
import pandas

datos = np.array([1, 2, 3])
tabla = pandas.DataFrame({"valor": datos})
`;
  assert.ok(
    valuesFor(source, "module").filter((value) => value === "np").length >= 2,
  );
  assert.ok(valuesFor(source, "module").includes("pandas"));
  assert.ok(valuesFor(source, "method").includes("array"));
  assert.ok(valuesFor(source, "method").includes("DataFrame"));
});

test("keeps comments and strings out of semantic analysis", () => {
  const source = `import numpy as np
texto = "🙂 np.hidden()"
# np.fake()
valor = np.mean([1, 2])
`;
  assert.ok(valuesFor(source, "method").includes("mean"));
  assert.ok(!valuesFor(source, "method").includes("hidden"));
  assert.ok(!valuesFor(source, "method").includes("fake"));
  const mean = analyzePythonSemantics(source).find(
    (token) =>
      token.kind === "method" &&
      source.slice(token.start, token.start + token.length) === "mean",
  );
  assert.equal(source.slice(mean!.start, mean!.start + mean!.length), "mean");
});

test("distinguishes declarations, parameters, constants and builtins", () => {
  const source = `MAX_INTENTOS = 3

class Alumno:
    def saludar(self, nombre):
        print(nombre.upper())

alumno = Alumno()
alumno.saludar("Ada")
`;
  assert.ok(valuesFor(source, "constant").includes("MAX_INTENTOS"));
  assert.ok(valuesFor(source, "class").includes("Alumno"));
  assert.ok(valuesFor(source, "function").includes("saludar"));
  assert.ok(valuesFor(source, "parameter").includes("nombre"));
  assert.ok(valuesFor(source, "builtin").includes("print"));
  assert.ok(valuesFor(source, "method").includes("upper"));
});
