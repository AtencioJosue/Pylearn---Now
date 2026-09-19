import { Router, type IRouter } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { pool, ensureRemoteAuthSchema } from "../database";
import {
  clearSessionCookie,
  consumeCode,
  createSession,
  destroyCurrentSession,
  getAuthUser,
  issueEmailVerificationCode,
  issuePasswordResetCode,
  publicUser,
  requireAuth,
} from "../auth";
import { hashPassword, verifyPassword } from "../lib/crypto";
import { localDB } from "../local_db";
import { storeImage } from "../storage";

const router: IRouter = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera unos minutos y vuelve a intentar." },
});
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

function persistenceReady(res: any) {
  if (process.env.VERCEL === "1" && !pool) {
    res.status(503).json({
      error:
        "La base de datos de producción aún no está configurada. Añade DATABASE_URL en Vercel.",
    });
    return false;
  }
  return true;
}

function isVerified(user: any) {
  return Boolean(user?.email_verified_at);
}

async function findUserByEmail(email: string) {
  if (pool) {
    await ensureRemoteAuthSchema();
    const result = await pool.query(
      `SELECT id, email, name, password_hash, salt, avatar_url, created_at,
              email_verified_at
       FROM py_users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  const db = localDB.get();
  return (
    Object.values(db.users).find(
      (user: any) => String(user.email ?? "").toLowerCase() === email,
    ) ?? null
  );
}

async function findUserById(id: string) {
  if (pool) {
    await ensureRemoteAuthSchema();
    const result = await pool.query(
      `SELECT id, email, name, avatar_url, created_at, email_verified_at
       FROM py_users WHERE id = $1 LIMIT 1`,
      [id],
    );
    return result.rows[0] ?? null;
  }
  return localDB.get().users[id] ?? null;
}

export function sanitizeUserRecord(user: Record<string, any>) {
  const {
    password_hash: _passwordHash,
    passwordHash: _passwordHashCamelCase,
    salt: _salt,
    email_verified_at: _emailVerifiedAt,
    ...publicRecord
  } = user;
  return publicRecord;
}

function publicProfile(user: any) {
  return {
    ...publicUser(user),
    email_verified: isVerified(user),
  };
}

router.post("/resend-verification", authLimiter, async (req, res) => {
  if (!persistenceReady(res)) return;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  if (!email) return res.status(400).json({ error: "Correo inválido." });

  try {
    const user = await findUserByEmail(email);
    if (user && !isVerified(user)) {
      const debugCode = await issueEmailVerificationCode({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      return res.json({
        ok: true,
        ...(debugCode ? { debug_code: debugCode } : {}),
      });
    }
    return res.json({ ok: true });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return res.status(500).json({ error: "No se pudo enviar el correo." });
  }
});

router.post("/verify-email", authLimiter, async (req, res) => {
  if (!persistenceReady(res)) return;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  if (!email || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "El código debe tener 6 dígitos." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || isVerified(user)) {
      return res.status(400).json({ error: "El código no es válido." });
    }
    const valid = await consumeCode("email", user.id, code);
    if (!valid) return res.status(400).json({ error: "El código no es válido o expiró." });

    if (pool) {
      await pool.query(
        "UPDATE py_users SET email_verified_at = NOW() WHERE id = $1",
        [user.id],
      );
    } else {
      const db = localDB.get();
      const localUser = db.users[user.id];
      localUser.email_verified_at = new Date().toISOString();
      db.users[user.id] = localUser;
      localDB.save(db);
    }

    const verifiedUser = await findUserById(user.id);
    await createSession(user.id, res);
    return res.json({ user: publicProfile(verifiedUser) });
  } catch (error: any) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ error: "No se pudo verificar el correo." });
  }
});

router.post("/register", authLimiter, async (req, res) => {
  if (!persistenceReady(res)) return;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Formato de correo inválido." });
  }
  if (name.length < 2 || name.length > 50) {
    return res.status(400).json({ error: "El nombre debe tener entre 2 y 50 caracteres." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "La contraseña debe tener entre 8 y 128 caracteres." });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Ese correo ya está registrado." });
    }

    const { salt, hash: password_hash } = await hashPassword(password);
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const user = {
      id,
      email,
      name,
      password_hash,
      salt,
      avatar_url: "",
      created_at,
      email_verified_at: null,
    };

    if (pool) {
      await ensureRemoteAuthSchema();
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO py_users
             (id, email, name, password_hash, salt, avatar_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, email, name, password_hash, salt, "", created_at],
        );
        await client.query(
          `INSERT INTO py_achievements (user_id, key, unlocked_at)
           VALUES ($1, 'registered', $2)`,
          [id, created_at],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      const db = localDB.get();
      db.users[id] = user;
      db.achievements[id] = [{ key: "registered", unlocked_at: created_at }];
      localDB.save(db);
    }

    const debugCode = await issueEmailVerificationCode({ id, email, name });
    return res.status(201).json({
      pending_verification: true,
      email,
      ...(debugCode ? { debug_code: debugCode } : {}),
    });
  } catch (error: any) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "No se pudo crear la cuenta." });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  if (!persistenceReady(res)) return;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !user.salt || !user.password_hash) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    if (!isVerified(user)) {
      return res.status(403).json({
        error: "Verifica tu correo antes de iniciar sesión.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }
    const valid = await verifyPassword(password, user.salt, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Credenciales incorrectas." });

    await createSession(user.id, res);
    return res.json({ user: publicProfile(user) });
  } catch (error: any) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    await destroyCurrentSession(req);
  } finally {
    clearSessionCookie(res);
  }
  return res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  const profile = await buildProfile(user.id);
  return res.json(profile);
});

router.post("/forgot-password", authLimiter, async (req, res) => {
  if (!persistenceReady(res)) return;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  if (!email) return res.status(400).json({ error: "Correo inválido." });

  try {
    const user = await findUserByEmail(email);
    if (user && isVerified(user)) {
      const debugCode = await issuePasswordResetCode({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      return res.json({
        ok: true,
        message: "Si el correo existe, recibirás un código.",
        ...(debugCode ? { debug_code: debugCode } : {}),
      });
    }
    return res.json({ ok: true, message: "Si el correo existe, recibirás un código." });
  } catch (error) {
    console.error("Error creating password reset:", error);
    return res.json({ ok: true, message: "Si el correo existe, recibirás un código." });
  }
});

router.post("/reset-password", authLimiter, async (req, res) => {
  if (!persistenceReady(res)) return;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !/^\d{6}$/.test(code) || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Datos de recuperación inválidos." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !isVerified(user) || !(await consumeCode("reset", user.id, code))) {
      return res.status(400).json({ error: "El código no es válido o expiró." });
    }
    const { salt, hash } = await hashPassword(password);
    if (pool) {
      await pool.query(
        `UPDATE py_users SET password_hash = $1, salt = $2 WHERE id = $3`,
        [hash, salt, user.id],
      );
      await pool.query("DELETE FROM py_sessions WHERE user_id = $1", [user.id]);
    } else {
      const db = localDB.get();
      db.users[user.id].password_hash = hash;
      db.users[user.id].salt = salt;
      for (const [sessionHash, session] of Object.entries(db.sessions ?? {})) {
        if (session.user_id === user.id) delete db.sessions?.[sessionHash];
      }
      localDB.save(db);
    }
    return res.json({ ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "No se pudo actualizar la contraseña." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : user.name;
  return updateUserProfile(user.id, name, undefined, res);
});

router.put("/:id", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  if (req.params.id !== user.id) return res.status(403).json({ error: "No autorizado." });
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
  const avatarUrl = req.body?.avatar_url;
  if (name !== undefined && (name.length < 2 || name.length > 50)) {
    return res.status(400).json({ error: "El nombre debe tener entre 2 y 50 caracteres." });
  }
  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    return res.status(400).json({ error: "avatar_url inválido." });
  }
  return updateUserProfile(user.id, name, avatarUrl, res);
});

async function updateUserProfile(
  id: string,
  name: string | undefined,
  avatarUrl: string | undefined,
  res: any,
) {
  if (pool) {
    const result = await pool.query(
      `UPDATE py_users
       SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3
       RETURNING id, email, name, avatar_url, created_at, email_verified_at`,
      [name, avatarUrl, id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Usuario no encontrado." });
    return res.json(publicProfile(result.rows[0]));
  }
  const db = localDB.get();
  const user = db.users[id];
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
  if (name !== undefined) user.name = name;
  if (avatarUrl !== undefined) user.avatar_url = avatarUrl;
  db.users[id] = user;
  localDB.save(db);
  return res.json(publicProfile(user));
}

router.post("/:id/avatar", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  if (req.params.id !== user.id) return res.status(403).json({ error: "No autorizado." });
  const { avatar_data } = req.body ?? {};
  if (typeof avatar_data !== "string" || !avatar_data) {
    return res.status(400).json({ error: "No se recibió una imagen." });
  }
  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: "El almacenamiento de imágenes de producción aún no está configurado.",
    });
  }

  let localFilePath: string | null = null;
  try {
    const matches = avatar_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return res.status(400).json({ error: "Imagen inválida." });
    const imageType = matches[1].toLowerCase();
    const buffer = Buffer.from(matches[2], "base64");
    const extensions: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp",
    };
    const extension = extensions[imageType];
    if (!extension) return res.status(400).json({ error: "Formato de imagen no permitido." });
    if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: "La imagen debe pesar como máximo 2MB." });
    }

    const safeUserId = crypto.createHash("sha256").update(user.id).digest("hex").slice(0, 24);
    const filename = `${safeUserId}_avatar_${Date.now()}.${extension}`;
    const stored = await storeImage(filename, buffer, imageType);
    localFilePath = stored.localPath;
    const relativeUrl = stored.url;

    if (pool) {
      await pool.query("UPDATE py_users SET avatar_url = $1 WHERE id = $2", [relativeUrl, user.id]);
    } else {
      const db = localDB.get();
      db.users[user.id].avatar_url = relativeUrl;
      localDB.save(db);
    }
    return res.json({ avatar_url: relativeUrl });
  } catch (error: any) {
    if (localFilePath) {
      try {
        const fs = await import("fs");
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
      } catch {
        // Cleanup is best-effort.
      }
    }
    return res.status(500).json({ error: "No se pudo guardar el avatar." });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  const authUser = getAuthUser(req);
  if (req.params.id !== authUser.id) return res.status(403).json({ error: "No autorizado." });
  return res.json(await buildProfile(authUser.id));
});

async function buildProfile(id: string) {
  const user = await findUserById(id);
  if (!user) return null;
  if (pool) {
    const achievements = await pool.query(
      "SELECT key, unlocked_at FROM py_achievements WHERE user_id = $1 ORDER BY unlocked_at",
      [id],
    );
    const exercises = await pool.query(
      "SELECT COUNT(*)::int AS count FROM py_created_exercises WHERE user_id = $1 AND status = 'approved'",
      [id],
    );
    return {
      ...publicProfile(user),
      achievements: achievements.rows,
      exercisesCreated: exercises.rows[0]?.count ?? 0,
    };
  }
  const db = localDB.get();
  return {
    ...publicProfile(user),
    achievements: db.achievements[id] ?? [],
    exercisesCreated: (db.createdExercises ?? []).filter(
      (exercise: any) => exercise.user_id === id && exercise.status === "approved",
    ).length,
  };
}

router.post("/:id/achievements", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  if (req.params.id !== user.id) return res.status(403).json({ error: "No autorizado." });
  const { key } = req.body ?? {};
  if (!achievementKeys.has(key)) return res.status(400).json({ error: "Logro desconocido." });

  if (pool) {
    await pool.query(
      `INSERT INTO py_achievements (user_id, key)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, key],
    );
  } else {
    const db = localDB.get();
    if (!db.achievements[user.id]) db.achievements[user.id] = [];
    if (!db.achievements[user.id].some((item: any) => item.key === key)) {
      db.achievements[user.id].push({ key, unlocked_at: new Date().toISOString() });
      localDB.save(db);
    }
  }
  return res.json({ ok: true });
});

export default router;
