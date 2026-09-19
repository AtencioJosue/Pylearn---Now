/* Python lives in this worker so user programs cannot freeze the editor. */
const CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";
const BUNDLED_MODULE_FILES = ["pygame.py", "turtle.py", "tkinter.py"];
const BROWSER_PACKAGES = new Set([
  "pylearn",
  "pygame",
  "pygame-ce",
  "turtle",
  "tkinter",
]);
const GAME_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "w",
  "a",
  "s",
  "d",
  "b",
  "c",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "t",
  "u",
  "v",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  " ",
  "Enter",
  "Escape",
  "Shift",
  "Control",
  "Tab",
];
const POINTER_CONTROL_OFFSET = GAME_KEYS.length;
const PYLEARN_MODULE = `"""Gráficos y juegos seguros dentro de Pylearn."""
import json
import time
from js import (
    __pylearn_emit, __pylearn_key, __pylearn_keyboard,
    __pylearn_pointer, __pylearn_mouse
)

_width = 720
_height = 420
_background = "#0f172a"
_title = "Mi juego"
_open = False
_commands = []

_KEY_ALIASES = {
    "arriba": "ArrowUp", "up": "ArrowUp", "arrowup": "ArrowUp",
    "abajo": "ArrowDown", "down": "ArrowDown", "arrowdown": "ArrowDown",
    "izquierda": "ArrowLeft", "left": "ArrowLeft", "arrowleft": "ArrowLeft",
    "derecha": "ArrowRight", "right": "ArrowRight", "arrowright": "ArrowRight",
    "espacio": " ", "space": " ", "enter": "Enter", "escape": "Escape", "esc": "Escape",
    "w": "w", "a": "a", "s": "s", "d": "d",
}

def _emit(payload):
    __pylearn_emit(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))

def _ensure():
    if not _open:
        pantalla()

def _color(valor):
    if isinstance(valor, (tuple, list)) and len(valor) >= 3:
        canales = [float(item) for item in valor[:4]]
        if max(canales[:3], default=0) <= 1:
            canales[:3] = [item * 255 for item in canales[:3]]
        rojo, verde, azul = [max(0, min(255, round(item))) for item in canales[:3]]
        if len(canales) > 3:
            alfa = max(0, min(1, canales[3] / 255 if canales[3] > 1 else canales[3]))
            return f"rgb({rojo} {verde} {azul} / {alfa:.3f})"
        return f"rgb({rojo} {verde} {azul})"
    return str(valor)[:64]

def pantalla(ancho=720, alto=420, titulo="Mi juego", fondo="#0f172a"):
    global _width, _height, _title, _background, _open, _commands
    _width = max(240, min(1280, int(ancho)))
    _height = max(160, min(720, int(alto)))
    _title = str(titulo)[:100]
    _background = _color(fondo)
    _open = True
    _commands = []
    _emit({"action": "open", "width": _width, "height": _height,
           "title": _title, "background": _background})

def limpiar(color=None):
    global _commands
    _ensure()
    _commands = [{"t": "clear", "color": _color(color or _background)}]

def rectangulo(x, y, ancho, alto, color="#38bdf8", radio=0):
    _ensure()
    _commands.append({"t": "rect", "x": float(x), "y": float(y),
                      "w": float(ancho), "h": float(alto),
                      "color": _color(color), "radius": float(radio)})

def circulo(x, y, radio, color="#38bdf8", grosor=0):
    _ensure()
    _commands.append({"t": "circle", "x": float(x), "y": float(y),
                      "radius": float(radio), "color": _color(color),
                      "width": float(grosor)})

def elipse(x, y, ancho, alto, color="#38bdf8", grosor=0):
    _ensure()
    _commands.append({"t": "ellipse", "x": float(x), "y": float(y),
                      "w": float(ancho), "h": float(alto),
                      "color": _color(color), "width": float(grosor)})

def linea(x1, y1, x2, y2, color="#e2e8f0", grosor=2):
    _ensure()
    _commands.append({"t": "line", "x1": float(x1), "y1": float(y1),
                      "x2": float(x2), "y2": float(y2),
                      "color": _color(color), "width": float(grosor)})

def texto(valor, x, y, tamano=24, color="#f8fafc", alineacion="izquierda"):
    _ensure()
    align = {"izquierda": "left", "centro": "center", "derecha": "right",
             "left": "left", "center": "center", "right": "right"}.get(
                 str(alineacion).lower(), "left")
    _commands.append({"t": "text", "text": str(valor)[:500],
                      "x": float(x), "y": float(y), "size": float(tamano),
                      "color": _color(color), "align": align})

def poligono(puntos, color="#38bdf8", grosor=0):
    _ensure()
    coords = [[float(x), float(y)] for x, y in list(puntos)[:500]]
    if len(coords) >= 3:
        _commands.append({"t": "polygon", "points": coords,
                          "color": _color(color), "width": float(grosor)})

def imagen(ruta, x, y, ancho=None, alto=None):
    _ensure()
    command = {"t": "image", "path": str(ruta), "x": float(x), "y": float(y)}
    if ancho is not None:
        command["w"] = float(ancho)
    if alto is not None:
        command["h"] = float(alto)
    _commands.append(command)

def tecla(nombre):
    key = _KEY_ALIASES.get(str(nombre).strip().lower(), str(nombre))
    return bool(__pylearn_key(key))

def teclado_disponible():
    return bool(__pylearn_keyboard())

def raton_posicion():
    return (int(__pylearn_pointer(0)), int(__pylearn_pointer(1)))

def raton(boton=1):
    return bool(__pylearn_mouse(int(boton)))

def _presentar():
    global _commands
    _ensure()
    if not _commands:
        return False
    if len(_commands) > 2000:
        _commands = _commands[:2000]
    _emit({"action": "frame", "commands": _commands})
    _commands = []
    return True

def actualizar(fps=60):
    _presentar()
    velocidad = max(1.0, min(60.0, float(fps)))
    time.sleep(1.0 / velocidad)

def _finalizar():
    global _commands
    if _open and _commands:
        _emit({"action": "frame", "commands": _commands[:2000]})
        _commands = []

class Juego:
    def __init__(self, ancho=720, alto=420, titulo="Mi juego", fondo="#0f172a"):
        pantalla(ancho, alto, titulo, fondo)

    @property
    def activo(self):
        return not tecla("escape")

    def limpiar(self, color=None):
        limpiar(color)

    def rectangulo(self, *args, **kwargs):
        rectangulo(*args, **kwargs)

    def circulo(self, *args, **kwargs):
        circulo(*args, **kwargs)

    def elipse(self, *args, **kwargs):
        elipse(*args, **kwargs)

    def linea(self, *args, **kwargs):
        linea(*args, **kwargs)

    def texto(self, *args, **kwargs):
        texto(*args, **kwargs)

    def imagen(self, *args, **kwargs):
        imagen(*args, **kwargs)

    def tecla(self, nombre):
        return tecla(nombre)

    def actualizar(self, fps=60):
        actualizar(fps)

screen = pantalla
clear = limpiar
rect = rectangulo
circle = circulo
ellipse = elipse
line = linea
text = texto
polygon = poligono
image = imagen
key = tecla
update = actualizar
`;
let py,
  inputBuffer,
  controlView,
  outputBytes = 0,
  truncated = false,
  suppressInternalStack = false,
  busy = false;
