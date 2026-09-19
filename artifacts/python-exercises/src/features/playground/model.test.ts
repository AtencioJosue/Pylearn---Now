import test from "node:test";
import assert from "node:assert/strict";
import {
  availableMoveTargets,
  cleanPath,
  deletePath,
  destinationPaths,
  dropFolderForPath,
  folderOf,
  listProjectFolders,
  movePaths,
  newProject,
  parseWorkspace,
  renamePath,
  validateProject,
} from "./model.ts";
test("rejects traversal, absolute paths, reserved cache folders and empty segments", () => {
  for (const path of [
    "../secret",
    "/root.py",
    "a/../../b",
    "a//b",
    "C:\\Users\\data",
    "a\0b",
    "__pycache__/x",
    "a/./b",
  ])
    assert.throws(() => cleanPath(path), path);
  assert.equal(
    cleanPath(" utilidades\\calculos.py "),
    "utilidades/calculos.py",
  );
});
test("moves files and complete folders without losing contents", () => {
  const project = validateProject({
    ...newProject(),
    files: [
      {
        path: "main.py",
        content: "from app.util import value",
        encoding: "utf8",
      },
      { path: "src/util.py", content: "value = 42", encoding: "utf8" },
      { path: "src/data/info.json", content: "{}", encoding: "utf8" },
    ],
    folders: ["src", "src/data", "app"],
    activeFile: "src/util.py",
    entryFile: "main.py",
  });
  const movedFile = movePaths(project, ["src/util.py"], "app");
  assert.ok(movedFile.files.some((file) => file.path === "app/util.py"));
  assert.equal(movedFile.activeFile, "app/util.py");
  const movedFolder = movePaths(movedFile, ["src"], "app");
  assert.ok(
    movedFolder.files.some((file) => file.path === "app/src/data/info.json"),
  );
  assert.ok(movedFolder.folders.includes("app/src/data"));
});
test("moves multiple selections and rejects collisions or recursive moves", () => {
  const project = validateProject({
    ...newProject(),
    files: [
      ...newProject().files,
      { path: "a/one.py", content: "1", encoding: "utf8" },
      { path: "b/two.py", content: "2", encoding: "utf8" },
    ],
    folders: ["a", "b", "target"],
  });
  const moved = movePaths(project, ["a/one.py", "b/two.py"], "target");
  assert.deepEqual(moved.files.map((file) => file.path).sort(), [
    "main.py",
    "target/one.py",
    "target/two.py",
  ]);
  assert.throws(() => movePaths(project, ["a"], "a/nested"));
  const collisionProject = validateProject({
    ...newProject("Colisiones"),
    folders: ["a"],
    files: [
      { path: "main.py", content: "", encoding: "utf8" },
      { path: "a/main.py", content: "", encoding: "utf8" },
    ],
  });
  assert.throws(
    () => movePaths(collisionProject, ["main.py"], "a"),
    /already|existe/i,
  );
  assert.deepEqual(destinationPaths(["a/one.py", "two.py"], "target"), [
    "target/one.py",
    "target/two.py",
  ]);
  assert.equal(folderOf("target/one.py"), "target");
  assert.equal(folderOf("main.py"), "");
});
test("resolves intuitive drop targets and exposes only valid move destinations", () => {
  const project = validateProject({
    ...newProject(),
    files: [
      { path: "main.py", content: "", encoding: "utf8" },
      { path: "src/app.py", content: "", encoding: "utf8" },
      { path: "src/nested/value.py", content: "", encoding: "utf8" },
    ],
    folders: ["src", "src/nested", "tests"],
  });

  assert.deepEqual(listProjectFolders(project), ["src", "src/nested", "tests"]);
  assert.equal(dropFolderForPath(project, "src"), "src");
  assert.equal(dropFolderForPath(project, "src/app.py"), "src");
  assert.equal(dropFolderForPath(project, "main.py"), "");
  assert.throws(() => dropFolderForPath(project, "missing.py"));

  assert.deepEqual(availableMoveTargets(project, ["main.py"]), [
    "src",
    "src/nested",
    "tests",
  ]);
  assert.deepEqual(availableMoveTargets(project, ["src/app.py"]), [
    "",
    "src/nested",
    "tests",
  ]);
  assert.deepEqual(availableMoveTargets(project, ["src"]), ["tests"]);
});
test("renames a folder and updates the entry and active file without losing contents", () => {
  const p = validateProject({
    ...newProject(),
    files: [
      { path: "src/main.py", content: "print(1)", encoding: "utf8" },
      { path: "src/data.json", content: "{}", encoding: "utf8" },
    ],
    folders: ["src", "src/empty"],
    entryFile: "src/main.py",
    activeFile: "src/data.json",
  });
  const next = renamePath(p, "src", "app");
  assert.equal(next.entryFile, "app/main.py");
  assert.equal(next.activeFile, "app/data.json");
  assert.deepEqual(
    next.files.map((f) => f.content),
    ["print(1)", "{}"],
  );
  assert.deepEqual(next.folders, ["app", "app/empty"]);
  assert.throws(() => renamePath(p, "src", "src/inside"));
});
test("refuses overwrite and file/folder conflicts", () => {
  const p = validateProject({
    ...newProject(),
    files: [
      ...newProject().files,
      { path: "lib/x.py", encoding: "utf8", content: "" },
    ],
  });
  assert.throws(() => renamePath(p, "main.py", "lib"));
  assert.throws(() =>
    validateProject({
      ...p,
      files: [
        ...p.files,
        { path: "main.py", encoding: "utf8", content: "other" },
      ],
    }),
  );
  assert.throws(() =>
    validateProject({
      ...p,
      files: [...p.files, { path: "lib", encoding: "utf8", content: "" }],
    }),
  );
});
test("deleting the entry file selects a surviving Python entry", () => {
  const p = validateProject({
    ...newProject(),
    files: [
      ...newProject().files,
      { path: "other.py", encoding: "utf8", content: "print(2)" },
    ],
  });
  const next = deletePath(p, "main.py");
  assert.equal(next.entryFile, "other.py");
  assert.equal(next.activeFile, "other.py");
  assert.equal(deletePath(next, "other.py").entryFile, "");
});
test("binary files survive JSON transfer and invalid encodings are rejected", () => {
  const p = validateProject({
    ...newProject(),
    files: [{ path: "data.bin", encoding: "base64", content: "AP9B" }],
  });
  assert.deepEqual(
    validateProject(JSON.parse(JSON.stringify(p))).files,
    p.files,
  );
  assert.throws(() =>
    validateProject({
      ...p,
      files: [{ path: "data.bin", encoding: "base64", content: "???=" }],
    }),
  );
});
test("workspace import rejects duplicate ids and repairs missing active selection", () => {
  const p = newProject();
  assert.throws(() =>
    parseWorkspace({ version: 1, projects: [p, p], activeProject: p.id }),
  );
  assert.equal(
    parseWorkspace({ version: 1, projects: [p], activeProject: "missing" })
      .activeProject,
    p.id,
  );
});
