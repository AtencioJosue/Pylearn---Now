import type { Monaco, OnMount } from "@monaco-editor/react";

export type PythonSemanticKind =
  | "module"
  | "imported"
  | "function"
  | "method"
  | "class"
  | "parameter"
  | "constant"
  | "builtin"
  | "decorator"
  | "property";

export interface PythonSemanticToken {
  start: number;
  length: number;
  kind: PythonSemanticKind;
}

type EditorInstance = Parameters<OnMount>[0];
interface CompletionModel {
  getLineContent(lineNumber: number): string;
  getValue(): string;
}
interface CompletionPosition {
  lineNumber: number;
  column: number;
}

const BUILTINS = new Set([
  "abs",
  "all",
  "any",
  "bool",
  "dict",
  "enumerate",
  "filter",
  "float",
  "input",
  "int",
  "isinstance",
  "len",
  "list",
  "map",
  "max",
  "min",
  "next",
  "open",
  "print",
  "range",
  "reversed",
  "round",
  "set",
  "sorted",
  "str",
  "sum",
  "super",
  "tuple",
  "type",
  "zip",
]);

const KEYWORDS = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "case",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "False",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "match",
  "None",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "True",
  "try",
  "while",
  "with",
  "yield",
]);

const PRIORITY: Record<PythonSemanticKind, number> = {
  module: 100,
  class: 95,
  decorator: 90,
  method: 85,
  function: 80,
  imported: 75,
  builtin: 70,
  constant: 60,
  parameter: 55,
  property: 50,
};

const MODULE_MEMBERS: Record<string, Array<[string, string]>> = {
  numpy: [
    ["array", "Crea un arreglo de NumPy"],
    ["arange", "Genera valores dentro de un intervalo"],
    ["linspace", "Genera valores espaciados uniformemente"],
    ["zeros", "Crea un arreglo lleno de ceros"],
    ["ones", "Crea un arreglo lleno de unos"],
    ["mean", "Calcula la media"],
    ["sum", "Suma elementos"],
    ["reshape", "Cambia la forma de un arreglo"],
    ["dot", "Calcula un producto matricial"],
    ["sqrt", "Calcula la raíz cuadrada"],
  ],
  pandas: [
    ["DataFrame", "Crea una tabla de datos"],
    ["Series", "Crea una serie etiquetada"],
    ["read_csv", "Lee datos desde un archivo CSV"],
    ["concat", "Combina objetos de pandas"],
    ["merge", "Une tablas por columnas relacionadas"],
  ],
  "matplotlib.pyplot": [
    ["plot", "Dibuja una gráfica de líneas"],
    ["scatter", "Dibuja un gráfico de dispersión"],
    ["bar", "Dibuja un gráfico de barras"],
    ["figure", "Crea una nueva figura"],
    ["title", "Define el título del gráfico"],
    ["xlabel", "Etiqueta el eje X"],
    ["ylabel", "Etiqueta el eje Y"],
    ["show", "Muestra la figura"],
  ],
  pylearn: [
    ["pantalla", "Abre la pantalla del juego"],
    ["limpiar", "Pinta el fondo del siguiente fotograma"],
    ["rectangulo", "Dibuja un rectángulo"],
    ["circulo", "Dibuja un círculo"],
    ["linea", "Dibuja una línea"],
    ["texto", "Escribe texto en la pantalla"],
    ["poligono", "Dibuja una figura con varios puntos"],
    ["imagen", "Dibuja una imagen del proyecto"],
    ["tecla", "Indica si una tecla está pulsada"],
    ["actualizar", "Muestra el fotograma y controla la velocidad"],
    ["Juego", "Crea un juego con una interfaz orientada a objetos"],
  ],
  pygame: [
    ["init", "Inicia el modo de juego compatible con la web"],
    ["display", "Configura y actualiza la pantalla del juego"],
    ["draw", "Dibuja rectángulos, círculos, líneas y polígonos"],
    ["event", "Lee teclado, ratón y cierre del juego"],
    ["key", "Consulta las teclas pulsadas"],
    ["mouse", "Consulta la posición y botones del ratón"],
    ["font", "Crea y dibuja texto"],
    ["image", "Carga imágenes incluidas en el proyecto"],
    ["time", "Controla la velocidad del juego"],
    ["Rect", "Representa un rectángulo y detecta colisiones"],
    ["Vector2", "Representa una posición o velocidad 2D"],
  ],
  turtle: [
    ["Turtle", "Crea una tortuga para dibujar"],
    ["Screen", "Configura la pantalla de Turtle"],
    ["forward", "Avanza dibujando"],
    ["backward", "Retrocede dibujando"],
    ["left", "Gira a la izquierda"],
    ["right", "Gira a la derecha"],
    ["circle", "Dibuja un círculo o arco"],
    ["done", "Muestra el dibujo terminado"],
  ],
  tkinter: [
    ["Tk", "Crea una interfaz dentro de la pantalla web"],
    ["Canvas", "Crea un lienzo para figuras y animaciones"],
    ["Label", "Muestra un texto"],
    ["Button", "Crea un botón básico"],
    ["Entry", "Crea un campo de texto básico"],
    ["PhotoImage", "Carga una imagen del proyecto"],
  ],
  requests: [
    ["get", "Realiza una solicitud HTTP GET"],
    ["post", "Realiza una solicitud HTTP POST"],
    ["put", "Realiza una solicitud HTTP PUT"],
    ["delete", "Realiza una solicitud HTTP DELETE"],
  ],
};

