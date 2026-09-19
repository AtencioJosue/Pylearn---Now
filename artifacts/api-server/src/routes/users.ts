import { Router, IRouter } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { localDB } from "../local_db";
import {
  hashPassword,
  needsPasswordRehash,
  verifyPassword,
} from "../lib/crypto";
import { pool } from "../database";
import { ensureUploadsDir, uploadsDir } from "../storage";

const router: IRouter = Router();
const achievementKeys = new Set([
  "registered",
  "progress_25",
  "progress_50",
  "progress_75",
  "progress_100",
  "builder_1",
  "builder_3",
  "builder_7",
  "builder_15",
]);

export function sanitizeUserRecord(user: Record<string, any>) {
  const {
    password_hash: _passwordHash,
    passwordHash: _passwordHashCamelCase,
    salt: _salt,
    ...publicUser
  } = user;
  return publicUser;
}

// ── Legacy Create User Route ──
router.post("/", async (req, res) => {
  const id = typeof req.body?.id === "string" ? req.body.id.trim() : "";
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!id || !name)
    return res.status(400).json({ error: "id y name requeridos" });

  if (!pool) {
    const db = localDB.get();
    const existing = db.users[id] ?? {};
    db.users[id] = {
      ...existing,
      id,
      name,
      email: existing.email ?? "",
      avatar_url: existing.avatar_url ?? "",
      created_at: existing.created_at ?? new Date().toISOString(),
    };
    localDB.save(db);
    return res.json({ id, name });
  }

  try {
    const result = await pool.query(
      `INSERT INTO py_users (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [id, name],
    );
    return res.json(result.rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Secure Register Route ──
router.post("/register", async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !name || !password) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios (email, name, password)" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Formato de correo inválido" });
  }

  const { salt, hash: password_hash } = await hashPassword(password);
  const id = crypto.randomUUID();
  const avatar_url = "";
  const created_at = new Date().toISOString();

  if (!pool) {
    const db = localDB.get();

    const emailExists = Object.values(db.users).some(
      (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase(),
    );
    if (emailExists) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado" });
    }

    const newUser = {
      id,
      email,
      name,
      password_hash,
      salt,
      avatar_url,
      created_at,
    };
    db.users[id] = newUser;
    db.achievements[id] = [
      { key: "registered", unlocked_at: created_at },
    ];
    localDB.save(db);

    return res.json({ id, email, name, avatar_url, created_at });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const checkEmail = await client.query(
      "SELECT id FROM py_users WHERE LOWER(email) = LOWER($1)",
      [email],
    );
    if (checkEmail.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado" });
    }

    const result = await client.query(
      `INSERT INTO py_users (id, email, name, password_hash, salt, avatar_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, avatar_url, created_at`,
      [id, email, name, password_hash, salt, avatar_url, created_at],
    );
    await client.query(
      `INSERT INTO py_achievements (user_id, key, unlocked_at)
       VALUES ($1, 'registered', $2)
       ON CONFLICT (user_id, key) DO NOTHING`,
      [id, created_at],
    );
    await client.query("COMMIT");
    return res.json(result.rows[0]);
  } catch (e: any) {
    await client.query("ROLLBACK");
    if (e?.code === "23505") {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado" });
    }
    return res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ── Secure Login Route ──
router.post("/login", async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios (email, password)" });
  }

  if (!pool) {
    const db = localDB.get();
    const user = Object.values(db.users).find(
      (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user || !user.salt || !user.password_hash) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isMatch = await verifyPassword(
      password,
      user.salt,
      user.password_hash,
    );
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    if (needsPasswordRehash(user.password_hash)) {
      const upgraded = await hashPassword(password);
      user.salt = upgraded.salt;
      user.password_hash = upgraded.hash;
      db.users[user.id] = user;
      localDB.save(db);
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url || "",
      created_at: user.created_at || "",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM py_users WHERE LOWER(email) = LOWER($1)",
      [email],
    );
    const user = result.rows[0];
    if (!user || !user.salt || !user.password_hash) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isMatch = await verifyPassword(
      password,
      user.salt,
      user.password_hash,
    );
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }


    if (needsPasswordRehash(user.password_hash)) {
      const upgraded = await hashPassword(password);
      await pool.query(
        "UPDATE py_users SET password_hash = $1, salt = $2 WHERE id = $3",
        [upgraded.hash, upgraded.salt, user.id],
      );
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url || "",
      created_at: user.created_at || "",
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Update Profile Route ──
router.put("/:id", async (req, res) => {
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
  const { avatar_url } = req.body ?? {};
  const { id } = req.params;

  if (name !== undefined && name.length < 2) {
    return res
      .status(400)
      .json({ error: "El nombre debe tener al menos 2 caracteres" });
  }
  if (avatar_url !== undefined && typeof avatar_url !== "string") {
    return res.status(400).json({ error: "avatar_url inválido" });
  }

  if (!pool) {
    const db = localDB.get();
    const user = db.users[id];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (name !== undefined) user.name = name;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    db.users[id] = user;
    localDB.save(db);

    return res.json({
      id: user.id,
      email: user.email || "",
      name: user.name,
      avatar_url: user.avatar_url || "",
      created_at: user.created_at || "",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE py_users
       SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3
       RETURNING id, email, name, avatar_url, created_at`,
      [name, avatar_url, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.json(result.rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Handle Base64 Profile Picture Upload Route ──
router.post("/:id/avatar", async (req, res) => {
  const { id } = req.params;
  const { avatar_data } = req.body;

  if (typeof avatar_data !== "string" || !avatar_data) {
    return res.status(400).json({
      error: "No se recibió información de la imagen (avatar_data requerido)",
    });
  }

  let localUser: any = null;
  let localData: ReturnType<typeof localDB.get> | null = null;
  let previousAvatar = "";

  if (!pool) {
    localData = localDB.get();
    localUser = localData.users[id];
    if (!localUser)
      return res.status(404).json({ error: "Usuario no encontrado" });
    previousAvatar = localUser.avatar_url || "";
  } else {
    const fetchResult = await pool.query(
      "SELECT avatar_url FROM py_users WHERE id = $1",
      [id],
    );
    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    previousAvatar = fetchResult.rows[0].avatar_url || "";
  }

  let newFilePath = "";
  try {
    const matches = avatar_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res
        .status(400)
        .json({ error: "Formato de imagen base64 inválido" });
    }

    const imageType = matches[1].toLowerCase();
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const extensions: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
    };
    const extension = extensions[imageType];
    if (!extension) {
      return res.status(400).json({ error: "Formato de imagen no permitido" });
    }
    if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: "La imagen debe pesar como máximo 2MB" });
    }

    ensureUploadsDir();
    const safeUserId = crypto
      .createHash("sha256")
      .update(id)
      .digest("hex")
      .slice(0, 24);
    const filename = `${safeUserId}_avatar_${Date.now()}.${extension}`;
    newFilePath = path.join(uploadsDir, filename);
    fs.writeFileSync(newFilePath, buffer, { flag: "wx" });

    const relativeUrl = `/uploads/${filename}`;

    if (!pool) {
      localUser.avatar_url = relativeUrl;
      localData!.users[id] = localUser;
      localDB.save(localData!);

      removePreviousAvatar(previousAvatar);

      return res.json({ avatar_url: relativeUrl });
    }

    await pool.query("UPDATE py_users SET avatar_url = $1 WHERE id = $2", [
      relativeUrl,
      id,
    ]);
    removePreviousAvatar(previousAvatar);
    return res.json({ avatar_url: relativeUrl });
  } catch (error: any) {
    if (newFilePath && fs.existsSync(newFilePath)) {
      try {
        fs.unlinkSync(newFilePath);
      } catch (cleanupError) {
        console.error("Error deleting incomplete avatar upload:", cleanupError);
      }
    }
    return res
      .status(500)
      .json({ error: "Error al guardar el avatar: " + error.message });
  }
});

function removePreviousAvatar(avatarUrl: string) {
  if (!avatarUrl.startsWith("/uploads/")) return;

  const previousPath = path.join(uploadsDir, path.basename(avatarUrl));
  if (!fs.existsSync(previousPath)) return;

  try {
    fs.unlinkSync(previousPath);
  } catch (error) {
    console.error("Error deleting old avatar:", error);
  }
}

// ── Get User Route ──
router.get("/:id", async (req, res) => {
  if (!pool) {
    const db = localDB.get();
    const user = db.users[req.params.id];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    const achievements = db.achievements[req.params.id] || [];
    const exercisesCreated = (db.createdExercises ?? []).filter(
      (exercise: any) =>
        exercise.user_id === req.params.id && exercise.status === "approved",
    ).length;
    return res.json({
      ...sanitizeUserRecord(user),
      achievements,
      exercisesCreated,
    });
  }

  try {
    const user = await pool.query(
      `SELECT id, email, name, avatar_url, created_at
       FROM py_users
       WHERE id = $1`,
      [req.params.id],
    );
    if (!user.rows[0])
      return res.status(404).json({ error: "Usuario no encontrado" });
    const achievements = await pool.query(
      "SELECT key, unlocked_at FROM py_achievements WHERE user_id = $1 ORDER BY unlocked_at",
      [req.params.id],
    );
    const exercisesCreated = await pool.query(
      "SELECT COUNT(*) as count FROM py_created_exercises WHERE user_id = $1 AND status = 'approved'",
      [req.params.id],
    );
    return res.json({
      ...user.rows[0],
      achievements: achievements.rows,
      exercisesCreated: parseInt(exercisesCreated.rows[0]?.count ?? "0"),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Unlock Achievement Route ──
router.post("/:id/achievements", async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "key requerido" });
  if (!achievementKeys.has(key))
    return res.status(400).json({ error: "Logro desconocido" });

  if (!pool) {
    const db = localDB.get();
    if (!db.users[req.params.id])
      return res.status(404).json({ error: "Usuario no encontrado" });
    const arr = db.achievements[req.params.id] || [];
    if (!arr.some((a) => a.key === key)) {
      arr.push({ key, unlocked_at: new Date().toISOString() });
      db.achievements[req.params.id] = arr;
      localDB.save(db);
    }
    return res.json({ ok: true });
  }

  try {
    const user = await pool.query("SELECT 1 FROM py_users WHERE id = $1", [
      req.params.id,
    ]);
    if (!user.rowCount)
      return res.status(404).json({ error: "Usuario no encontrado" });
    await pool.query(
      `INSERT INTO py_achievements (user_id, key) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, key],
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
