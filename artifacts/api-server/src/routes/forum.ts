import { Router, IRouter } from "express";
import crypto from "crypto";
import { localDB } from "../local_db";
import { pool } from "../database";
import { getAuthUser, requireAuth } from "../auth";
import { storeImage } from "../storage";

const router: IRouter = Router();

function parseResourceId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function persistPostImage(value: unknown, userId: string) {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  if (!raw.startsWith("data:")) {
    return /^https?:\/\//i.test(raw) ? raw.slice(0, 2048) : null;
  }
  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    const error = new Error("El almacenamiento de imágenes aún no está configurado.") as Error & { status?: number };
    error.status = 503;
    throw error;
  }
  const matches = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("La imagen del post no es válida.");
  const contentType = matches[1].toLowerCase();
  const extensionByType: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };
  const extension = extensionByType[contentType];
  if (!extension) throw new Error("Solo se permiten imágenes PNG, JPG o WEBP.");
  const buffer = Buffer.from(matches[2], "base64");
  if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) {
    throw new Error("La imagen debe pesar como máximo 2MB.");
  }
  const filename = `${crypto.createHash("sha256").update(userId).digest("hex").slice(0, 24)}_post_${Date.now()}.${extension}`;
  const stored = await storeImage(filename, buffer, contentType, "posts");
  return stored.url;
}

