import type { Workspace } from "./model";
import { parseWorkspace } from "./model";
const DB_NAME = "pylearn-playground-v1";
let dbPromise: Promise<IDBDatabase> | undefined;
function openDB() {
  return (dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("workspaces");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = undefined;
      reject(req.error);
    };
    req.onblocked = () => {
      dbPromise = undefined;
      reject(
        new Error(
          "Cierra las otras pestañas de Pylearn para habilitar el guardado.",
        ),
      );
    };
  }));
}
export async function loadWorkspace(owner: string): Promise<Workspace | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("workspaces")
      .objectStore("workspaces")
      .get(owner);
    req.onsuccess = () => {
      try {
        resolve(req.result ? parseWorkspace(req.result) : null);
      } catch (err) {
        reject(err);
      }
    };
    req.onerror = () => reject(req.error);
  });
}
export async function saveWorkspace(
  owner: string,
  value: Workspace,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("workspaces", "readwrite");
    tx.objectStore("workspaces").put(value, owner);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () =>
      reject(tx.error || new Error("No se pudo guardar el proyecto."));
  });
}