const installedPackages = new Set();
const decoderOut = new TextDecoder(),
  decoderErr = new TextDecoder();
async function loadBundledModules() {
  const modules = await Promise.all(
    BUNDLED_MODULE_FILES.map(async (file) => {
      const url = new URL(`pylearn-modules/${file}`, self.location.href);
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`No se pudo preparar el módulo web ${file}.`);
      return [file, await response.text()];
    }),
  );
  return modules;
}
self.__pylearn_emit = (raw) => {
  try {
    const text = String(raw);
    if (text.length > 12 * 1024 * 1024) return false;
    const payload = JSON.parse(text);
    if (!payload || typeof payload !== "object") return false;
    postMessage({ type: "graphics", payload });
    return true;
  } catch {
    return false;
  }
};
self.__pylearn_key = (key) => {
  if (!controlView) return false;
  const text = String(key);
  const normalized =
    text.length === 1 && text !== " " ? text.toLowerCase() : text;
  const index = GAME_KEYS.indexOf(normalized);
  return index >= 0 && Atomics.load(controlView, index) === 1;
};
self.__pylearn_keyboard = () => Boolean(controlView);
self.__pylearn_pointer = (axis) => {
  if (!controlView) return 0;
  const offset = POINTER_CONTROL_OFFSET + (Number(axis) === 1 ? 1 : 0);
  return Atomics.load(controlView, offset);
};
self.__pylearn_mouse = (button) => {
  if (!controlView) return false;
  const normalized = Math.max(1, Math.min(3, Number(button) || 1));
  return (
    Atomics.load(controlView, POINTER_CONTROL_OFFSET + 1 + normalized) === 1
  );
};
function emit(type, text) {
  if (type === "stderr") {
    if (/Matplotlib is building the font cache/i.test(text)) return;
    if (/Stack \(most recent call first\):/i.test(text)) {
      suppressInternalStack = true;
      return;
    }
    if (suppressInternalStack) return;
  }
  if (!text) return;
  if (outputBytes > 1024 * 1024) {
    if (!truncated) {
      truncated = true;
      postMessage({
        type: "output",
        stream: "info",
        text: "\nSalida recortada a 1 MB. El programa sigue ejecutándose; puedes detenerlo.\n",
      });
    }
    return;
  }
  outputBytes += text.length;
  postMessage({ type: "output", stream: type, text });
}
function formatPythonError(error) {
  const raw = String(error)
    .replace(/^PythonError:\s*/i, "")
    .replaceAll("/workspace/", "");
  const lines = raw.split(/\r?\n/);
  const visible = [];
  let skipInternalDetails = false;
  for (const line of lines) {
    if (
      /File "\/(?:lib\/python\d+\.zip|usr\/lib)|_pyodide|pyodide\/webloop|_base\.py/.test(
        line,
      )
    ) {
      skipInternalDetails = true;
      continue;
    }
    if (skipInternalDetails) {
      if (!line.trim() || (/^\s+/.test(line) && !/^\s*File\b/.test(line))) {
        continue;
      }
      skipInternalDetails = false;
    }
    if (/^\s*at (?:_createPyodideModule|Object\.)/.test(line)) continue;
    visible.push(line);
  }
  let result = visible.join("\n").trim();
  if (/No module named ['"](?:PyQt|PySide|wx|kivy)/i.test(result)) {
    result +=
      "\nEsta biblioteca crea ventanas de escritorio y no funciona dentro del navegador. Para juegos usa pygame, turtle o pylearn; para gráficos usa Matplotlib.";
  }
  return (
    result ||
    "El programa no pudo terminar. Revisa la línea marcada en tu archivo."
  );
}
function removeTree(path) {
  const stat = py.FS.lstat(path);
  if (py.FS.isDir(stat.mode)) {
    for (const child of py.FS.readdir(path))
      if (child !== "." && child !== "..") removeTree(path + "/" + child);
    py.FS.rmdir(path);
  } else py.FS.unlink(path);
}
function reachablePythonSource(project) {
  const pythonFiles = new Map(
    project.files
      .filter((file) => file.path.endsWith(".py") && file.encoding === "utf8")
      .map((file) => [file.path.replaceAll("\\", "/"), file.content]),
  );
  const queue = [project.entryFile.replaceAll("\\", "/")];
  const visited = new Set();
  const sources = [];
  const normalize = (parts) => {
    const result = [];
    for (const part of parts) {
      if (!part || part === ".") continue;
      if (part === "..") result.pop();
      else result.push(part);
    }
    return result;
  };
  const enqueueModule = (moduleName, currentPath, importedNames = []) => {
    const dots = moduleName.match(/^\.+/)?.[0].length || 0;
    const moduleText = moduleName.slice(dots);
    const currentDirectory = currentPath.split("/").slice(0, -1);
    const relativeBase = dots
      ? currentDirectory.slice(0, Math.max(0, currentDirectory.length - dots + 1))
      : [];
    const moduleParts = moduleText ? moduleText.split(".") : [];
    const bases = [normalize([...relativeBase, ...moduleParts])];
    if (!dots && currentDirectory.length)
      bases.push(normalize([...currentDirectory, ...moduleParts]));
    for (const base of bases) {
      const prefix = base.join("/");
      const candidates = [
        prefix ? `${prefix}.py` : "",
        prefix ? `${prefix}/__init__.py` : "",
        ...importedNames.flatMap((name) =>
          /^[A-Za-z_]\w*$/.test(name)
            ? [
                [...base, name].join("/") + ".py",
                [...base, name, "__init__.py"].join("/"),
              ]
            : [],
        ),
      ];
      for (const candidate of candidates)
        if (candidate && pythonFiles.has(candidate) && !visited.has(candidate))
          queue.push(candidate);
    }
  };

  while (queue.length) {
    const path = queue.shift();
    if (!path || visited.has(path) || !pythonFiles.has(path)) continue;
    visited.add(path);
    const source = pythonFiles.get(path);
    sources.push(source);
    for (const line of source.split(/\r?\n/)) {
      const importMatch = line.match(/^\s*import\s+([^#;]+)/);
      if (importMatch) {
        for (const item of importMatch[1].split(","))
          enqueueModule(item.trim().split(/\s+as\s+/)[0], path);
      }
      const fromMatch = line.match(
        /^\s*from\s+([.A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*|\.+)\s+import\s+([^#;]+)/,
      );
      if (fromMatch) {
        const names = fromMatch[2]
          .replace(/[()]/g, "")
          .split(",")
          .map((item) => item.trim().split(/\s+as\s+/)[0]);
        enqueueModule(fromMatch[1], path, names);
      }
    }
  }
  return sources.join("\n");
}
function syncProject(project) {
  py.FS.chdir("/");
  if (py.FS.analyzePath("/workspace").exists) removeTree("/workspace");
  py.FS.mkdir("/workspace");
  for (const folder of project.folders) py.FS.mkdirTree("/workspace/" + folder);
  for (const file of project.files) {
    const target = "/workspace/" + file.path;
    py.FS.mkdirTree(target.slice(0, target.lastIndexOf("/")));
    const data =
      file.encoding === "base64"
        ? Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0))
        : file.content;
    py.FS.writeFile(target, data);
  }
  py.FS.chdir("/workspace");
}
function snapshot() {
  const files = [],
    folders = [];
  let size = 0;
  function visit(dir) {
    for (const name of py.FS.readdir(dir)) {
      if (name === "." || name === ".." || name === "__pycache__") continue;
      const full = dir + "/" + name,
        path = full.slice("/workspace/".length),
        stat = py.FS.lstat(full);
      if (py.FS.isDir(stat.mode)) {
        folders.push(path);
        if (folders.length > 500) throw Error("Demasiadas carpetas generadas.");
        visit(full);
      } else if (py.FS.isFile(stat.mode)) {
        if (files.length >= 500 || (size += stat.size) > 20 * 1024 * 1024)
          throw Error(
            "Los archivos generados superan el límite del proyecto (500 archivos / 20 MB).",
          );
        const data = py.FS.readFile(full);
        let content,
          encoding = "utf8";
        try {
          content = new TextDecoder("utf-8", { fatal: true }).decode(data);
          if (content.includes("\0")) throw Error();
        } catch {
          encoding = "base64";
          let binary = "";
          for (let i = 0; i < data.length; i += 8192)
            binary += String.fromCharCode(...data.subarray(i, i + 8192));
          content = btoa(binary);
        }
        files.push({ path, content, encoding });
      }
    }
  }
  visit("/workspace");
  return { files, folders };
}
function packageError(packageName, error) {
  const detail = String(error);
  if (/failed to fetch|networkerror|load failed|fetching package/i.test(detail))
    return `No se pudo descargar "${packageName}". Revisa tu conexión e inténtalo de nuevo.`;
  if (/can't fetch metadata|package not found|404 not found/i.test(detail))
    return `No encontramos "${packageName}". Revisa que el nombre y la versión estén bien escritos.`;
  if (
    /can't find|no matching distribution|not a pure python|unsupported wheel/i.test(
      detail,
    )
  )
    return `"${packageName}" no tiene una versión compatible con el Python del navegador. Prueba otra versión o usa el entorno avanzado.`;
  return `No se pudo instalar "${packageName}". Revisa el nombre, la versión y vuelve a intentarlo.`;
}
async function installPackages(packages) {
  const requested = [...new Set(packages || [])];
  for (const name of requested) {
    const baseName = String(name).split("==")[0].toLowerCase();
    if (BROWSER_PACKAGES.has(baseName)) installedPackages.add(name);
  }
  const pending = requested.filter((name) => !installedPackages.has(name));
  if (!pending.length) return requested;
  await py.loadPackage("micropip");
  const micropip = py.pyimport("micropip");
  try {
    for (let index = 0; index < pending.length; index += 1) {
      const packageName = pending[index];
      postMessage({
        type: "status",
        text: `Instalando ${packageName} (${index + 1}/${pending.length})…`,
      });
      try {
        await micropip.install(packageName);
        installedPackages.add(packageName);
      } catch (error) {
        throw new Error(packageError(packageName, error));
      }
    }
  } finally {
    micropip.destroy();
  }
  return requested;
}
self.onmessage = async ({ data }) => {
  if (data.type === "init") {
    try {
      inputBuffer = data.inputBuffer;
      controlView = data.controlBuffer
        ? new Int32Array(data.controlBuffer)
        : null;
      const bundledModules = loadBundledModules();
      importScripts(CDN + "pyodide.js");
      py = await loadPyodide({ indexURL: CDN });
      py.FS.mkdirTree("/pylearn_lib");
      py.FS.writeFile("/pylearn_lib/pylearn.py", PYLEARN_MODULE);
      for (const [file, source] of await bundledModules)
        py.FS.writeFile(`/pylearn_lib/${file}`, source);
      for (const name of BROWSER_PACKAGES) installedPackages.add(name);
      py.runPython(
        'import sys\nif "/pylearn_lib" not in sys.path: sys.path.insert(0, "/pylearn_lib")',
      );
      postMessage({
        type: "ready",
        version: py.runPython("import sys; sys.version.split()[0]"),
      });
    } catch (error) {
      postMessage({ type: "fatal", text: String(error) });
    }
    return;
  }
  if (!py || busy) return;
  if (data.type === "install") {
    busy = true;
    try {
      const packages = await installPackages(data.packages);
      postMessage({
        type: "install-success",
        requestId: data.requestId,
        packages,
      });
    } catch (error) {
      postMessage({
        type: "install-error",
        requestId: data.requestId,
        text: error instanceof Error ? error.message : String(error),
      });
    } finally {
      busy = false;
    }
    return;
  }
  if (data.type !== "run") return;
  busy = true;
  outputBytes = 0;
  truncated = false;
  suppressInternalStack = false;
  py.setStdout({
    write(buffer) {
      emit("stdout", decoderOut.decode(buffer, { stream: true }));
      return buffer.length;
    },
  });
  py.setStderr({
    write(buffer) {
      emit("stderr", decoderErr.decode(buffer, { stream: true }));
      return buffer.length;
    },
  });
  const inputs = [...(data.inputs || [])];
  py.setStdin({
    isatty: true,
    stdin: () => {
      if (!inputBuffer) {
        if (inputs.length) return inputs.shift();
        emit(
          "info",
          "\nNo quedan entradas preparadas para input(). Añade una línea por respuesta en Entradas.\n",
        );
        return undefined;
      }
      const header = new Int32Array(inputBuffer, 0, 2),
        bytes = new Uint8Array(inputBuffer, 8);
      Atomics.store(header, 0, 0);
      postMessage({ type: "input" });
      while (Atomics.load(header, 0) === 0) Atomics.wait(header, 0, 0);
      if (Atomics.load(header, 0) === 2) return undefined;
      return new TextDecoder().decode(bytes.slice(0, Atomics.load(header, 1)));
    },
  });
  let globals,
    synced = false;
  try {
    syncProject(data.project);
    synced = true;
    await py.runPythonAsync(`import sys, importlib
for _name, _module in list(sys.modules.items()):
    if (_name.split(".")[0] in {"pylearn", "pygame", "turtle", "tkinter"}
            or str(getattr(_module, "__file__", "")).startswith("/workspace/")):
        del sys.modules[_name]
sys.path[:] = [p for p in sys.path if not p.startswith("/workspace")]
sys.path.insert(0, "/workspace")
if "/pylearn_lib" in sys.path:
    sys.path.remove("/pylearn_lib")
sys.path.insert(0, "/pylearn_lib")
sys.dont_write_bytecode = True
importlib.invalidate_caches()
`);
    if (data.project.packages.length) {
      postMessage({ type: "status", text: "Preparando bibliotecas…" });
      await installPackages(data.project.packages);
    }
    postMessage({ type: "status", text: "Preparando el programa…" });
    const projectSource = reachablePythonSource(data.project);
    const packageDiscoverySource = projectSource.replace(
      /\b(?:pylearn|pygame(?:-ce)?|turtle|tkinter)\b/gi,
      "sys",
    );
    await py.loadPackagesFromImports(packageDiscoverySource, {
      messageCallback: () => {},
      errorCallback: () => {},
    });
    if (/\b(?:from|import)\s+matplotlib\b/.test(projectSource)) {
      postMessage({
        type: "status",
        text: "Preparando Matplotlib por primera vez…",
      });
      await py.runPythonAsync(`import base64 as _pylearn_base64
import io as _pylearn_io
import json as _pylearn_json
import logging as _pylearn_logging
import os as _pylearn_os
from js import __pylearn_emit as _pylearn_emit_js
_pylearn_os.environ.setdefault("MPLCONFIGDIR", "/tmp/pylearn-matplotlib")
_pylearn_logging.getLogger("matplotlib.font_manager").disabled = True
import matplotlib as _pylearn_matplotlib
_pylearn_matplotlib.use("agg")
import matplotlib.pyplot as _pylearn_plt

def _pylearn_emit_figure(_figure):
    _buffer = _pylearn_io.BytesIO()
    _figure.savefig(_buffer, format="png", dpi=110, bbox_inches="tight")
    _title = "Gráfico de Matplotlib"
    if _figure.axes and _figure.axes[0].get_title():
        _title = _figure.axes[0].get_title()
    _pylearn_emit_js(_pylearn_json.dumps({
        "action": "image",
        "title": _title,
        "data": _pylearn_base64.b64encode(_buffer.getvalue()).decode("ascii"),
    }, separators=(",", ":")))

def _pylearn_show(*_args, **_kwargs):
    for _number in list(_pylearn_plt.get_fignums()):
        _pylearn_emit_figure(_pylearn_plt.figure(_number))
    _pylearn_plt.close("all")

_pylearn_plt.show = _pylearn_show
`);
    }
    if (/\b(?:from\s+PIL|import\s+PIL)\b/.test(projectSource)) {
      await py.runPythonAsync(`import base64 as _pylearn_pil_base64
import io as _pylearn_pil_io
import json as _pylearn_pil_json
from js import __pylearn_emit as _pylearn_pil_emit
from PIL import Image as _pylearn_pil_image

def _pylearn_show_pil(self, title=None):
    _buffer = _pylearn_pil_io.BytesIO()
    self.save(_buffer, format="PNG")
    _pylearn_pil_emit(_pylearn_pil_json.dumps({
        "action": "image",
        "title": str(title or getattr(self, "filename", "") or "Imagen de Python"),
        "data": _pylearn_pil_base64.b64encode(_buffer.getvalue()).decode("ascii"),
    }, separators=(",", ":")))

_pylearn_pil_image.Image.show = _pylearn_show_pil
`);
    }
    postMessage({ type: "status", text: "Ejecutando…" });
    globals = py.toPy({
      __name__: "__main__",
      __file__: "/workspace/" + data.project.entryFile,
    });
    const entry = data.project.files.find(
      (f) => f.path === data.project.entryFile,
    );
    py.globals.set("_pylearn_entry", "/workspace/" + data.project.entryFile);
    await py.runPythonAsync(
      'import sys, os\nsys.argv = [_pylearn_entry]\nsys.path.insert(0, os.path.dirname(_pylearn_entry))\nif "/pylearn_lib" in sys.path: sys.path.remove("/pylearn_lib")\nsys.path.insert(0, "/pylearn_lib")',
    );
    const result = await py.runPythonAsync(entry.content, {
      globals,
      filename: "/workspace/" + entry.path,
    });
    result?.destroy?.();
  } catch (error) {
    emit("error", formatPythonError(error) + "\n");
  } finally {
    try {
      await py.runPythonAsync(`import sys as _pylearn_sys
_pylearn_game_module = _pylearn_sys.modules.get("pylearn")
if _pylearn_game_module is not None:
    _pylearn_game_module._finalizar()
if "_pylearn_plt" in globals() and _pylearn_plt.get_fignums():
    _pylearn_show()
`);
    } catch (graphicsError) {
      emit(
        "error",
        "No se pudo mostrar la salida gráfica: " + String(graphicsError) + "\n",
      );
    }
    globals?.destroy();
    if (synced) {
      try {
        postMessage({ type: "files", ...snapshot() });
      } catch (error) {
        emit(
          "error",
          "No se pudieron recuperar los archivos generados: " +
            String(error) +
            "\n",
        );
      }
    }
    busy = false;
    postMessage({ type: "done" });
  }
};
