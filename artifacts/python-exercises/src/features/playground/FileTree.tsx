import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";
import {
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  FolderInput,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiC,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiGit,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJupyter,
  SiKotlin,
  SiLua,
  SiMarkdown,
  SiOpenjdk,
  SiPhp,
  SiPython,
  SiR,
  SiReact,
  SiRuby,
  SiRust,
  SiShell,
  SiSwift,
  SiToml,
  SiTypescript,
  SiYaml,
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";
import {
  VscDatabase,
  VscFileBinary,
  VscFileCode,
  VscFileMedia,
  VscFilePdf,
  VscFileZip,
  VscJson,
  VscSettingsGear,
  VscTable,
  VscTerminalPowershell,
} from "react-icons/vsc";
import {
  destinationPaths,
  dropFolderForPath,
  movePaths,
  type Project,
} from "./model";

const PYLEARN_DRAG_TYPE = "application/x-pylearn-paths";

export interface FileTreeProps {
  project: Project;
  activeFile: string;
  busy: boolean;
  filter: string;
  collapsed: string[];
  onCollapsedChange: (paths: string[]) => void;
  onSelectFile: (path: string) => void;
  onMove: (sources: string[], targetFolder: string) => boolean;
  onMoveRequest: (sources: string[]) => void;
  onDropFiles: (transfer: DataTransfer, targetFolder: string) => void;
  onCreate: (kind: "file" | "folder", targetFolder: string) => void;
  onRename: (path: string) => void;
  onDelete: (path: string) => void;
  onImportRequest: (targetFolder: string) => void;
  onDownload: (path: string) => void;
}

interface TreeNode {
  path: string;
  name: string;
  folder: boolean;
  children: TreeNode[];
}

interface FileIconSpec {
  Icon: IconType;
  label: string;
  tone: string;
}

interface DropLocation {
  rowPath: string | null;
  targetFolder: string;
  mode: "inside" | "alongside" | "root";
  allowed: boolean;
}

const FILE_ICONS: Record<string, FileIconSpec> = {
  py: { Icon: SiPython, label: "Python", tone: "python" },
  pyw: { Icon: SiPython, label: "Python", tone: "python" },
  ipynb: { Icon: SiJupyter, label: "Jupyter Notebook", tone: "python" },
  js: { Icon: SiJavascript, label: "JavaScript", tone: "javascript" },
  jsx: { Icon: SiReact, label: "React JSX", tone: "react" },
  mjs: { Icon: SiJavascript, label: "JavaScript", tone: "javascript" },
  cjs: { Icon: SiJavascript, label: "JavaScript", tone: "javascript" },
  ts: { Icon: SiTypescript, label: "TypeScript", tone: "typescript" },
  tsx: { Icon: SiReact, label: "React TSX", tone: "react" },
  mts: { Icon: SiTypescript, label: "TypeScript", tone: "typescript" },
  cts: { Icon: SiTypescript, label: "TypeScript", tone: "typescript" },
  html: { Icon: SiHtml5, label: "HTML", tone: "markup" },
  htm: { Icon: SiHtml5, label: "HTML", tone: "markup" },
  css: { Icon: SiCss, label: "CSS", tone: "style" },
  scss: { Icon: SiCss, label: "SCSS", tone: "style" },
  sass: { Icon: SiCss, label: "Sass", tone: "style" },
  json: { Icon: VscJson, label: "JSON", tone: "data" },
  jsonc: { Icon: VscJson, label: "JSON con comentarios", tone: "data" },
  md: { Icon: SiMarkdown, label: "Markdown", tone: "document" },
  markdown: { Icon: SiMarkdown, label: "Markdown", tone: "document" },
  yaml: { Icon: SiYaml, label: "YAML", tone: "data" },
  yml: { Icon: SiYaml, label: "YAML", tone: "data" },
  toml: { Icon: SiToml, label: "TOML", tone: "data" },
  xml: { Icon: VscFileCode, label: "XML", tone: "markup" },
  csv: { Icon: VscTable, label: "CSV", tone: "data" },
  tsv: { Icon: VscTable, label: "TSV", tone: "data" },
  sql: { Icon: VscDatabase, label: "SQL", tone: "database" },
  db: { Icon: VscDatabase, label: "Base de datos", tone: "database" },
  sqlite: { Icon: VscDatabase, label: "SQLite", tone: "database" },
  sqlite3: { Icon: VscDatabase, label: "SQLite", tone: "database" },
  sh: { Icon: SiShell, label: "Shell", tone: "terminal" },
  bash: { Icon: SiShell, label: "Bash", tone: "terminal" },
  zsh: { Icon: SiShell, label: "Zsh", tone: "terminal" },
  ps1: { Icon: VscTerminalPowershell, label: "PowerShell", tone: "terminal" },
  c: { Icon: SiC, label: "C", tone: "language" },
  h: { Icon: SiC, label: "Cabecera C", tone: "language" },
  cpp: { Icon: SiCplusplus, label: "C++", tone: "language" },
  cc: { Icon: SiCplusplus, label: "C++", tone: "language" },
  cxx: { Icon: SiCplusplus, label: "C++", tone: "language" },
  hpp: { Icon: SiCplusplus, label: "Cabecera C++", tone: "language" },
  cs: { Icon: TbBrandCSharp, label: "C#", tone: "language" },
  java: { Icon: SiOpenjdk, label: "Java", tone: "language" },
  kt: { Icon: SiKotlin, label: "Kotlin", tone: "language" },
  kts: { Icon: SiKotlin, label: "Kotlin", tone: "language" },
  go: { Icon: SiGo, label: "Go", tone: "language" },
  rs: { Icon: SiRust, label: "Rust", tone: "language" },
  php: { Icon: SiPhp, label: "PHP", tone: "language" },
  rb: { Icon: SiRuby, label: "Ruby", tone: "language" },
  swift: { Icon: SiSwift, label: "Swift", tone: "language" },
  r: { Icon: SiR, label: "R", tone: "language" },
  lua: { Icon: SiLua, label: "Lua", tone: "language" },
  png: { Icon: VscFileMedia, label: "Imagen PNG", tone: "media" },
  jpg: { Icon: VscFileMedia, label: "Imagen JPEG", tone: "media" },
  jpeg: { Icon: VscFileMedia, label: "Imagen JPEG", tone: "media" },
  gif: { Icon: VscFileMedia, label: "Imagen GIF", tone: "media" },
  webp: { Icon: VscFileMedia, label: "Imagen WebP", tone: "media" },
  svg: { Icon: VscFileMedia, label: "Imagen SVG", tone: "media" },
  pdf: { Icon: VscFilePdf, label: "PDF", tone: "document" },
  zip: { Icon: VscFileZip, label: "Archivo ZIP", tone: "archive" },
  rar: { Icon: VscFileZip, label: "Archivo RAR", tone: "archive" },
  gz: { Icon: VscFileZip, label: "Archivo comprimido", tone: "archive" },
  bin: { Icon: VscFileBinary, label: "Archivo binario", tone: "binary" },
  wasm: { Icon: VscFileBinary, label: "WebAssembly", tone: "binary" },
  exe: { Icon: VscFileBinary, label: "Ejecutable", tone: "binary" },
  ini: { Icon: VscSettingsGear, label: "Configuración INI", tone: "config" },
  cfg: { Icon: VscSettingsGear, label: "Configuración", tone: "config" },
  conf: { Icon: VscSettingsGear, label: "Configuración", tone: "config" },
  env: { Icon: VscSettingsGear, label: "Variables de entorno", tone: "config" },
};

const SPECIAL_FILE_ICONS: Record<string, FileIconSpec> = {
  dockerfile: { Icon: SiDocker, label: "Dockerfile", tone: "config" },
  ".dockerignore": { Icon: SiDocker, label: "Docker", tone: "config" },
  ".gitignore": { Icon: SiGit, label: "Git", tone: "config" },
  ".gitattributes": { Icon: SiGit, label: "Git", tone: "config" },
  "requirements.txt": {
    Icon: SiPython,
    label: "Dependencias de Python",
    tone: "python",
  },
  "pyproject.toml": {
    Icon: SiPython,
    label: "Proyecto Python",
    tone: "python",
  },
  pipfile: { Icon: SiPython, label: "Dependencias de Python", tone: "python" },
  "poetry.lock": {
    Icon: SiPython,
    label: "Dependencias de Python",
    tone: "python",
  },
  "package.json": {
    Icon: SiJavascript,
    label: "Proyecto JavaScript",
    tone: "javascript",
  },
  "tsconfig.json": {
    Icon: SiTypescript,
    label: "Configuración de TypeScript",
    tone: "typescript",
  },
};

function getFileIcon(path: string) {
  const name = path.split("/").at(-1)?.toLowerCase() || path.toLowerCase();
  const extension = name.includes(".") ? name.split(".").at(-1) || "" : "";
  const spec =
    SPECIAL_FILE_ICONS[name] ||
    (name.startsWith(".env") ? FILE_ICONS.env : FILE_ICONS[extension]);
  if (spec) {
    const Icon = spec.Icon;
    return (
      <i
        className={`wb-language-icon is-${spec.tone}`}
        title={spec.label}
        aria-label={spec.label}
      >
        <Icon aria-hidden="true" />
      </i>
    );
  }
  if (["txt", "log", "rst"].includes(extension))
    return <FileText className="wb-icon-text" />;
  if (extension && extension.length <= 4)
    return (
      <i
        className="wb-language-icon is-extension"
        title={`Archivo ${extension.toUpperCase()}`}
        aria-label={`Archivo ${extension.toUpperCase()}`}
      >
        <span>{extension.toUpperCase()}</span>
      </i>
    );
  return <File />;
}

export function buildFileTree(project: Project): TreeNode[] {
  const folders = new Set(project.folders);
  for (const file of project.files) {
    const parts = file.path.split("/");
    for (let index = 1; index < parts.length; index += 1)
      folders.add(parts.slice(0, index).join("/"));
  }
  const nodes = new Map<string, TreeNode>();
  for (const path of folders)
    nodes.set(path, {
      path,
      name: path.split("/").at(-1) || path,
      folder: true,
      children: [],
    });
  for (const file of project.files)
    nodes.set(file.path, {
      path: file.path,
      name: file.path.split("/").at(-1) || file.path,
      folder: false,
      children: [],
    });

  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    const separator = node.path.lastIndexOf("/");
    const parent = separator === -1 ? "" : node.path.slice(0, separator);
    if (parent && nodes.get(parent)?.folder)
      nodes.get(parent)!.children.push(node);
    else roots.push(node);
  }
  const sort = (items: TreeNode[]) => {
    items.sort((left, right) =>
      left.folder !== right.folder
        ? left.folder
          ? -1
          : 1
        : left.name.localeCompare(right.name, "es", { sensitivity: "base" }),
    );
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function hasMatch(node: TreeNode, filter: string): boolean {
  return (
    node.path.toLowerCase().includes(filter) ||
    node.children.some((child) => hasMatch(child, filter))
  );
}

export function FileTree({
  project,
  activeFile,
  busy,
  filter,
  collapsed,
  onCollapsedChange,
  onSelectFile,
  onMove,
  onMoveRequest,
  onDropFiles,
  onCreate,
  onRename,
  onDelete,
  onImportRequest,
  onDownload,
}: FileTreeProps) {
  const tree = useMemo(
    () => buildFileTree(project),
    [project.files, project.folders],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [dropLocation, setDropLocation] = useState<DropLocation | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragSources, setDragSources] = useState<string[]>([]);
  const expandTimer = useRef<number | null>(null);
  const expandCandidate = useRef<string | null>(null);
  const [context, setContext] = useState<{
    x: number;
    y: number;
    node?: TreeNode;
  } | null>(null);

  useEffect(() => {
    const paths = new Set(project.folders);
    for (const file of project.files) {
      paths.add(file.path);
      const parts = file.path.split("/");
      for (let index = 1; index < parts.length; index += 1)
        paths.add(parts.slice(0, index).join("/"));
    }
    setSelected((current) => current.filter((path) => paths.has(path)));
  }, [project.files, project.folders]);
  useEffect(() => {
    if (!context) return;
    const close = () => setContext(null);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [context]);
  useEffect(
    () => () => {
      if (expandTimer.current !== null)
        window.clearTimeout(expandTimer.current);
    },
    [],
  );

  const normalizedFilter = filter.trim().toLowerCase();
  const toggleFolder = (path: string) =>
    onCollapsedChange(
      collapsed.includes(path)
        ? collapsed.filter((folder) => folder !== path)
        : [...collapsed, path],
    );
  const targetFor = (node?: TreeNode) =>
    node?.folder
      ? node.path
      : node
        ? node.path.slice(0, Math.max(0, node.path.lastIndexOf("/")))
        : "";
  const openContext = (x: number, y: number, node?: TreeNode) =>
    setContext({
      x: Math.max(8, Math.min(x, window.innerWidth - 210)),
      y: Math.max(8, Math.min(y, window.innerHeight - 300)),
      node,
    });
  const select = (node: TreeNode, event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setSelected((current) =>
        current.includes(node.path)
          ? current.filter((path) => path !== node.path)
          : [...current, node.path],
      );
      return;
    }
    setSelected([node.path]);
    if (node.folder) toggleFolder(node.path);
    else onSelectFile(node.path);
  };
  const clearDropState = () => {
    if (expandTimer.current !== null) window.clearTimeout(expandTimer.current);
    expandTimer.current = null;
    expandCandidate.current = null;
    setDropLocation(null);
  };
  const normalizeSources = (sources: string[]) =>
    [...new Set(sources)].filter(
      (path, _index, paths) =>
        !paths.some(
          (parent) =>
            parent !== path &&
            (path === parent || path.startsWith(parent + "/")),
        ),
    );
  const getInternalSources = (event: DragEvent) => {
    const raw = event.dataTransfer.getData(PYLEARN_DRAG_TYPE);
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((path) => typeof path === "string")
        ) {
          return normalizeSources(parsed);
        }
      } catch {
        return [];
      }
    }
    return normalizeSources(dragSources);
  };
  const scheduleExpand = (folder: string) => {
    if (
      !folder ||
      !collapsed.includes(folder) ||
      expandCandidate.current === folder
    )
      return;
    if (expandTimer.current !== null) window.clearTimeout(expandTimer.current);
    expandCandidate.current = folder;
    expandTimer.current = window.setTimeout(() => {
      onCollapsedChange(collapsed.filter((path) => path !== folder));
      expandTimer.current = null;
      expandCandidate.current = null;
    }, 550);
  };
  const resolveLocation = (node?: TreeNode): DropLocation => {
    if (!node)
      return { rowPath: null, targetFolder: "", mode: "root", allowed: true };
    return {
      rowPath: node.path,
      targetFolder: dropFolderForPath(project, node.path),
      mode: node.folder ? "inside" : "alongside",
      allowed: true,
    };
  };
  const drop = (event: DragEvent, location: DropLocation) => {
    event.preventDefault();
    event.stopPropagation();
    clearDropState();
    setDragging(false);
    if (busy) return;
    const sources = getInternalSources(event);
    if (sources.length) {
      if (!location.allowed) return;
      if (onMove(sources, location.targetFolder)) {
        setSelected(destinationPaths(sources, location.targetFolder));
        if (
          location.targetFolder &&
          collapsed.includes(location.targetFolder)
        ) {
          onCollapsedChange(
            collapsed.filter((path) => path !== location.targetFolder),
          );
        }
      }
    } else if (
      event.dataTransfer.files.length ||
      event.dataTransfer.items.length
    ) {
      onDropFiles(event.dataTransfer, location.targetFolder);
    }
    setDragSources([]);
  };
  const dragOver = (event: DragEvent, node?: TreeNode) => {
    if (busy) return;
    event.preventDefault();
    event.stopPropagation();
    const sources = getInternalSources(event);
    const location = resolveLocation(node);
    if (sources.length) {
      try {
        location.allowed =
          movePaths(project, sources, location.targetFolder) !== project;
      } catch {
        location.allowed = false;
      }
    }
    event.dataTransfer.dropEffect = sources.length
      ? location.allowed
        ? "move"
        : "none"
      : "copy";
    setDropLocation(location);
    if (node?.folder && location.allowed) scheduleExpand(node.path);
  };

  const renderNode = (node: TreeNode, depth: number) => {
    if (normalizedFilter && !hasMatch(node, normalizedFilter)) return null;
    const isOpen = normalizedFilter ? true : !collapsed.includes(node.path);
    const isSelected = selected.includes(node.path);
    return (
      <div
        key={node.path}
        role="treeitem"
        aria-expanded={node.folder ? isOpen : undefined}
      >
        <div
          className={`wb-tree-row${activeFile === node.path ? " is-active" : ""}${isSelected ? " is-selected" : ""}${dropLocation?.rowPath === node.path ? ` is-drop-target is-drop-${dropLocation.mode}${dropLocation.allowed ? "" : " is-drop-blocked"}` : ""}`}
          style={{ paddingLeft: 6 + depth * 14 }}
          onDragEnter={(event) => dragOver(event, node)}
          onDragOver={(event) => dragOver(event, node)}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node))
              clearDropState();
          }}
          onDrop={(event) => drop(event, resolveLocation(node))}
          onContextMenu={(event) => {
            event.preventDefault();
            if (!isSelected) setSelected([node.path]);
            openContext(event.clientX, event.clientY, node);
          }}
        >
          <button
            className="wb-file-name"
            disabled={busy}
            draggable={!busy}
            title={node.path}
            onClick={(event) => select(node, event)}
            onDragStart={(event) => {
              const sources = normalizeSources(
                isSelected ? selected : [node.path],
              );
              if (!isSelected) setSelected([node.path]);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData(
                PYLEARN_DRAG_TYPE,
                JSON.stringify(sources),
              );
              setDragSources(sources);
              setDragging(true);
            }}
            onDragEnd={() => {
              setDragging(false);
              setDragSources([]);
              clearDropState();
            }}
          >
            <ChevronRight
              className={`wb-tree-chevron${node.folder && isOpen ? " is-open" : ""}${node.folder ? "" : " is-placeholder"}`}
            />
            {node.folder ? (
              isOpen ? (
                <FolderOpen className="wb-icon-folder" />
              ) : (
                <Folder className="wb-icon-folder" />
              )
            ) : (
              getFileIcon(node.path)
            )}
            <span>{node.name}</span>
          </button>
          <div className="wb-tree-actions">
            {node.folder && (
              <button
                aria-label={`Nuevo archivo en ${node.path}`}
                title="Nuevo archivo aquí"
                disabled={busy}
                onClick={() => onCreate("file", node.path)}
              >
                <Plus />
              </button>
            )}
            <button
              aria-label={`Mover ${node.path}`}
              title="Mover a…"
              disabled={busy}
              onClick={() =>
                onMoveRequest(
                  isSelected ? normalizeSources(selected) : [node.path],
                )
              }
            >
              <FolderInput />
            </button>
            <button
              aria-label={`Renombrar ${node.path}`}
              title="Renombrar"
              disabled={busy}
              onClick={() => onRename(node.path)}
            >
              <Pencil />
            </button>
            <button
              aria-label={`Eliminar ${node.path}`}
              title="Eliminar"
              disabled={busy}
              onClick={() => onDelete(node.path)}
            >
              <Trash2 />
            </button>
          </div>
          {dropLocation?.rowPath === node.path && (
            <span className="wb-drop-label" aria-hidden="true">
              {!dropLocation.allowed
                ? "No se puede mover aquí"
                : dropLocation.mode === "inside"
                  ? "Mover dentro"
                  : dropLocation.targetFolder
                    ? `Mover a ${dropLocation.targetFolder}`
                    : "Mover a la raíz"}
            </span>
          )}
        </div>
        {node.folder && isOpen && (
          <div role="group">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const contextTarget = targetFor(context?.node);
  return (
    <>
      <div
        className={`wb-tree${dropLocation?.mode === "root" ? ` is-drop-target${dropLocation.allowed ? "" : " is-drop-blocked"}` : ""}`}
        role="tree"
        aria-label="Archivos del proyecto"
        onDragEnter={(event) => dragOver(event)}
        onDragOver={(event) => dragOver(event)}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            clearDropState();
        }}
        onDrop={(event) => drop(event, resolveLocation())}
        onContextMenu={(event) => {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          openContext(event.clientX, event.clientY);
        }}
      >
        {(dragging || dropLocation) && (
          <div
            className={`wb-drop-root${dropLocation?.mode === "root" ? " is-active" : ""}`}
            onDragEnter={(event) => dragOver(event)}
            onDragOver={(event) => dragOver(event)}
            onDrop={(event) => drop(event, resolveLocation())}
          >
            Suelta aquí para mover a la raíz
          </div>
        )}
        {tree.map((node) => renderNode(node, 0))}
        {!tree.length && (
          <p className="wb-empty">Crea o suelta aquí tu primer archivo.</p>
        )}
      </div>
      {context && (
        <div
          className="wb-context-menu"
          role="menu"
          style={{ left: context.x, top: context.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {context.node && !context.node.folder && (
            <>
              <button
                role="menuitem"
                onClick={() => {
                  onSelectFile(context.node!.path);
                  setContext(null);
                }}
              >
                Abrir archivo
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  onDownload(context.node!.path);
                  setContext(null);
                }}
              >
                Descargar <Download />
              </button>
            </>
          )}
          {context.node && (
            <button
              role="menuitem"
              onClick={() => {
                onMoveRequest(
                  selected.includes(context.node!.path)
                    ? normalizeSources(selected)
                    : [context.node!.path],
                );
                setContext(null);
              }}
            >
              Mover a… <FolderInput />
            </button>
          )}
          <button
            role="menuitem"
            onClick={() => {
              onCreate("file", contextTarget);
              setContext(null);
            }}
          >
            Nuevo archivo aquí
          </button>
          <button
            role="menuitem"
            onClick={() => {
              onCreate("folder", contextTarget);
              setContext(null);
            }}
          >
            Nueva carpeta aquí
          </button>
          <button
            role="menuitem"
            onClick={() => {
              onImportRequest(contextTarget);
              setContext(null);
            }}
          >
            Subir archivos aquí <Upload />
          </button>
          {context.node && (
            <>
              <span className="wb-context-separator" role="separator" />
              <button
                role="menuitem"
                onClick={() => {
                  onRename(context.node!.path);
                  setContext(null);
                }}
              >
                Renombrar
              </button>
              <button
                className="is-danger"
                role="menuitem"
                onClick={() => {
                  onDelete(context.node!.path);
                  setContext(null);
                }}
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
