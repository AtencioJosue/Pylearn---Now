export interface ProjectFile {
  path: string;
  content: string;
  encoding: "utf8" | "base64";
}
export interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
  folders: string[];
  activeFile: string;
  entryFile: string;
  packages: string[];
  updatedAt: number;
}
export interface Workspace {
  version: 1;
  activeProject: string;
  projects: Project[];
}
export const MAX_BYTES = 20 * 1024 * 1024;
export const INITIAL_CODE =
  '# Tu proyecto empieza aquí.\n# Puedes crear más archivos e importarlos.\n\nprint("¡Hola desde Pylearn!")\n';
export function cleanPath(value: string): string {
  const path = value.trim().replaceAll("\\", "/");
  if (
    !path ||
    path.length > 240 ||
    path.startsWith("/") ||
    /[\x00-\x1f<>:"|?*]/.test(path) ||
    path
      .split("/")
      .some(
        (part) =>
          !part || part === "." || part === ".." || part === "__pycache__",
      )
  ) {
    throw new Error(
      "Usa una ruta relativa, por ejemplo: utilidades/calculos.py.",
    );
  }
  return path;
}
export function newProject(name = "Mi proyecto"): Project {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || "Mi proyecto",
    files: [{ path: "main.py", content: INITIAL_CODE, encoding: "utf8" }],
    folders: [],
    activeFile: "main.py",
    entryFile: "main.py",
    packages: [],
    updatedAt: Date.now(),
  };
}
export function newWorkspace(): Workspace {
  const project = newProject();
  return { version: 1, activeProject: project.id, projects: [project] };
}
export function validateProject(value: unknown): Project {
  if (!value || typeof value !== "object")
    throw new Error("Proyecto no válido.");
  const p = value as Project;
  if (
    typeof p.name !== "string" ||
    !p.name.trim() ||
    p.name.length > 100 ||
    !Array.isArray(p.files) ||
    p.files.length > 500 ||
    !Array.isArray(p.folders) ||
    p.folders.length > 500 ||
    !Array.isArray(p.packages) ||
    p.packages.length > 50
  )
    throw new Error("Formato o tamaño del proyecto no válido.");
  const paths = new Set<string>();
  let bytes = 0;
  const files = p.files.map((file) => {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string" ||
      !["utf8", "base64"].includes(file.encoding)
    )
      throw new Error("Archivo no válido.");
    const path = cleanPath(file.path);
    if (paths.has(path)) throw new Error("Hay rutas repetidas.");
    paths.add(path);
    bytes += new TextEncoder().encode(file.content).length;
    if (bytes > MAX_BYTES)
      throw new Error(
        "El proyecto supera los 20 MB de almacenamiento del editor del navegador.",
      );
    if (
      file.encoding === "base64" &&
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        file.content,
      )
    )
      throw new Error("Archivo binario no válido.");
    return { ...file, path };
  });
  const folders = [...new Set(p.folders.map(cleanPath))];
  for (const path of [...paths, ...folders]) {
    const parts = path.split("/");
    for (let i = 1; i < parts.length; i++)
      if (paths.has(parts.slice(0, i).join("/")))
        throw new Error("Un archivo ocupa la ruta de una carpeta.");
  }
  if (folders.some((folder) => paths.has(folder)))
    throw new Error("Un archivo y una carpeta tienen el mismo nombre.");
  const packages = p.packages.map(validatePackage);
  const entryFile = files.some(
    (f) =>
      f.path === p.entryFile && f.path.endsWith(".py") && f.encoding === "utf8",
  )
    ? p.entryFile
    : files.find((f) => f.path.endsWith(".py") && f.encoding === "utf8")
        ?.path || "";
  return {
    id: typeof p.id === "string" ? p.id : crypto.randomUUID(),
    name: p.name.trim(),
    files,
    folders,
    packages,
    activeFile: paths.has(p.activeFile) ? p.activeFile : files[0]?.path || "",
    entryFile,
    updatedAt: Date.now(),
  };
}
export function validatePackage(name: string): string {
  if (
    typeof name !== "string" ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]*(?:==[a-zA-Z0-9.+_-]+)?$/.test(name.trim())
  )
    throw new Error("Escribe un paquete como numpy o numpy==2.0.2.");
  return name.trim();
}
export function renamePath(
  project: Project,
  from: string,
  destination: string,
): Project {
  const to = cleanPath(destination);
  const folder =
    project.folders.includes(from) ||
    project.files.some((f) => f.path.startsWith(from + "/"));
  if (to === from) return project;
  if (folder && to.startsWith(from + "/"))
    throw new Error("No puedes mover una carpeta dentro de sí misma.");
  const replace = (path: string) =>
    path === from
      ? to
      : path.startsWith(from + "/")
        ? to + path.slice(from.length)
        : path;
  if (
    project.files.some((f) => f.path === to || f.path.startsWith(to + "/")) ||
    project.folders.includes(to)
  )
    throw new Error("Ese nombre ya existe.");
  return validateProject({
    ...project,
    files: project.files.map((f) => ({ ...f, path: replace(f.path) })),
    folders: project.folders.map(replace),
    activeFile: replace(project.activeFile),
    entryFile: replace(project.entryFile),
  });
}

function pathInside(path: string, parent: string) {
  return path === parent || path.startsWith(parent + "/");
}

