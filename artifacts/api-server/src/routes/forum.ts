import { Router, IRouter } from "express";
import { Pool } from "pg";

const router: IRouter = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get("/posts", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM py_forum_posts ORDER BY created_at DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/posts", async (req, res) => {
  const { user_id, author_name, title, content, image_url } = req.body;
  if (!user_id || !author_name || !title || !content)
    return res.status(400).json({ error: "Faltan campos requeridos" });
  try {
    const result = await pool.query(
      `INSERT INTO py_forum_posts (user_id, author_name, title, content, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, author_name, title, content, image_url ?? null]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await pool.query(
      "SELECT * FROM py_forum_posts WHERE id = $1",
      [req.params.id]
    );
    if (!post.rows[0]) return res.status(404).json({ error: "Post no encontrado" });
    const comments = await pool.query(
      "SELECT * FROM py_forum_comments WHERE post_id = $1 ORDER BY created_at ASC",
      [req.params.id]
    );
    res.json({ ...post.rows[0], comments: comments.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/posts/:id/comments", async (req, res) => {
  const { user_id, author_name, content } = req.body;
  if (!user_id || !author_name || !content)
    return res.status(400).json({ error: "Faltan campos requeridos" });
  try {
    await pool.query(
      `INSERT INTO py_forum_comments (post_id, user_id, author_name, content)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, user_id, author_name, content]
    );
    await pool.query(
      "UPDATE py_forum_posts SET comment_count = comment_count + 1 WHERE id = $1",
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