// ─── GET /posts ───────────────────────────────────────────────────────────────
router.get("/posts", async (_req, res) => {
  if (!pool) {
    const db = localDB.get();
    const posts = db.posts ?? [];
    const sorted = [...posts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return res.json(sorted.slice(0, 100));
  }

  try {
    const result = await pool.query(
      `SELECT p.*,
              COALESCE(
                (SELECT array_agg(l.user_id ORDER BY l.user_id)
                 FROM py_forum_post_likes l
                 WHERE l.post_id = p.id),
                ARRAY[]::text[]
              ) AS liked_by
       FROM py_forum_posts p
       ORDER BY p.created_at DESC
       LIMIT 100`,
    );
    return res.json(result.rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── POST /posts ──────────────────────────────────────────────────────────────
router.post("/posts", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  const { title, content, image_url } = req.body;
  const user_id = user.id;
  const author_name = user.name;
  if (!title || !content)
    return res.status(400).json({ error: "Faltan campos requeridos" });

  let storedImageUrl: string | null;
  try {
    storedImageUrl = await persistPostImage(image_url, user_id);
  } catch (error: any) {
    return res.status(error.status ?? 400).json({ error: error.message });
  }

  if (!pool) {
    const db = localDB.get();
    if (!db.posts) db.posts = [];
    if (!db.comments) db.comments = {};

    const highestExistingId = db.posts.reduce(
      (highest, post) => Math.max(highest, Number(post.id) || 0),
      0,
    );
    const id = Math.max(db.postIdCounter ?? 1, highestExistingId + 1);
    db.postIdCounter = id + 1;

    const post = {
      id,
      user_id,
      author_name,
      title,
      content,
      image_url: storedImageUrl,
      created_at: new Date().toISOString(),
      comment_count: 0,
      likes_count: 0,
      liked_by: [],
    };
    db.posts.push(post);
    db.comments[id] = [];
    localDB.save(db);
    return res.json(post);
  }

  try {
    const result = await pool.query(
      `INSERT INTO py_forum_posts (user_id, author_name, title, content, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, ARRAY[]::text[] AS liked_by`,
      [user_id, author_name, title, content, storedImageUrl],
    );
    return res.json(result.rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── GET /posts/:id ───────────────────────────────────────────────────────────
router.get("/posts/:id", async (req, res) => {
  const id = parseResourceId(String(req.params.id));
  if (id === null)
    return res.status(400).json({ error: "ID de post inválido" });

  if (!pool) {
    const db = localDB.get();
    const post = (db.posts ?? []).find((p: any) => p.id === id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    const comments = (db.comments ?? {})[id] ?? [];
    return res.json({ ...post, comments });
  }

  try {
    const post = await pool.query(
      `SELECT p.*,
              COALESCE(
                (SELECT array_agg(l.user_id ORDER BY l.user_id)
                 FROM py_forum_post_likes l
                 WHERE l.post_id = p.id),
                ARRAY[]::text[]
              ) AS liked_by
       FROM py_forum_posts p
       WHERE p.id = $1`,
      [id],
    );
    if (!post.rows[0])
      return res.status(404).json({ error: "Post no encontrado" });
    const comments = await pool.query(
      `SELECT c.*,
              COALESCE(
                (SELECT array_agg(l.user_id ORDER BY l.user_id)
                 FROM py_forum_comment_likes l
                 WHERE l.comment_id = c.id),
                ARRAY[]::text[]
              ) AS liked_by
       FROM py_forum_comments c
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [id],
    );
    return res.json({ ...post.rows[0], comments: comments.rows });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── POST /posts/:id/comments ─────────────────────────────────────────────────
router.post("/posts/:id/comments", requireAuth, async (req, res) => {
  const id = parseResourceId(String(req.params.id));
  if (id === null)
    return res.status(400).json({ error: "ID de post inválido" });
  const user = getAuthUser(req);
  const { content } = req.body;
  const user_id = user.id;
  const author_name = user.name;
  if (!content)
    return res.status(400).json({ error: "Faltan campos requeridos" });

  if (!pool) {
    const db = localDB.get();
    const post = (db.posts ?? []).find((p: any) => p.id === id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    const existingComments = Object.values(db.comments ?? {}).flat();
    const highestExistingId = existingComments.reduce(
      (highest, comment: any) => Math.max(highest, Number(comment.id) || 0),
      0,
    );
    const commentId = Math.max(
      db.commentIdCounter ?? 1,
      highestExistingId + 1,
    );
    db.commentIdCounter = commentId + 1;
    const comment = {
      id: commentId,
      post_id: id,
      user_id,
      author_name,
      content,
      created_at: new Date().toISOString(),
      likes_count: 0,
      liked_by: [],
    };

    if (!db.comments) db.comments = {};
    if (!db.comments[id]) db.comments[id] = [];
    db.comments[id].push(comment);

    // Update comment count on the post
    const postIdx = db.posts.findIndex((p: any) => p.id === id);
    if (postIdx !== -1)
      db.posts[postIdx].comment_count = db.comments[id].length;

    localDB.save(db);
    return res.json({ ok: true });
  }

  try {
    await pool.query(
      `INSERT INTO py_forum_comments (post_id, user_id, author_name, content)
       VALUES ($1, $2, $3, $4)`,
      [id, user_id, author_name, content],
    );
    await pool.query(
      "UPDATE py_forum_posts SET comment_count = comment_count + 1 WHERE id = $1",
      [id],
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── POST /posts/:id/like ─────────────────────────────────────────────────────
router.post("/posts/:id/like", requireAuth, async (req, res) => {
  const id = parseResourceId(String(req.params.id));
  if (id === null)
    return res.status(400).json({ error: "ID de post inválido" });
  const user_id = getAuthUser(req).id;

  if (!pool) {
    const db = localDB.get();
    const postIdx = (db.posts ?? []).findIndex((p: any) => p.id === id);
    if (postIdx === -1)
      return res.status(404).json({ error: "Post no encontrado" });

    const post = db.posts[postIdx];
    if (!post.liked_by) post.liked_by = [];
    if (!post.liked_by.includes(user_id)) {
      post.liked_by.push(user_id);
      post.likes_count = (post.likes_count || 0) + 1;
    }
    localDB.save(db);
    return res.json({ likes_count: post.likes_count });
  }

  try {
    const result = await pool.query(
      `WITH inserted AS (
         INSERT INTO py_forum_post_likes (post_id, user_id)
         SELECT id, $2 FROM py_forum_posts WHERE id = $1
         ON CONFLICT (post_id, user_id) DO NOTHING
         RETURNING 1
       ), updated AS (
         UPDATE py_forum_posts
         SET likes_count = likes_count + (SELECT COUNT(*)::int FROM inserted)
         WHERE id = $1
         RETURNING likes_count
       )
       SELECT likes_count FROM updated`,
      [id, user_id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Post no encontrado" });
    return res.json({ likes_count: result.rows[0].likes_count });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── POST /comments/:id/like ──────────────────────────────────────────────────
router.post("/comments/:id/like", requireAuth, async (req, res) => {
  const id = parseResourceId(String(req.params.id));
  if (id === null)
    return res.status(400).json({ error: "ID de comentario inválido" });
  const user_id = getAuthUser(req).id;

  if (!pool) {
    const db = localDB.get();
    for (const postId of Object.keys(db.comments ?? {})) {
      const arr: any[] = db.comments[postId as any] ?? [];
      const idx = arr.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        if (!arr[idx].liked_by) arr[idx].liked_by = [];
        if (!arr[idx].liked_by.includes(user_id)) {
          arr[idx].liked_by.push(user_id);
          arr[idx].likes_count = (arr[idx].likes_count || 0) + 1;
        }
        localDB.save(db);
        return res.json({ likes_count: arr[idx].likes_count });
      }
    }
    return res.status(404).json({ error: "Comentario no encontrado" });
  }

  try {
    const result = await pool.query(
      `WITH inserted AS (
         INSERT INTO py_forum_comment_likes (comment_id, user_id)
         SELECT id, $2 FROM py_forum_comments WHERE id = $1
         ON CONFLICT (comment_id, user_id) DO NOTHING
         RETURNING 1
       ), updated AS (
         UPDATE py_forum_comments
         SET likes_count = likes_count + (SELECT COUNT(*)::int FROM inserted)
         WHERE id = $1
         RETURNING likes_count
       )
       SELECT likes_count FROM updated`,
      [id, user_id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Comentario no encontrado" });
    return res.json({ likes_count: result.rows[0].likes_count });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
