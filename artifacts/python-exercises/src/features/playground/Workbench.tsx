import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  Play,
  Square,
  RotateCcw,
  Plus,
  FileCode2,
  Folder,
  Pencil,
  Trash2,
  Download,
  Upload,
  X,
  Package,
  Terminal,
  Files,
  ExternalLink,
  ChevronRight,
  Search,
  Maximize2,
  Minimize2,
  PanelBottomClose,
  PanelBottomOpen,
  Save,
  Undo2,
  CheckCircle2,
  Loader2,
  Gamepad2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import {
  availableMoveTargets,
  cleanPath,
  deletePath,
  destinationPaths,
  movePaths,
  newProject,
  newWorkspace,
  parseWorkspace,
  renamePath,
  validatePackage,
  validateProject,
  type Project,
  type ProjectFile,
  type Workspace,
  MAX_BYTES,
} from "./model";
import { FileTree } from "./FileTree";
import { loadWorkspace, saveWorkspace } from "./storage";
import { usePython } from "./usePython";
import { attachPythonSemantics, configurePythonEditor } from "./pythonEditor";
import { GraphicsStage } from "./GraphicsStage";
import { CHART_TEMPLATE, GAME_TEMPLATE, PYGAME_TEMPLATE } from "./graphics";
import "./workbench.css";

type EditorInstance = Parameters<OnMount>[0];
type DroppedFile = { file: File; relativePath: string };
type PackageFeedback = {
  kind: "info" | "success" | "error";
  text: string;
};
const PACKAGE_SUGGESTIONS = [
  "pygame",
  "numpy",
  "pandas",
  "matplotlib",
  "requests",
];
type LegacyFileEntry = {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  file?: (
    success: (file: File) => void,
    error?: (error: DOMException) => void,
  ) => void;
  createReader?: () => {
    readEntries: (
      success: (entries: LegacyFileEntry[]) => void,
      error?: (error: DOMException) => void,
    ) => void;
  };
};
type Action = {
  kind:
    | "project"
    | "rename-project"
    | "file"
    | "folder"
    | "move"
    | "rename"
    | "delete"
    | "delete-project";
  title: string;
  value: string;
  target?: string;
  sources?: string[];
};
function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function mimeFor(path: string) {
  return /\.png$/i.test(path)
    ? "image/png"
    : /\.jpe?g$/i.test(path)
      ? "image/jpeg"
      : /\.webp$/i.test(path)
        ? "image/webp"
        : /\.gif$/i.test(path)
          ? "image/gif"
          : "application/octet-stream";
}
function language(path: string) {
  const ext = path.split(".").at(-1);
  return (
    (
      {
        py: "python",
        json: "json",
        md: "markdown",
        html: "html",
        css: "css",
        js: "javascript",
        ts: "typescript",
        yaml: "yaml",
        yml: "yaml",
        sql: "sql",
      } as Record<string, string>
    )[ext || ""] || "plaintext"
  );
}

async function readEntry(
  entry: LegacyFileEntry,
  prefix = "",
): Promise<DroppedFile[]> {
  const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (entry.isFile && entry.file)
    return [
      {
        file: await new Promise<File>((resolve, reject) =>
          entry.file!(resolve, reject),
        ),
        relativePath,
      },
    ];
  if (!entry.isDirectory || !entry.createReader) return [];
  const reader = entry.createReader();
  const entries: LegacyFileEntry[] = [];
  while (true) {
    const batch = await new Promise<LegacyFileEntry[]>((resolve, reject) =>
      reader.readEntries(resolve, reject),
    );
    if (!batch.length) break;
    entries.push(...batch);
  }
  return (
    await Promise.all(entries.map((child) => readEntry(child, relativePath)))
  ).flat();
}

