import { Router, IRouter } from "express";
import { Pool } from "pg";

const router: IRouter = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post("/", async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: "id y name requeridos" });
  try {
    const result = await pool.query(
      `INSERT INTO py_users (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [id, name]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM py_users WHERE id = $1", [req.params.id]);
    if (!user.rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });
    const achievements = await pool.query(
      "SELECT key, unlocked_at FROM py_achievements WHERE user_id = $1 ORDER BY unlocked_at",
      [req.params.id]
    );
    const exercisesCreated = await pool.query(
      "SELECT COUNT(*) as count FROM py_created_exercises WHERE user_id = $1 AND status = 'approved'",
      [req.params.id]
    );
    res.json({
      ...user.rows[0],
      achievements: achievements.rows,
      exercisesCreated: parseInt(exercisesCreated.rows[0]?.count ?? "0"),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/achievements", async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "key requerido" });
  try {
    await pool.query(
      `INSERT INTO py_achievements (user_id, key) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, key]
    );
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
