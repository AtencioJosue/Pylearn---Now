"""Transfer projects between the browser editor and the local Python workspace."""
import argparse
import base64
import json
from pathlib import Path, PurePosixPath
import shutil
import tempfile
import uuid

MAX_BYTES = 20 * 1024 * 1024

def relative_path(value):
    if not isinstance(value, str):
        raise ValueError("Invalid path")
    value = value.replace("\\", "/")
    parts = value.split("/")
    if not value or len(value) > 240 or any(p in ("", ".", "..", "__pycache__") for p in parts) or any(ord(c)<32 or c in '<>:"|?*' for c in value):
        raise ValueError("Invalid path: " + value)
    return PurePosixPath(value)

def validate(data):
    if not isinstance(data, dict) or not isinstance(data.get("files"), list) or not isinstance(data.get("folders", []), list):
        raise ValueError("Invalid Pylearn project")
    if len(data["files"]) > 500 or len(data.get("folders", [])) > 500:
        raise ValueError("Too many files or folders")
    entries = {}
    size = 0
    for file in data["files"]:
        path = relative_path(file["path"])
        if path in entries:
            raise ValueError("Duplicate path")
        if file["encoding"] == "base64":
            contents = base64.b64decode(file["content"], validate=True)
        elif file["encoding"] == "utf8":
            contents = file["content"].encode("utf8")
        else:
            raise ValueError("Unknown encoding")
        size += len(contents)
        if size > MAX_BYTES:
            raise ValueError("Project exceeds 20 MB")
        entries[path] = contents
    folders = [relative_path(p) for p in data.get("folders", [])]
    for path in [*entries, *folders]:
        if any(parent in entries for parent in path.parents):
            raise ValueError("File occupies parent folder")
    if any(folder in entries for folder in folders):
        raise ValueError("Folder conflicts with file")
    return entries, folders

def import_project(source, destination):
    source, destination = Path(source), Path(destination)
    if source.stat().st_size > MAX_BYTES * 2:
        raise ValueError("Project archive too large")
    data = json.loads(source.read_text(encoding="utf8"))
    entries, folders = validate(data)
    if destination.exists():
        raise ValueError("Destination already exists; choose a new folder")
    destination.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".pylearn-", dir=destination.parent))
    try:
        for folder in folders:
            (staging / folder).mkdir(parents=True, exist_ok=True)
        for relative, contents in entries.items():
            target = staging / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(contents)
        staging.rename(destination)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    return destination

def export_project(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    files, folders, size = [], [], 0
    excluded = {".git", ".venv", "venv", "__pycache__", "node_modules"}
    for path in sorted(source.rglob("*")):
        relative = path.relative_to(source)
        if path == destination or any(part in excluded for part in relative.parts) or path.is_symlink():
            continue
        if path.is_dir():
            folders.append(relative.as_posix())
            continue
        if not path.is_file():
            continue
        contents = path.read_bytes()
        size += len(contents)
        if size > MAX_BYTES or len(files) >= 500 or len(folders) > 500:
            raise ValueError("Project exceeds browser limits")
        try:
            text = contents.decode("utf8")
            if "\0" in text:
                raise ValueError()
            encoding = "utf8"
        except (UnicodeDecodeError, ValueError):
            text, encoding = base64.b64encode(contents).decode("ascii"), "base64"
        files.append({"path": relative.as_posix(), "content": text, "encoding": encoding})
    entry = next((f["path"] for f in files if f["path"]=="main.py"), next((f["path"] for f in files if f["path"].endswith(".py")), ""))
    data = {"id": str(uuid.uuid4()), "name": source.name, "files": files, "folders": folders, "activeFile": entry, "entryFile": entry, "packages": [], "updatedAt": 0}
    validate(data)
    with destination.open("x", encoding="utf8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
    return destination

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["import", "export"])
    parser.add_argument("source")
    parser.add_argument("destination")
    args = parser.parse_args()
    try:
        print((import_project if args.action=="import" else export_project)(args.source, args.destination))
    except (ValueError, OSError, KeyError, TypeError) as error:
        parser.exit(1, str(error)+"\n")