function maskStringsAndComments(source: string): string {
  const masked = source.split("");
  let index = 0;
  const blank = (start: number, end: number) => {
    for (let cursor = start; cursor < end; cursor += 1) {
      if (masked[cursor] !== "\n" && masked[cursor] !== "\r")
        masked[cursor] = " ";
    }
  };

  while (index < source.length) {
    if (source[index] === "#") {
      const end = source.indexOf("\n", index);
      const commentEnd = end === -1 ? source.length : end;
      blank(index, commentEnd);
      index = commentEnd;
      continue;
    }
    if (source[index] !== '"' && source[index] !== "'") {
      index += 1;
      continue;
    }

    const quote = source[index];
    const triple = source.slice(index, index + 3) === quote.repeat(3);
    const markerLength = triple ? 3 : 1;
    let cursor = index + markerLength;
    while (cursor < source.length) {
      if (source[cursor] === "\\") {
        cursor += 2;
        continue;
      }
      if (
        triple
          ? source.slice(cursor, cursor + 3) === quote.repeat(3)
          : source[cursor] === quote
      ) {
        cursor += markerLength;
        break;
      }
      cursor += 1;
    }
    blank(index, Math.min(cursor, source.length));
    index = Math.max(cursor, index + markerLength);
  }
  return masked.join("");
}

function addPathTokens(
  add: (start: number, length: number, kind: PythonSemanticKind) => void,
  path: string,
  pathStart: number,
  kind: PythonSemanticKind,
) {
  const identifier = /[A-Za-z_]\w*/g;
  let match: RegExpExecArray | null;
  while ((match = identifier.exec(path))) {
    add(pathStart + match.index, match[0].length, kind);
  }
}