async function filesFromTransfer(transfer: DataTransfer) {
  const collected: DroppedFile[] = [];
  for (const item of Array.from(transfer.items)) {
    if (item.kind !== "file") continue;
    const entry = (
      item as DataTransferItem & {
        webkitGetAsEntry?: () => LegacyFileEntry | null;
      }
    ).webkitGetAsEntry?.();
    if (entry) collected.push(...(await readEntry(entry)));
  }
  if (collected.length) return collected;
  return Array.from(transfer.files).map((file) => ({
    file,
    relativePath: file.webkitRelativePath || file.name,
  }));
}
export function Workbench() {
  const { user } = useUser();
  return (
    <WorkspaceEditor key={user?.id || "guest"} owner={user?.id || "guest"} />
  );
}
function WorkspaceEditor({ owner }: { owner: string }) {
  const { theme } = useTheme();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [saved, setSaved] = useState("Cargando proyectos…"),
    [message, setMessage] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [explorer, setExplorer] = useState(() => window.innerWidth >= 768);
  const [bottomVisible, setBottomVisible] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const resize = () => {
      setNarrow(media.matches);
      if (media.matches) setExplorer(false);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  const [panel, setPanel] = useState<
    "console" | "graphics" | "packages" | "inputs" | "advanced"
  >("console");
  const [action, setAction] = useState<Action | null>(null),
    [actionError, setActionError] = useState("");
  const [packageName, setPackageName] = useState(""),
    [packageFeedback, setPackageFeedback] = useState<PackageFeedback | null>(
      null,
    ),
    [input, setInput] = useState(""),
    [preparedInputs, setPreparedInputs] = useState("");
  const [filter, setFilter] = useState(""),
    [closedFolders, setClosedFolders] = useState<string[]>([]);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [dirtyFiles, setDirtyFiles] = useState<string[]>([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [undoMove, setUndoMove] = useState<{
    project: Project;
    openFiles: string[];
    dirtyFiles: string[];
    closedFolders: string[];
    label: string;
  } | null>(null);
  const editorRef = useRef<EditorInstance | null>(null),
    runRef = useRef<() => void>(() => {});
  const workbenchRef = useRef<HTMLElement | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null),
    inputRef = useRef<HTMLInputElement>(null),
    filePicker = useRef<HTMLInputElement>(null),
    projectPicker = useRef<HTMLInputElement>(null);
  const importTarget = useRef("");
  const viewBeforeFocus = useRef({ explorer: true, bottom: true });
  const currentRef = useRef<Project | null>(null),
    activeRun = useRef<string | null>(null);
  const shownGraphicsSession = useRef(0);
  const project =
    workspace?.projects.find((p) => p.id === workspace.activeProject) || null;
  currentRef.current = project;
  function updateProject(
    update: (project: Project) => Project,
    preserveUndo = false,
  ) {
    if (!preserveUndo) setUndoMove(null);
    setWorkspace((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === prev.activeProject
            ? { ...update(p), updatedAt: Date.now() }
            : p,
        ),
      };
    });
  }
  const engine = usePython((files, folders) => {
    setWorkspace((prev) => {
      if (!prev) return prev;
      try {
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === activeRun.current
              ? validateProject({ ...p, files, folders })
              : p,
          ),
        };
      } catch (error) {
        setMessage(String(error));
        return prev;
      }
    });
  });
  const busy =
    engine.state === "running" ||
    engine.state === "input" ||
    engine.state === "installing";
  const previousProject = useRef<string | null>(null);
  useEffect(() => {
    if (
      project?.id &&
      previousProject.current &&
      previousProject.current !== project.id
    ) {
      engine.clear();
      engine.clearGraphics();
      engine.restart();
      setMessage("");
    }
    previousProject.current = project?.id || null;
  }, [project?.id]);

  useEffect(() => {
    let cancelled = false;
    loadWorkspace(owner)
      .then((value) => {
        if (cancelled) return;
        setWorkspace(value || newWorkspace());
        setStorageReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          "No se pudo abrir el guardado local: " +
            String(error) +
            ". Puedes trabajar y exportar tu proyecto.",
        );
        setSaved("Guardado no disponible");
        setWorkspace(newWorkspace());
      });
    return () => {
      cancelled = true;
    };
  }, [owner]);
  useEffect(() => {
    if (!workspace || !storageReady) return;
    let current = true;
    setSaved("Guardando…");
    // Start the transaction on every edit; it keeps running if the page component unmounts.
    saveWorkspace(owner, workspace)
      .then(() => {
        if (current) {
          setSaved("Guardado en este navegador");
          setDirtyFiles([]);
        }
      })
      .catch(() => {
        if (current) {
          setSaved("Error al guardar");
          setMessage(
            "No se pudo guardar. Descarga tu proyecto para conservarlo.",
          );
        }
      });
    return () => {
      current = false;
    };
  }, [workspace, storageReady, owner]);
  useEffect(() => {
    setOpenFiles(project?.activeFile ? [project.activeFile] : []);
    setDirtyFiles([]);
    setFilter("");
    setPackageName("");
    setPackageFeedback(null);
    try {
      const savedFolders = JSON.parse(
        localStorage.getItem(`pylearn-folders:${owner}:${project?.id}`) || "[]",
      );
      setClosedFolders(Array.isArray(savedFolders) ? savedFolders : []);
    } catch {
      setClosedFolders([]);
    }
  }, [project?.id]);
  useEffect(() => {
    if (project?.activeFile)
      setOpenFiles((prev) =>
        prev.includes(project.activeFile)
          ? prev
          : [...prev, project.activeFile],
      );
  }, [project?.activeFile]);
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [engine.output]);
  useEffect(() => {
    if (engine.state === "input") {
      setPanel("console");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [engine.state]);
  useEffect(() => {
    const session = engine.graphics?.session;
    if (!session || shownGraphicsSession.current === session) return;
    shownGraphicsSession.current = session;
    setBottomVisible(true);
    setPanel("graphics");
  }, [engine.graphics?.session]);
  useEffect(() => {
    if (!undoMove) return;
    const timer = window.setTimeout(() => setUndoMove(null), 8000);
    return () => window.clearTimeout(timer);
  }, [undoMove]);
  useEffect(() => {
    if (!focusMode) return;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [focusMode]);
  function execute() {
    const p = currentRef.current;
    if (!p || busy) return;
    const model = editorRef.current?.getModel();
    const fresh = {
      ...p,
      files: p.files.map((f) =>
        f.path === p.activeFile && f.encoding === "utf8" && model
          ? { ...f, content: model.getValue() }
          : f,
      ),
    };
    try {
      const validated = validateProject(fresh);
      activeRun.current = p.id;
      setPanel("console");
      engine.run(validated, preparedInputs ? preparedInputs.split("\n") : []);
    } catch (error) {
      setMessage(String(error));
    }
  }
  function createGraphicsExample(kind: "game" | "pygame" | "chart") {
    const p = currentRef.current;
    if (!p) return;
    const stem =
      kind === "game"
        ? "mi_juego"
        : kind === "pygame"
          ? "juego_pygame"
          : "mi_grafico";
    let path = `${stem}.py`;
    let suffix = 2;
    while (p.files.some((candidate) => candidate.path === path)) {
      path = `${stem}_${suffix}.py`;
      suffix += 1;
    }
    const content =
      kind === "game"
        ? GAME_TEMPLATE
        : kind === "pygame"
          ? PYGAME_TEMPLATE
          : CHART_TEMPLATE;
    updateProject((current) => ({
      ...current,
      files: [...current.files, { path, content, encoding: "utf8" }],
      activeFile: path,
      entryFile: path,
    }));
    setOpenFiles((previous) =>
      previous.includes(path) ? previous : [...previous, path],
    );
    setBottomVisible(true);
    setPanel("graphics");
    setMessage(
      kind === "chart"
        ? "Gráfico de ejemplo creado. Pulsa Ejecutar para verlo en Pantalla."
        : `${kind === "pygame" ? "Ejemplo Pygame" : "Juego de ejemplo"} creado. Pulsa Ejecutar y luego haz clic en la pantalla para jugar.`,
    );
    window.setTimeout(() => editorRef.current?.focus(), 0);
  }
  runRef.current = execute;
  const mount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    configurePythonEditor(monaco);
    const semanticHighlighting = attachPythonSemantics(editor, monaco);
    const action = editor.addAction({
      id: "pylearn.run",
      label: "Ejecutar proyecto Python",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => runRef.current(),
    });
    editor.onDidDispose(() => {
      action.dispose();
      semanticHighlighting.dispose();
      if (editorRef.current === editor) editorRef.current = null;
    });
  };
  function selectFile(path: string, line?: number) {
    updateProject((p) => ({ ...p, activeFile: path }));
    if (window.innerWidth < 768) setExplorer(false);
    if (line)
      setTimeout(() => {
        editorRef.current?.revealLineInCenter(line);
        editorRef.current?.setPosition({ lineNumber: line, column: 1 });
        editorRef.current?.focus();
      }, 100);
  }
  function closeFile(path: string) {
    const next = openFiles.filter((filePath) => filePath !== path);
    setOpenFiles(next);
    if (path === project?.activeFile)
      updateProject((current) => ({
        ...current,
        activeFile: next.at(-1) || "",
      }));
  }
  function persistCollapsed(paths: string[]) {
    if (!project) return;
    localStorage.setItem(
      `pylearn-folders:${owner}:${project.id}`,
      JSON.stringify(paths),
    );
  }
  function changeCollapsed(paths: string[]) {
    setClosedFolders(paths);
    persistCollapsed(paths);
  }
  function toggleFocus() {
    if (!focusMode) {
      viewBeforeFocus.current = { explorer, bottom: bottomVisible };
      setExplorer(false);
      setBottomVisible(false);
      setFocusMode(true);
    } else {
      setExplorer(viewBeforeFocus.current.explorer);
      setBottomVisible(viewBeforeFocus.current.bottom);
      setFocusMode(false);
    }
  }
  async function forceSave() {
    if (!workspace) return;
    setSaved("Guardando…");
    try {
      await saveWorkspace(owner, workspace);
      setSaved("Guardado en este navegador");
      setDirtyFiles([]);
    } catch {
      setSaved("Error al guardar");
      setMessage("No se pudo guardar. Exporta el proyecto para conservarlo.");
    }
  }
  async function installPackage() {
    if (!project) return;
    try {
      const name = validatePackage(packageName);
      if (project.packages.includes(name)) {
        setPackageName("");
        setPackageFeedback({
          kind: "info",
          text: `${name} ya está configurada en este proyecto.`,
        });
        return;
      }
      if (project.packages.length >= 50)
        throw Error("El proyecto ya tiene 50 bibliotecas configuradas.");
      setPackageFeedback({
        kind: "info",
        text: `Descargando e instalando ${name}…`,
      });
      await engine.install([name]);
      updateProject((current) => ({
        ...current,
        packages: [...new Set([...current.packages, name])],
      }));
      setPackageName("");
      setPackageFeedback({
        kind: "success",
        text: `${name} quedó instalada y vinculada al proyecto.`,
      });
    } catch (error) {
      setPackageFeedback({
        kind: "error",
        text: error instanceof Error ? error.message : String(error),
      });
    }
  }
  function createAt(kind: "file" | "folder", targetFolder: string) {
    ask({
      kind,
      title: kind === "file" ? "Nuevo archivo" : "Nueva carpeta",
      value: targetFolder ? `${targetFolder}/` : "",
    });
  }
  function renameNode(path: string) {
    ask({
      kind: "rename",
      title: "Renombrar o mover",
      value: path,
      target: path,
    });
  }
  function deleteNode(path: string) {
    ask({
      kind: "delete",
      title: `Eliminar ${path}`,
      value: "",
      target: path,
    });
  }
  function moveSelection(
    sources: string[],
    targetFolder: string,
    reportError: (message: string) => void = setMessage,
  ): boolean {
    if (!project || busy) return false;
    try {
      const normalized = [...new Set(sources.map(cleanPath))].filter(
        (path, _index, paths) =>
          !paths.some(
            (parent) =>
              parent !== path &&
              (path === parent || path.startsWith(parent + "/")),
          ),
      );
      const destinations = destinationPaths(normalized, targetFolder);
      const next = movePaths(project, normalized, targetFolder);
      if (next === project) {
        reportError("Los elementos seleccionados ya están en ese destino.");
        return false;
      }
      const relocate = (path: string) => {
        const index = normalized.findIndex(
          (source) => path === source || path.startsWith(source + "/"),
        );
        return index === -1
          ? path
          : destinations[index] + path.slice(normalized[index].length);
      };
      setUndoMove({
        project,
        openFiles,
        dirtyFiles,
        closedFolders,
        label:
          normalized.length === 1
            ? `Moviste ${normalized[0].split("/").at(-1)}`
            : `Moviste ${normalized.length} elementos`,
      });
      setOpenFiles([...new Set(openFiles.map(relocate))]);
      setDirtyFiles([...new Set(dirtyFiles.map(relocate))]);
      const relocatedFolders = [...new Set(closedFolders.map(relocate))];
      setClosedFolders(relocatedFolders);
      persistCollapsed(relocatedFolders);
      updateProject(() => next, true);
      return true;
    } catch (error) {
      reportError(error instanceof Error ? error.message : String(error));
      return false;
    }
  }
  function requestMove(sources: string[]) {
    if (!project || busy) return;
    const targets = availableMoveTargets(project, sources);
    if (!targets.length) {
      setMessage("No hay otra carpeta válida a la que mover esta selección.");
      return;
    }
    ask({
      kind: "move",
      title:
        sources.length === 1
          ? `Mover ${sources[0].split("/").at(-1)}`
          : `Mover ${sources.length} elementos`,
      value: targets[0],
      sources,
    });
  }
  function undoLastMove() {
    if (!undoMove) return;
    setOpenFiles(undoMove.openFiles);
    setDirtyFiles(undoMove.dirtyFiles);
    setClosedFolders(undoMove.closedFolders);
    persistCollapsed(undoMove.closedFolders);
    updateProject(() => undoMove.project, true);
    setUndoMove(null);
    setMessage("Movimiento deshecho.");
  }
  function ask(value: Action) {
    setActionError("");
    setAction(value);
  }
  function applyAction() {
    if (!action || !project) return;
    try {
      if (action.kind === "project") {
        if (workspace!.projects.length >= 50)
          throw Error(
            "Puedes guardar hasta 50 proyectos en este navegador. Exporta uno antes de crear otro.",
          );
        if (!action.value.trim() || action.value.length > 100)
          throw Error("Escribe un nombre de hasta 100 caracteres.");
        const p = newProject(action.value);
        setWorkspace((w) =>
          w ? { ...w, activeProject: p.id, projects: [...w.projects, p] } : w,
        );
      } else if (action.kind === "delete-project") {
        setWorkspace((w) => {
          if (!w) return w;
          const projects = w.projects.filter((p) => p.id !== project.id);
          if (!projects.length) projects.push(newProject());
          return { ...w, projects, activeProject: projects[0].id };
        });
      } else if (action.kind === "rename-project") {
        if (!action.value.trim() || action.value.length > 100)
          throw Error("Escribe un nombre de hasta 100 caracteres.");
        updateProject((p) => ({ ...p, name: action.value.trim() }));
      } else if (action.kind === "move") {
        if (!action.sources?.length)
          throw Error("Selecciona al menos un archivo o carpeta.");
        if (!moveSelection(action.sources, action.value, setActionError))
          return;
      } else {
        let next = project;
        let preserveUndo = false;
        if (action.kind === "rename") {
          const from = action.target!;
          const to = cleanPath(action.value);
          next = renamePath(project, from, to);
          const replace = (path: string) =>
            path === from
              ? to
              : path.startsWith(from + "/")
                ? to + path.slice(from.length)
                : path;
          setUndoMove({
            project,
            openFiles,
            dirtyFiles,
            closedFolders,
            label: `Renombraste ${from.split("/").at(-1)}`,
          });
          setOpenFiles(openFiles.map(replace));
          setDirtyFiles(dirtyFiles.map(replace));
          const renamedFolders = closedFolders.map(replace);
          setClosedFolders(renamedFolders);
          persistCollapsed(renamedFolders);
          preserveUndo = true;
        }
        if (action.kind === "delete") {
          next = deletePath(project, action.target!);
          setOpenFiles((current) =>
            current.filter(
              (path) =>
                path !== action.target &&
                !path.startsWith(action.target! + "/"),
            ),
          );
          setDirtyFiles((current) =>
            current.filter(
              (path) =>
                path !== action.target &&
                !path.startsWith(action.target! + "/"),
            ),
          );
        }
        if (action.kind === "file" || action.kind === "folder") {
          const path = cleanPath(action.value);
          if (
            project.files.some((f) => f.path === path) ||
            project.folders.includes(path)
          )
            throw Error("Ese nombre ya existe.");
          next = validateProject(
            action.kind === "file"
              ? {
                  ...project,
                  files: [
                    ...project.files,
                    { path, content: "", encoding: "utf8" },
                  ],
                  activeFile: path,
                }
              : { ...project, folders: [...project.folders, path] },
          );
        }
        updateProject(() => next, preserveUndo);
      }
      setAction(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  }
  async function importFiles(
    source: FileList | DroppedFile[] | null,
    targetFolder = "",
  ) {
    if (!source || !project) return;
    try {
      const incoming: ProjectFile[] = [];
      const dropped: DroppedFile[] = Array.isArray(source)
        ? source
        : Array.from(source).map((file) => ({
            file,
            relativePath: file.webkitRelativePath || file.name,
          }));
      for (const { file, relativePath } of dropped) {
        if (file.size > MAX_BYTES) throw Error("El archivo supera los 20 MB.");
        const path = cleanPath(
          [targetFolder, relativePath].filter(Boolean).join("/"),
        );
        const bytes = new Uint8Array(await file.arrayBuffer());
        let content: string,
          encoding: "utf8" | "base64" = "utf8";
        try {
          content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
          if (content.includes("\0")) throw Error();
        } catch {
          encoding = "base64";
          let binary = "";
          for (let i = 0; i < bytes.length; i += 8192)
            binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
          content = btoa(binary);
        }
        incoming.push({ path, content, encoding });
      }
      if (
        new Set(incoming.map((file) => file.path)).size !== incoming.length ||
        incoming.some((file) => project.files.some((f) => f.path === file.path))
      )
        throw Error(
          "Ya existe un archivo con ese nombre. Renómbralo antes de importar.",
        );
      const next = validateProject({
        ...project,
        files: [...project.files, ...incoming],
        activeFile: incoming[0]?.path || project.activeFile,
      });
      updateProject(() => next);
      if (targetFolder)
        changeCollapsed(
          closedFolders.filter((folder) => folder !== targetFolder),
        );
      setMessage(
        incoming.length === 1
          ? `${incoming[0].path} se añadió al proyecto.`
          : `${incoming.length} archivos se añadieron al proyecto.`,
      );
    } catch (error) {
      setMessage(String(error));
    }
  }
  async function dropFiles(transfer: DataTransfer, targetFolder: string) {
    try {
      const files = await filesFromTransfer(transfer);
      if (!files.length)
        throw Error("No se encontraron archivos para importar.");
      await importFiles(files, targetFolder);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }
  function requestImport(targetFolder: string) {
    importTarget.current = targetFolder;
    filePicker.current?.click();
  }
  async function importProject(file?: File) {
    if (!file) return;
    try {
      if (file.size > MAX_BYTES * 2)
        throw Error("El respaldo es demasiado grande.");
      const data = JSON.parse(await file.text());
      const imported =
        data.version === 1
          ? parseWorkspace(data).projects
          : [validateProject(data)];
      const copies = imported.map((p) => ({ ...p, id: crypto.randomUUID() }));
      const next = parseWorkspace({
        ...workspace!,
        projects: [...workspace!.projects, ...copies],
        activeProject: copies[0].id,
      });
      setWorkspace(next);
      setMessage("Proyecto importado como una copia.");
    } catch (error) {
      setMessage("No se pudo importar: " + String(error));
    }
  }
  function downloadFile(file: ProjectFile) {
    const bytes =
      file.encoding === "base64"
        ? Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0))
        : file.content;
    download(file.path.split("/").at(-1)!, bytes, "application/octet-stream");
  }
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!workbenchRef.current || workbenchRef.current.offsetParent === null)
        return;
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (event.key === "Escape" && focusMode && !action && !quickOpen) {
        event.preventDefault();
        toggleFocus();
        return;
      }
      if (!command || action) return;
      if (key === "p") {
        event.preventDefault();
        setQuickQuery("");
        setQuickOpen(true);
      } else if (key === "s") {
        event.preventDefault();
        void forceSave();
      } else if (key === "n" && !busy) {
        event.preventDefault();
        createAt(event.shiftKey ? "folder" : "file", "");
      } else if (key === "w" && project?.activeFile && !busy) {
        event.preventDefault();
        closeFile(project.activeFile);
      } else if (key === "f" && event.shiftKey) {
        event.preventDefault();
        toggleFocus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [action, busy, focusMode, project?.activeFile, quickOpen, workspace]);
  if (!workspace || !project)
    return (
      <div className="workbench-loading" role="status">
        {saved}
      </div>
    );
  const file = project.files.find((f) => f.path === project.activeFile);
  const tabs = openFiles.filter((path) =>
    project.files.some((f) => f.path === path),
  );
  const moveTargets =
    action?.kind === "move" && action.sources
      ? availableMoveTargets(project, action.sources)
      : [];
  const quickFiles = project.files
    .filter((candidate) =>
      candidate.path.toLowerCase().includes(quickQuery.trim().toLowerCase()),
    )
    .slice(0, 12);
  const problems = engine.output.flatMap((chunk) =>
    Array.from(
      chunk.text.matchAll(/File "\/workspace\/([^"]+)", line (\d+)/g),
      (m) => ({ path: m[1], line: Number(m[2]) }),
    ),
  );
  return (
    <section
      ref={workbenchRef}
      className={`pylearn-workbench${focusMode ? " is-focus" : ""}`}
      aria-label="Espacio de trabajo Python"
    >
      {message && (
        <div className="wb-notice" role="status">
          <span>{message}</span>
          <button aria-label="Cerrar aviso" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {undoMove && (
        <div className="wb-undo-toast" role="status">
          <span>{undoMove.label}</span>
          <button onClick={undoLastMove}>
            <Undo2 size={15} /> Deshacer
          </button>
          <button aria-label="Cerrar" onClick={() => setUndoMove(null)}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="wb-toolbar">
        <button
          onClick={() => setExplorer((v) => !v)}
          aria-label="Mostrar archivos"
          aria-expanded={explorer}
        >
          <Files size={17} />
        </button>
        <label className="wb-project-select">
          <span className="sr-only">Proyecto</span>
          <select
            aria-label="Proyecto"
            disabled={busy}
            value={project.id}
            onChange={(e) =>
              setWorkspace((w) =>
                w ? { ...w, activeProject: e.target.value } : w,
              )
            }
          >
            {workspace.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button
          title="Nuevo proyecto"
          disabled={busy}
          onClick={() =>
            ask({ kind: "project", title: "Nuevo proyecto", value: "" })
          }
        >
          <Plus size={16} />
          <span>Proyecto</span>
        </button>
        <button
          title="Renombrar proyecto"
          aria-label="Renombrar proyecto"
          disabled={busy}
          onClick={() =>
            ask({
              kind: "rename-project",
              title: "Nombre del proyecto",
              value: project.name,
            })
          }
        >
          <Pencil size={15} />
        </button>
        <div className="wb-toolbar-spacer" />
        <span className="wb-save" role="status">
          {saved}
        </span>
        <button
          title="Guardar ahora (Ctrl+S)"
          aria-label="Guardar ahora"
          disabled={!storageReady}
          onClick={() => void forceSave()}
        >
          <Save size={16} />
        </button>
        <label className="wb-entry">
          <span>Ejecutar</span>
          <select
            aria-label="Archivo de inicio"
            value={project.entryFile}
            disabled={busy}
            onChange={(e) =>
              updateProject((p) => ({ ...p, entryFile: e.target.value }))
            }
          >
            {!project.entryFile && <option value="">Sin archivo Python</option>}
            {project.files
              .filter((f) => f.path.endsWith(".py") && f.encoding === "utf8")
              .map((f) => (
                <option key={f.path}>{f.path}</option>
              ))}
          </select>
        </label>
        <button
          className="wb-run"
          onClick={execute}
          disabled={engine.state !== "ready" || !project.entryFile}
        >
          <Play size={16} />
          <span>Ejecutar</span>
        </button>
        <button
          title="Detener programa"
          aria-label="Detener programa"
          disabled={!busy}
          onClick={engine.restart}
        >
          <Square size={15} />
        </button>
        <button
          title="Reiniciar Python"
          aria-label="Reiniciar Python"
          onClick={engine.restart}
        >
          <RotateCcw size={16} />
        </button>
        <button
          title={
            bottomVisible ? "Ocultar panel inferior" : "Mostrar panel inferior"
          }
          aria-label={
            bottomVisible ? "Ocultar panel inferior" : "Mostrar panel inferior"
          }
          aria-pressed={bottomVisible}
          onClick={() => setBottomVisible((visible) => !visible)}
        >
          {bottomVisible ? (
            <PanelBottomClose size={17} />
          ) : (
            <PanelBottomOpen size={17} />
          )}
        </button>
        <button
          title={
            focusMode
              ? "Salir del modo enfoque (Esc)"
              : "Modo enfoque (Ctrl+Shift+F)"
          }
          aria-label={
            focusMode ? "Salir del modo enfoque" : "Activar modo enfoque"
          }
          aria-pressed={focusMode}
          onClick={toggleFocus}
        >
          {focusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      </div>
      <div className="wb-frame">
        <PanelGroup
          direction="horizontal"
          autoSaveId={
            narrow
              ? "pylearn-workbench-columns-mobile"
              : "pylearn-workbench-columns"
          }
        >
          {explorer && (
            <>
              <Panel
                id="files"
                order={1}
                defaultSize={narrow ? 78 : 23}
                minSize={narrow ? 70 : 18}
                maxSize={narrow ? 88 : 42}
              >
                <aside className="wb-explorer">
                  <div className="wb-section-title">
                    <span>ARCHIVOS</span>
                    <div>
                      <button
                        aria-label="Nuevo archivo"
                        title="Nuevo archivo"
                        disabled={busy}
                        onClick={() => createAt("file", "")}
                      >
                        <FileCode2 size={16} />
                      </button>
                      <button
                        aria-label="Nueva carpeta"
                        title="Nueva carpeta"
                        disabled={busy}
                        onClick={() => createAt("folder", "")}
                      >
                        <Folder size={16} />
                      </button>
                      <button
                        aria-label="Subir archivos"
                        title="Subir archivos"
                        disabled={busy}
                        onClick={() => requestImport("")}
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                  <label className="wb-search">
                    <Search size={14} />
                    <input
                      aria-label="Buscar archivo"
                      placeholder="Buscar archivo…"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </label>
                  <FileTree
                    project={project}
                    activeFile={project.activeFile}
                    busy={busy}
                    filter={filter}
                    collapsed={closedFolders}
                    onCollapsedChange={changeCollapsed}
                    onSelectFile={selectFile}
                    onMove={moveSelection}
                    onMoveRequest={requestMove}
                    onDropFiles={(transfer, targetFolder) => {
                      void dropFiles(transfer, targetFolder);
                    }}
                    onCreate={createAt}
                    onRename={renameNode}
                    onDelete={deleteNode}
                    onImportRequest={requestImport}
                    onDownload={(path) => {
                      const candidate = project.files.find(
                        (projectFile) => projectFile.path === path,
                      );
                      if (candidate) downloadFile(candidate);
                    }}
                  />
                  <div className="wb-explorer-footer">
                    <button
                      onClick={() =>
                        download(
                          project.name + ".pylearn.json",
                          JSON.stringify(project, null, 2),
                          "application/json",
                        )
                      }
                    >
                      <Download size={15} /> Exportar proyecto
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => projectPicker.current?.click()}
                    >
                      <Upload size={15} /> Importar proyecto
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        ask({
                          kind: "delete-project",
                          title: "Eliminar proyecto",
                          value: "",
                        })
                      }
                    >
                      <Trash2 size={15} /> Eliminar proyecto
                    </button>
                  </div>
                </aside>
              </Panel>
              <PanelResizeHandle className="wb-resize" />
            </>
          )}
          <Panel id="editor" order={2} minSize={narrow ? 12 : 40}>
            <PanelGroup
              direction="vertical"
              autoSaveId={
                narrow
                  ? "pylearn-workbench-rows-mobile"
                  : "pylearn-workbench-rows"
              }
            >
              <Panel
                id="code"
                order={1}
                defaultSize={bottomVisible ? 70 : 100}
                minSize={25}
              >
                <div className="wb-editor-pane">
                  <div className="wb-tabs" aria-label="Archivos abiertos">
                    {tabs.map((path) => (
                      <div
                        key={path}
                        className={
                          "wb-tab " +
                          (path === project.activeFile ? "is-active" : "")
                        }
                      >
                        <button
                          disabled={busy}
                          onClick={() => selectFile(path)}
                          title={path}
                        >
                          <span>{path.split("/").at(-1)}</span>
                          {dirtyFiles.includes(path) && (
                            <i
                              className="wb-dirty-dot"
                              title="Guardando cambios"
                            />
                          )}
                        </button>
                        <button
                          aria-label={"Cerrar " + path}
                          disabled={busy}
                          onClick={() => closeFile(path)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {file && (
                      <button
                        className="wb-download-file"
                        title="Descargar archivo"
                        aria-label="Descargar archivo"
                        onClick={() => downloadFile(file)}
                      >
                        <Download size={15} />
                      </button>
                    )}
                  </div>
                  {file && (
                    <nav
                      className="wb-breadcrumbs"
                      aria-label="Ruta del archivo"
                    >
                      <button onClick={() => setExplorer(true)}>
                        {project.name}
                      </button>
                      {file.path.split("/").map((part, index, parts) => {
                        const path = parts.slice(0, index + 1).join("/");
                        const isFile = index === parts.length - 1;
                        return (
                          <span key={path}>
                            <ChevronRight />
                            <button
                              disabled={isFile}
                              onClick={() => {
                                setExplorer(true);
                                changeCollapsed(
                                  closedFolders.filter(
                                    (folder) => folder !== path,
                                  ),
                                );
                              }}
                            >
                              {part}
                            </button>
                          </span>
                        );
                      })}
                    </nav>
                  )}
                  <div className="wb-editor-body">
                    {!file ? (
                      <div className="wb-empty">
                        Abre un archivo del explorador para empezar.
                      </div>
                    ) : file.encoding === "base64" ? (
                      <div className="wb-preview">
                        {mimeFor(file.path).startsWith("image/") ? (
                          <img
                            src={
                              "data:" +
                              mimeFor(file.path) +
                              ";base64," +
                              file.content
                            }
                            alt={file.path}
                          />
                        ) : (
                          <p>Archivo binario · {file.path}</p>
                        )}
                        <button onClick={() => downloadFile(file)}>
                          Descargar archivo
                        </button>
                      </div>
                    ) : (
                      <Editor
                        height="100%"
                        path={"file:///" + project.id + "/" + file.path}
                        language={language(file.path)}
                        value={file.content}
                        theme={
                          theme === "dark" ? "pylearn-dark" : "pylearn-light"
                        }
                        beforeMount={configurePythonEditor}
                        onMount={mount}
                        onChange={(value) => {
                          setDirtyFiles((current) =>
                            current.includes(file.path)
                              ? current
                              : [...current, file.path],
                          );
                          updateProject((p) => ({
                            ...p,
                            files: p.files.map((f) =>
                              f.path === p.activeFile
                                ? { ...f, content: value || "" }
                                : f,
                            ),
                          }));
                        }}
                        options={{
                          readOnly: busy,
                          fontSize: 14,
                          fontFamily: "'JetBrains Mono', monospace",
                          minimap: { enabled: false },
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          tabSize: 4,
                          insertSpaces: true,
                          detectIndentation: true,
                          autoIndent: "full",
                          formatOnPaste: true,
                          formatOnType: true,
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          bracketPairColorization: {
                            enabled: true,
                            independentColorPoolPerBracketType: true,
                          },
                          guides: {
                            indentation: true,
                            highlightActiveIndentation: true,
                            bracketPairs: true,
                            bracketPairsHorizontal: true,
                          },
                          folding: true,
                          showFoldingControls: "always",
                          matchBrackets: "always",
                          quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: false,
                          },
                          suggestOnTriggerCharacters: true,
                          parameterHints: { enabled: true },
                          wordWrap: "off",
                          rulers: [88],
                          renderWhitespace: "selection",
                          renderLineHighlight: "all",
                          smoothScrolling: true,
                          cursorSmoothCaretAnimation: "on",
                          fontLigatures: true,
                          lineNumbersMinChars: 3,
                          padding: { top: 14 },
                          ariaLabel: "Código del archivo " + file.path,
                        }}
                      />
                    )}
                  </div>
                </div>
              </Panel>
              {bottomVisible && (
                <>
                  <PanelResizeHandle className="wb-resize horizontal" />
                  <Panel id="console" order={2} defaultSize={30} minSize={16}>
                    <div className="wb-bottom">
                      <div
                        className="wb-panel-tabs"
                        role="tablist"
                        aria-label="Herramientas"
                      >
                        {(
                          [
                            ["console", "Consola", Terminal],
                            ["graphics", "Pantalla", Gamepad2],
                            ["packages", "Bibliotecas", Package],
                            ["inputs", "Entradas", ChevronRight],
                            ["advanced", "Entorno avanzado", ExternalLink],
                          ] as const
                        ).map(([id, label, Icon]) => (
                          <button
                            key={id}
                            role="tab"
                            aria-selected={panel === id}
                            onClick={() => setPanel(id)}
                          >
                            <Icon size={14} />
                            {label}
                          </button>
                        ))}
                        {(panel === "console" || panel === "graphics") && (
                          <button
                            className="wb-clear"
                            title={
                              panel === "console"
                                ? "Limpiar consola"
                                : "Limpiar pantalla"
                            }
                            aria-label={
                              panel === "console"
                                ? "Limpiar consola"
                                : "Limpiar pantalla"
                            }
                            onClick={
                              panel === "console"
                                ? engine.clear
                                : engine.clearGraphics
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {panel === "console" && (
                        <div className="wb-console-panel">
                          <div
                            className="wb-output"
                            ref={consoleRef}
                            aria-label="Salida de Python"
                          >
                            {!engine.output.length && (
                              <span className="wb-output-hint">
                                La salida aparecerá aquí. Ejecuta con Ctrl +
                                Enter.
                              </span>
                            )}
                            {engine.output.map((chunk, i) => (
                              <span
                                key={i}
                                className={"wb-output-" + chunk.stream}
                              >
                                {chunk.text}
                              </span>
                            ))}
                            {!!problems.length && (
                              <div className="wb-problems">
                                {problems
                                  .filter((p) =>
                                    project.files.some(
                                      (f) => f.path === p.path,
                                    ),
                                  )
                                  .map((p, i) => (
                                    <button
                                      key={i}
                                      disabled={busy}
                                      onClick={() => selectFile(p.path, p.line)}
                                    >
                                      Ir a {p.path}:{p.line}
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                          {engine.state === "input" && (
                            <form
                              className="wb-input-line"
                              onSubmit={(e) => {
                                e.preventDefault();
                                engine.respond(input);
                                setInput("");
                              }}
                            >
                              <ChevronRight size={16} />
                              <input
                                autoFocus
                                ref={inputRef}
                                aria-label="Respuesta para input()"
                                placeholder="Escribe una respuesta y pulsa Enter…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                              />
                              <button type="submit">Enviar</button>
                              <button
                                type="button"
                                onClick={() => engine.respond("", true)}
                              >
                                Fin
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                      {panel === "graphics" &&
                        (engine.graphics ? (
                          <GraphicsStage
                            output={engine.graphics}
                            files={project.files}
                            running={engine.state === "running"}
                            keyboardAvailable={engine.interactive}
                            onKeyChange={engine.setGameKey}
                            onPointerMove={engine.setPointer}
                            onPointerButton={engine.setPointerButton}
                            onClearKeys={engine.clearKeys}
                          />
                        ) : (
                          <div className="wb-graphics-empty">
                            <span className="wb-graphics-empty-icon">
                              <Gamepad2 size={30} aria-hidden="true" />
                            </span>
                            <h2>Crea sin salir de Pylearn</h2>
                            <p>
                              Dibuja y anima un juego con Python. Los gráficos
                              con <code>plt.show()</code> también aparecerán
                              aquí. Pylearn adapta los usos educativos más
                              comunes de <code>pygame</code>,{" "}
                              <code>turtle</code>y <code>tkinter.Canvas</code>{" "}
                              al navegador.
                            </p>
                            <div className="wb-graphics-starters">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => createGraphicsExample("game")}
                              >
                                <Gamepad2 size={15} /> Crear juego de ejemplo
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => createGraphicsExample("pygame")}
                              >
                                <Gamepad2 size={15} /> Ejemplo Pygame
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => createGraphicsExample("chart")}
                              >
                                <Play size={15} /> Crear gráfico de ejemplo
                              </button>
                            </div>
                          </div>
                        ))}
                      {panel === "packages" && (
                        <div className="wb-panel-content">
                          <p>
                            Instala bibliotecas dentro del Python del navegador.
                            También quedarán preparadas para las próximas
                            ejecuciones. Puedes indicar una versión:{" "}
                            <code>numpy==2.0.2</code>.
                          </p>
                          <form
                            className="wb-inline-form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              void installPackage();
                            }}
                          >
                            <input
                              aria-label="Nombre de biblioteca"
                              placeholder="Ej. numpy, pandas, matplotlib"
                              value={packageName}
                              onChange={(e) => setPackageName(e.target.value)}
                              disabled={busy}
                            />
                            <button
                              disabled={
                                engine.state !== "ready" || !packageName.trim()
                              }
                            >
                              {engine.state === "installing" ? (
                                <>
                                  <Loader2 className="wb-spin" size={14} />
                                  Instalando
                                </>
                              ) : (
                                "Instalar"
                              )}
                            </button>
                          </form>
                          <div
                            className="wb-package-suggestions"
                            aria-label="Bibliotecas sugeridas"
                          >
                            <span>Prueba:</span>
                            {PACKAGE_SUGGESTIONS.map((name) => (
                              <button
                                key={name}
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  setPackageName(name);
                                  setPackageFeedback(null);
                                }}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                          {packageFeedback && (
                            <p
                              className={`wb-package-feedback is-${packageFeedback.kind}`}
                              role={
                                packageFeedback.kind === "error"
                                  ? "alert"
                                  : "status"
                              }
                            >
                              {packageFeedback.text}
                            </p>
                          )}
                          <div className="wb-package-list">
                            {project.packages.map((name) => (
                              <span
                                key={name}
                                title="Se instalará automáticamente cuando sea necesario"
                              >
                                <CheckCircle2 size={13} aria-hidden="true" />
                                {name}
                                <button
                                  aria-label={"Quitar " + name}
                                  disabled={busy}
                                  onClick={() => {
                                    setPackageFeedback(null);
                                    updateProject((p) => ({
                                      ...p,
                                      packages: p.packages.filter(
                                        (n) => n !== name,
                                      ),
                                    }));
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <p className="wb-muted">
                            Pygame, Turtle, Tkinter Canvas y Pylearn ya incluyen
                            adaptación web; no necesitan una ventana externa. El
                            navegador admite paquetes Python puros y los
                            compilados para Pyodide. Si un paquete no es
                            compatible, verás el motivo aquí. Para otras
                            dependencias, utiliza el entorno avanzado. Usa
                            <code> plt.show()</code> para ver los gráficos en
                            Pantalla; también puedes guardarlos con
                            <code> plt.savefig("grafico.png")</code>.
                          </p>
                        </div>
                      )}
                      {panel === "inputs" && (
                        <div className="wb-panel-content">
                          <p>
                            {engine.interactive
                              ? "input() pedirá cada respuesta en la consola mientras se ejecuta tu programa."
                              : "Este alojamiento no habilita la entrada interactiva. Puedes preparar las respuestas aquí, una por línea."}
                          </p>
                          {!engine.interactive && (
                            <textarea
                              aria-label="Entradas preparadas"
                              value={preparedInputs}
                              onChange={(e) =>
                                setPreparedInputs(e.target.value)
                              }
                              placeholder={"Ana\n20"}
                              disabled={busy}
                            />
                          )}
                          <p className="wb-muted">
                            El botón Detener permite salir de un programa que
                            espera una respuesta o que tiene un bucle infinito.
                          </p>
                        </div>
                      )}
                      {panel === "advanced" && (
                        <div className="wb-panel-content">
                          <h2>
                            Tu entorno con Python, terminal y proyectos web
                          </h2>
                          <p>
                            La prueba local usa code-server y Python en un
                            contenedor independiente. Su guardado es distinto al
                            de este navegador.
                          </p>
                          <p>
                            Exporta este proyecto y usa el importador incluido
                            en el entorno avanzado para continuar allí.
                          </p>
                          {import.meta.env.VITE_ADVANCED_EDITOR_URL ? (
                            <a
                              className="wb-advanced-link"
                              href={import.meta.env.VITE_ADVANCED_EDITOR_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Abrir entorno avanzado <ExternalLink size={15} />
                            </a>
                          ) : (
                            <p className="wb-muted">
                              Entorno avanzado pendiente de iniciar en este
                              equipo. El editor del navegador está disponible
                              mientras tanto.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
      <footer className="wb-status">
        <span role="status">
          <i className={busy ? "is-running" : ""} />
          {engine.status}
          {engine.version ? " · Python " + engine.version : ""}
        </span>
        <span>
          {project.files.length} archivos ·{" "}
          {file?.path || "Sin archivo abierto"}
        </span>
      </footer>
      <input
        ref={filePicker}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          void importFiles(e.target.files, importTarget.current);
          importTarget.current = "";
          e.target.value = "";
        }}
      />
      <input
        ref={projectPicker}
        type="file"
        accept=".json,.pylearn.json"
        hidden
        onChange={(e) => {
          void importProject(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Dialog
        open={quickOpen}
        onOpenChange={(open) => {
          setQuickOpen(open);
          if (!open) setQuickQuery("");
        }}
      >
        <DialogContent className="wb-quick-open">
          <DialogTitle>Abrir archivo</DialogTitle>
          <DialogDescription>
            Busca por nombre o ruta. Atajo: Ctrl + P.
          </DialogDescription>
          <input
            autoFocus
            aria-label="Buscar archivo para abrir"
            placeholder="Escribe el nombre de un archivo…"
            value={quickQuery}
            onChange={(event) => setQuickQuery(event.target.value)}
          />
          <div className="wb-quick-results">
            {quickFiles.map((candidate) => (
              <button
                key={candidate.path}
                onClick={() => {
                  selectFile(candidate.path);
                  setQuickOpen(false);
                }}
              >
                <FileCode2 size={15} />
                <span>{candidate.path}</span>
              </button>
            ))}
            {!quickFiles.length && <p>No se encontraron archivos.</p>}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{action?.title}</DialogTitle>
          <DialogDescription>
            {action?.kind.startsWith("delete")
              ? "Se eliminará del guardado de este navegador. Exporta una copia si quieres conservarlo."
              : action?.kind === "move"
                ? "Elige la carpeta de destino. El archivo conservará su contenido y las pestañas abiertas se actualizarán."
                : "Para organizar archivos puedes escribir una ruta como utilidades/calculos.py."}
          </DialogDescription>
          <form
            className="wb-dialog-form"
            onSubmit={(e) => {
              e.preventDefault();
              applyAction();
            }}
          >
            {action?.kind === "move" ? (
              <label className="wb-move-picker">
                <span>Carpeta de destino</span>
                <select
                  autoFocus
                  aria-label="Carpeta de destino"
                  value={action.value}
                  onChange={(event) =>
                    setAction((current) =>
                      current
                        ? { ...current, value: event.target.value }
                        : current,
                    )
                  }
                >
                  {moveTargets.map((folder) => (
                    <option key={folder || "root"} value={folder}>
                      {folder || "/ (raíz del proyecto)"}
                    </option>
                  ))}
                </select>
              </label>
            ) : !action?.kind.startsWith("delete") ? (
              <input
                autoFocus
                aria-label="Nombre o ruta"
                value={action?.value || ""}
                onChange={(e) =>
                  setAction((a) => (a ? { ...a, value: e.target.value } : a))
                }
              />
            ) : null}
            {actionError && <p role="alert">{actionError}</p>}
            <div>
              <button type="button" onClick={() => setAction(null)}>
                Cancelar
              </button>
              <button type="submit">
                {action?.kind.startsWith("delete")
                  ? "Eliminar"
                  : action?.kind === "move"
                    ? "Mover"
                    : "Guardar"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
