import { useEffect, useRef, useState } from "react";
import type { Project, ProjectFile } from "./model";
import {
  applyGraphicsMessage,
  CONTROL_SLOTS,
  gameKeyIndex,
  POINTER_CONTROL_OFFSET,
  type GraphicsOutput,
} from "./graphics";
export interface OutputChunk {
  stream: string;
  text: string;
}
export type EngineState =
  | "loading"
  | "ready"
  | "installing"
  | "running"
  | "input"
  | "error";
export function usePython(
  onFiles: (files: ProjectFile[], folders: string[]) => void,
) {
  const workerRef = useRef<Worker | null>(null),
    inputRef = useRef<SharedArrayBuffer | null>(null),
    controlRef = useRef<SharedArrayBuffer | null>(null),
    graphicsSessionRef = useRef(0);
  const installRequestsRef = useRef(
    new Map<
      string,
      {
        resolve: (packages: string[]) => void;
        reject: (error: Error) => void;
      }
    >(),
  );
  const onFilesRef = useRef(onFiles);
  onFilesRef.current = onFiles;
  const [generation, setGeneration] = useState(0);
  const [state, setState] = useState<EngineState>("loading");
  const stateRef = useRef<EngineState>("loading");
  const [status, setStatus] = useState("Cargando Python…"),
    [output, setOutput] = useState<OutputChunk[]>([]);
  const [version, setVersion] = useState("");
  const [graphics, setGraphics] = useState<GraphicsOutput | null>(null);
  const interactive =
    typeof SharedArrayBuffer !== "undefined" && window.crossOriginIsolated;
  const change = (next: EngineState) => {
    stateRef.current = next;
    setState(next);
  };
  function append(stream: string, text: string) {
    setOutput((prev) => {
      const last = prev.at(-1);
      if (last?.stream === stream && last.text.length < 32000)
        return [...prev.slice(0, -1), { stream, text: last.text + text }];
      return [...prev.slice(-499), { stream, text }];
    });
  }
  function rejectInstallRequests(message: string) {
    for (const request of installRequestsRef.current.values())
      request.reject(new Error(message));
    installRequestsRef.current.clear();
  }
  useEffect(() => {
    change("loading");
    setStatus("Cargando Python…");
    let disposed = false;
    const worker = new Worker(import.meta.env.BASE_URL + "python-worker.js");
    workerRef.current = worker;
    inputRef.current = interactive ? new SharedArrayBuffer(8 + 65536) : null;
    controlRef.current = interactive
      ? new SharedArrayBuffer(CONTROL_SLOTS * Int32Array.BYTES_PER_ELEMENT)
      : null;
    const timer = setTimeout(() => {
      if (!disposed && stateRef.current === "loading") {
        worker.terminate();
        change("error");
        setStatus("No se pudo iniciar Python");
        append(
          "error",
          "La carga tardó demasiado. Revisa tu conexión y pulsa Reiniciar Python.\n",
        );
      }
    }, 60000);
    worker.onmessage = ({ data }) => {
      if (disposed) return;
      if (data.type === "ready") {
        clearTimeout(timer);
        setVersion(data.version);
        change("ready");
        setStatus("Python listo");
      }
      if (data.type === "fatal") {
        clearTimeout(timer);
        change("error");
        setStatus("Error al iniciar");
        append("error", data.text + "\n");
        rejectInstallRequests(data.text);
      }
      if (data.type === "output") append(data.stream, data.text);
      if (data.type === "graphics") {
        setGraphics((current) =>
          applyGraphicsMessage(
            current,
            data.payload,
            graphicsSessionRef.current,
          ),
        );
      }
      if (data.type === "status") setStatus(data.text);
      if (data.type === "input") {
        change("input");
        setStatus("Esperando tu respuesta…");
      }
      if (data.type === "files") onFilesRef.current(data.files, data.folders);
      if (data.type === "install-success") {
        const request = installRequestsRef.current.get(data.requestId);
        installRequestsRef.current.delete(data.requestId);
        change("ready");
        setStatus(
          data.packages.length === 1
            ? `${data.packages[0]} está lista`
            : "Bibliotecas instaladas",
        );
        request?.resolve(data.packages);
      }
      if (data.type === "install-error") {
        const request = installRequestsRef.current.get(data.requestId);
        installRequestsRef.current.delete(data.requestId);
        change("ready");
        setStatus("No se pudo instalar la biblioteca");
        append("error", data.text + "\n");
        request?.reject(new Error(data.text));
      }
      if (data.type === "done") {
        change("ready");
        setStatus("Ejecución terminada");
      }
    };
    worker.onerror = (event) => {
      clearTimeout(timer);
      change("error");
      setStatus("Error de Python");
      append("error", event.message + "\n");
      rejectInstallRequests(event.message || "El proceso de Python falló.");
    };
    worker.postMessage({
      type: "init",
      inputBuffer: inputRef.current,
      controlBuffer: controlRef.current,
    });
    return () => {
      disposed = true;
      clearTimeout(timer);
      worker.terminate();
      workerRef.current = null;
      rejectInstallRequests("La instalación se canceló al cerrar Python.");
    };
  }, [generation, interactive]);
  function install(packages: string[]): Promise<string[]> {
    if (stateRef.current !== "ready" || !workerRef.current)
      return Promise.reject(
        new Error("Python todavía no está listo para instalar bibliotecas."),
      );
    const requestId = crypto.randomUUID();
    change("installing");
    setStatus(
      packages.length === 1
        ? `Preparando ${packages[0]}…`
        : "Preparando bibliotecas…",
    );
    return new Promise((resolve, reject) => {
      installRequestsRef.current.set(requestId, { resolve, reject });
      workerRef.current?.postMessage({
        type: "install",
        requestId,
        packages,
      });
    });
  }
  function run(project: Project, inputs: string[]) {
    if (stateRef.current !== "ready" || !project.entryFile) return;
    graphicsSessionRef.current += 1;
    setGraphics(null);
    clearKeys();
    change("running");
    setStatus("Preparando proyecto…");
    setOutput([]);
    workerRef.current?.postMessage({ type: "run", project, inputs });
  }
  function respond(text: string, eof = false) {
    if (stateRef.current !== "input" || !inputRef.current) return;
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > 65536) {
      append("error", "La respuesta supera los 64 KB.\n");
      return;
    }
    append("stdin", eof ? "[Fin de entrada]\n" : text + "\n");
    const header = new Int32Array(inputRef.current, 0, 2);
    new Uint8Array(inputRef.current, 8).set(bytes);
    Atomics.store(header, 1, bytes.length);
    change("running");
    setStatus("Ejecutando…");
    Atomics.store(header, 0, eof ? 2 : 1);
    Atomics.notify(header, 0);
  }
  function restart() {
    clearKeys();
    workerRef.current?.terminate();
    if (
      stateRef.current === "running" ||
      stateRef.current === "input" ||
      stateRef.current === "installing"
    )
      append(
        "info",
        "\nProceso detenido. Se conservó el código guardado; los cambios de archivos de esta ejecución interrumpida no se recuperan.\n",
      );
    rejectInstallRequests("La instalación fue cancelada.");
    change("loading");
    setGeneration((value) => value + 1);
  }
  function setGameKey(key: string, pressed: boolean) {
    const index = gameKeyIndex(key);
    if (index < 0 || !controlRef.current) return;
    Atomics.store(new Int32Array(controlRef.current), index, pressed ? 1 : 0);
  }
  function setPointer(x: number, y: number) {
    if (!controlRef.current) return;
    const controls = new Int32Array(controlRef.current);
    Atomics.store(
      controls,
      POINTER_CONTROL_OFFSET,
      Math.round(Math.max(0, Math.min(32767, x))),
    );
    Atomics.store(
      controls,
      POINTER_CONTROL_OFFSET + 1,
      Math.round(Math.max(0, Math.min(32767, y))),
    );
  }
  function setPointerButton(button: number, pressed: boolean) {
    if (!controlRef.current || button < 0 || button > 2) return;
    Atomics.store(
      new Int32Array(controlRef.current),
      POINTER_CONTROL_OFFSET + 2 + button,
      pressed ? 1 : 0,
    );
  }
  function clearKeys() {
    if (!controlRef.current) return;
    const controls = new Int32Array(controlRef.current);
    for (let index = 0; index < controls.length; index += 1)
      Atomics.store(controls, index, 0);
  }
  return {
    state,
    status,
    output,
    graphics,
    version,
    interactive,
    install,
    run,
    respond,
    restart,
    setGameKey,
    setPointer,
    setPointerButton,
    clearKeys,
    clearGraphics: () => setGraphics(null),
    clear: () => setOutput([]),
  };
}