function importedModules(masked: string) {
  const modules = new Map<string, string>();
  const imports = /^[ \t]*import[ \t]+([^\n;]+)/gm;
  let match: RegExpExecArray | null;
  while ((match = imports.exec(masked))) {
    const body = match[1];
    const partPattern =
      /([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s+as\s+([A-Za-z_]\w*))?/g;
    let part: RegExpExecArray | null;
    while ((part = partPattern.exec(body))) {
      const moduleName = part[1];
      const binding = part[2] || moduleName.split(".")[0];
      modules.set(binding, moduleName);
      if (part[2]) modules.set(part[2], moduleName);
    }
  }

  const fromImports =
    /^[ \t]*from[ \t]+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)[ \t]+import[ \t]+([^\n;]+)/gm;
  while ((match = fromImports.exec(masked))) {
    const moduleName = match[1];
    const body = match[2];
    const symbolPattern = /([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?/g;
    let symbol: RegExpExecArray | null;
    while ((symbol = symbolPattern.exec(body))) {
      modules.set(symbol[2] || symbol[1], `${moduleName}.${symbol[1]}`);
    }
  }
  return modules;
}

export function analyzePythonSemantics(source: string): PythonSemanticToken[] {
  const masked = maskStringsAndComments(source);
  const tokens = new Map<string, PythonSemanticToken>();
  const add = (start: number, length: number, kind: PythonSemanticKind) => {
    if (start < 0 || length <= 0) return;
    const key = `${start}:${length}`;
    const current = tokens.get(key);
    if (!current || PRIORITY[kind] > PRIORITY[current.kind]) {
      tokens.set(key, { start, length, kind });
    }
  };
  const functions = new Set<string>();
  const classes = new Set<string>();
  const parameters = new Set<string>();
  const constants = new Set<string>();
  const moduleBindings = importedModules(masked);
  const importedBindings = new Set<string>();

  const importPattern = /^[ \t]*import[ \t]+([^\n;]+)/gm;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(masked))) {
    const body = match[1];
    const bodyStart = match.index + match[0].indexOf(body);
    const partPattern =
      /([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\s+as\s+([A-Za-z_]\w*))?/g;
    let part: RegExpExecArray | null;
    while ((part = partPattern.exec(body))) {
      const moduleStart = bodyStart + part.index;
      addPathTokens(add, part[1], moduleStart, "module");
      if (part[2]) {
        const aliasOffset = part[0].lastIndexOf(part[2]);
        add(moduleStart + aliasOffset, part[2].length, "module");
      }
    }
  }

  const fromPattern =
    /^[ \t]*from[ \t]+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)[ \t]+import[ \t]+([^\n;]+)/gm;
  while ((match = fromPattern.exec(masked))) {
    const moduleStart = match.index + match[0].indexOf(match[1]);
    addPathTokens(add, match[1], moduleStart, "module");
    const body = match[2];
    const bodyStart = match.index + match[0].lastIndexOf(body);
    const symbolPattern = /([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?/g;
    let symbol: RegExpExecArray | null;
    while ((symbol = symbolPattern.exec(body))) {
      const symbolStart = bodyStart + symbol.index;
      add(symbolStart, symbol[1].length, "imported");
      const binding = symbol[2] || symbol[1];
      importedBindings.add(binding);
      if (symbol[2]) {
        const aliasOffset = symbol[0].lastIndexOf(symbol[2]);
        add(symbolStart + aliasOffset, symbol[2].length, "imported");
      }
    }
  }

  const definitionPattern = /\b(def|class)\s+([A-Za-z_]\w*)/g;
  while ((match = definitionPattern.exec(masked))) {
    const name = match[2];
    const start = match.index + match[0].lastIndexOf(name);
    if (match[1] === "def") functions.add(name);
    else classes.add(name);
    add(start, name.length, match[1] === "def" ? "function" : "class");
  }

  const parameterPattern = /\bdef\s+[A-Za-z_]\w*\s*\(([^)]*)\)/gs;
  while ((match = parameterPattern.exec(masked))) {
    const body = match[1];
    const bodyStart = match.index + match[0].indexOf(body);
    const namePattern = /(?:^|,)\s*(?:\*{1,2}\s*)?([A-Za-z_]\w*)/g;
    let parameter: RegExpExecArray | null;
    while ((parameter = namePattern.exec(body))) {
      const name = parameter[1];
      const start =
        bodyStart + parameter.index + parameter[0].lastIndexOf(name);
      parameters.add(name);
      add(start, name.length, "parameter");
    }
  }

  const constantPattern = /^[ \t]*([A-Z][A-Z0-9_]*)\s*(?::[^=\n]+)?=/gm;
  while ((match = constantPattern.exec(masked))) {
    constants.add(match[1]);
    add(match.index + match[0].indexOf(match[1]), match[1].length, "constant");
  }

  const identifiers = /\b[A-Za-z_]\w*\b/g;
  while ((match = identifiers.exec(masked))) {
    const name = match[0];
    if (KEYWORDS.has(name)) continue;
    const kind = importedBindings.has(name)
      ? "imported"
      : moduleBindings.has(name)
        ? "module"
        : classes.has(name)
          ? "class"
          : functions.has(name)
            ? "function"
            : BUILTINS.has(name)
              ? "builtin"
              : constants.has(name)
                ? "constant"
                : parameters.has(name)
                  ? "parameter"
                  : null;
    if (kind) add(match.index, name.length, kind);
  }

  const attributes = /\.\s*([A-Za-z_]\w*)/g;
  while ((match = attributes.exec(masked))) {
    const name = match[1];
    const start = match.index + match[0].lastIndexOf(name);
    const next = masked.slice(start + name.length).match(/^\s*(.)/)?.[1];
    add(start, name.length, next === "(" ? "method" : "property");
  }

  const calls = /\b([A-Za-z_]\w*)\s*(?=\()/g;
  while ((match = calls.exec(masked))) {
    if (KEYWORDS.has(match[1])) continue;
    add(
      match.index,
      match[1].length,
      BUILTINS.has(match[1]) ? "builtin" : "function",
    );
  }

  const decorators = /^[ \t]*@([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)/gm;
  while ((match = decorators.exec(masked))) {
    const pathStart = match.index + match[0].indexOf(match[1]);
    addPathTokens(add, match[1], pathStart, "decorator");
  }

  return [...tokens.values()].sort((left, right) => left.start - right.start);
}

const configuredMonaco = new WeakSet<object>();

export function configurePythonEditor(monaco: Monaco) {
  if (configuredMonaco.has(monaco)) return;
  configuredMonaco.add(monaco);

  monaco.editor.defineTheme("pylearn-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "7F8C98", fontStyle: "italic" },
      { token: "keyword", foreground: "F472B6", fontStyle: "bold" },
      { token: "string", foreground: "A7E26D" },
      { token: "number", foreground: "FBBF66" },
      { token: "operator", foreground: "67E8F9" },
      { token: "delimiter", foreground: "CBD5E1" },
      { token: "type.identifier", foreground: "2DD4BF" },
    ],
    colors: {
      "editor.background": "#0B1220",
      "editor.foreground": "#DCE7F3",
      "editorLineNumber.foreground": "#526174",
      "editorLineNumber.activeForeground": "#38BDF8",
      "editorIndentGuide.background1": "#233044",
      "editorIndentGuide.activeBackground1": "#3B82F6",
      "editorBracketHighlight.foreground1": "#38BDF8",
      "editorBracketHighlight.foreground2": "#F472B6",
      "editorBracketHighlight.foreground3": "#FBBF24",
      "editor.selectionBackground": "#1D4ED866",
      "editor.lineHighlightBackground": "#17203380",
    },
  });
  monaco.editor.defineTheme("pylearn-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5F6B76", fontStyle: "italic" },
      { token: "keyword", foreground: "B42375", fontStyle: "bold" },
      { token: "string", foreground: "3B7A18" },
      { token: "number", foreground: "A34B00" },
      { token: "operator", foreground: "007C91" },
      { token: "delimiter", foreground: "334155" },
      { token: "type.identifier", foreground: "087F75" },
    ],
    colors: {
      "editor.background": "#F8FAFC",
      "editor.foreground": "#172033",
      "editorLineNumber.foreground": "#94A3B8",
      "editorLineNumber.activeForeground": "#0284C7",
      "editorIndentGuide.background1": "#DCE4ED",
      "editorIndentGuide.activeBackground1": "#60A5FA",
      "editorBracketHighlight.foreground1": "#0284C7",
      "editorBracketHighlight.foreground2": "#BE185D",
      "editorBracketHighlight.foreground3": "#B45309",
      "editor.selectionBackground": "#93C5FD77",
      "editor.lineHighlightBackground": "#E8EEF680",
    },
  });

  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: ["."],
    provideCompletionItems(
      model: CompletionModel,
      position: CompletionPosition,
    ) {
      const beforeCursor = model
        .getLineContent(position.lineNumber)
        .slice(0, position.column - 1);
      const access = beforeCursor.match(/([A-Za-z_]\w*)\.([A-Za-z_]\w*)?$/);
      if (!access) return { suggestions: [] };
      const moduleName = importedModules(
        maskStringsAndComments(model.getValue()),
      ).get(access[1]);
      if (!moduleName) return { suggestions: [] };
      const members =
        MODULE_MEMBERS[moduleName] || MODULE_MEMBERS[moduleName.split(".")[0]];
      if (!members) return { suggestions: [] };
      const partial = access[2] || "";
      const range = new monaco.Range(
        position.lineNumber,
        position.column - partial.length,
        position.lineNumber,
        position.column,
      );
      return {
        suggestions: members.map(([name, detail]) => ({
          label: name,
          kind: monaco.languages.CompletionItemKind.Function,
          detail: `${moduleName} · ${detail}`,
          insertText: `${name}($0)`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });
}

export function attachPythonSemantics(editor: EditorInstance, monaco: Monaco) {
  const decorations = editor.createDecorationsCollection();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const update = () => {
    const model = editor.getModel();
    if (!model || model.getLanguageId() !== "python") {
      decorations.clear();
      return;
    }
    const semanticTokens = analyzePythonSemantics(model.getValue());
    decorations.set(
      semanticTokens.map((token) => {
        const start = model.getPositionAt(token.start);
        const end = model.getPositionAt(token.start + token.length);
        return {
          range: new monaco.Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column,
          ),
          options: {
            inlineClassName: `pylearn-python-${token.kind}`,
            inlineClassNameAffectsLetterSpacing: false,
          },
        };
      }),
    );
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(update, 80);
  };
  const contentListener = editor.onDidChangeModelContent(schedule);
  const modelListener = editor.onDidChangeModel(schedule);
  update();

  return {
    dispose() {
      if (timer) clearTimeout(timer);
      contentListener.dispose();
      modelListener.dispose();
      decorations.clear();
    },
  };
}