function parentPath(path: string) {
  const separator = path.lastIndexOf("/");
  return separator === -1 ? "" : path.slice(0, separator);
}

function pathName(path: string) {
  return path.split("/").at(-1) || path;
}

/** Return every real and implicit folder in a project, sorted for display. */
export function listProjectFolders(project: Project): string[] {
  const folders = new Set(project.folders);
  for (const file of project.files) {
    const parts = file.path.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      folders.add(parts.slice(0, index).join("/"));
    }
  }
  return [...folders].sort((left, right) =>
    left.localeCompare(right, "es", { sensitivity: "base" }),
  );
}

/**
 * Resolve an explorer row to a folder. Dropping on a file means "beside this
 * file", while dropping on a folder means "inside this folder".
 */
export function dropFolderForPath(
  project: Project,
  targetPath: string,
): string {
  if (!targetPath) return "";
  const path = cleanPath(targetPath);
  if (listProjectFolders(project).includes(path)) return path;
  if (project.files.some((file) => file.path === path)) return parentPath(path);
  throw new Error("El destino ya no existe.");
}

/** Move one or more files/folders into a folder while preserving the subtree. */
export function movePaths(
  project: Project,
  requestedSources: string[],
  requestedTargetFolder: string,
): Project {
  const targetFolder = requestedTargetFolder
    ? cleanPath(requestedTargetFolder)
    : "";
  const allFolders = new Set(project.folders);
  for (const file of project.files) {
    const parts = file.path.split("/");
    for (let index = 1; index < parts.length; index += 1)
      allFolders.add(parts.slice(0, index).join("/"));
  }
  if (targetFolder && !allFolders.has(targetFolder))
    throw new Error("La carpeta de destino ya no existe.");

  const allPaths = new Set([
    ...project.files.map((file) => file.path),
    ...allFolders,
  ]);
  const uniqueSources = [...new Set(requestedSources.map(cleanPath))]
    .filter((path) => allPaths.has(path))
    .filter(
      (path, _index, paths) =>
        !paths.some((parent) => parent !== path && pathInside(path, parent)),
    );
  if (!uniqueSources.length) throw new Error("Selecciona algo para mover.");

  const moves = uniqueSources
    .map((source) => ({
      source,
      destination: targetFolder
        ? `${targetFolder}/${pathName(source)}`
        : pathName(source),
    }))
    .filter(({ source, destination }) => source !== destination);
  if (!moves.length) return project;

  for (const { source } of moves) {
    if (targetFolder && pathInside(targetFolder, source))
      throw new Error("No puedes mover una carpeta dentro de sí misma.");
  }
  if (new Set(moves.map((move) => move.destination)).size !== moves.length)
    throw new Error("Dos elementos terminarían con el mismo nombre.");

  const belongsToMovedTree = (path: string) =>
    moves.some(({ source }) => pathInside(path, source));
  const filePaths = new Set(project.files.map((file) => file.path));
  for (const { destination } of moves) {
    if (
      [...allPaths].some(
        (path) => pathInside(path, destination) && !belongsToMovedTree(path),
      ) ||
      [...filePaths].some(
        (path) => pathInside(destination, path) && !belongsToMovedTree(path),
      )
    )
      throw new Error(
        `Ya existe un elemento llamado ${pathName(destination)}.`,
      );
  }

  const replace = (path: string) => {
    const move = moves.find(({ source }) => pathInside(path, source));
    return move ? move.destination + path.slice(move.source.length) : path;
  };
  return validateProject({
    ...project,
    files: project.files.map((file) => ({ ...file, path: replace(file.path) })),
    folders: project.folders.map(replace),
    activeFile: replace(project.activeFile),
    entryFile: replace(project.entryFile),
  });
}

export function destinationPaths(
  sources: string[],
  targetFolder: string,
): string[] {
  return sources.map((source) =>
    targetFolder ? `${targetFolder}/${pathName(source)}` : pathName(source),
  );
}

/** Valid destinations used by the accessible "Mover a…" picker. */
export function availableMoveTargets(
  project: Project,
  sources: string[],
): string[] {
  return ["", ...listProjectFolders(project)].filter((targetFolder) => {
    try {
      return movePaths(project, sources, targetFolder) !== project;
    } catch {
      return false;
    }
  });
}

export function folderOf(path: string) {
  return parentPath(path);
}
export function deletePath(project: Project, target: string): Project {
  const keep = (path: string) =>
    path !== target && !path.startsWith(target + "/");
  return validateProject({
    ...project,
    files: project.files.filter((f) => keep(f.path)),
    folders: project.folders.filter(keep),
  });
}
export function parseWorkspace(value: unknown): Workspace {
  const w = value as Workspace;
  if (
    !w ||
    w.version !== 1 ||
    !Array.isArray(w.projects) ||
    !w.projects.length ||
    w.projects.length > 50
  )
    throw new Error("Respaldo de proyectos no válido.");
  const projects = w.projects.map(validateProject);
  if (new Set(projects.map((p) => p.id)).size !== projects.length)
    throw new Error("Identificadores de proyecto repetidos.");
  return {
    version: 1,
    projects,
    activeProject: projects.some((p) => p.id === w.activeProject)
      ? w.activeProject
      : projects[0].id,
  };
}
