import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : process.env.VERCEL
    ? "/tmp/pylearn-uploads"
  : path.resolve(import.meta.dirname, "../uploads");

export function ensureUploadsDir() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return;
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export async function storeImage(
  filename: string,
  buffer: Buffer,
  contentType: string,
  folder = "avatars",
) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    return { url: blob.url, localPath: null as string | null };
  }

  ensureUploadsDir();
  const localPath = path.join(uploadsDir, filename);
  fs.writeFileSync(localPath, buffer, { flag: "wx" });
  return { url: `/uploads/${filename}`, localPath };
}
