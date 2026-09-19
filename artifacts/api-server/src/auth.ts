import crypto from "crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ensureRemoteAuthSchema, pool } from "./database";
import { localDB } from "./local_db";

const SESSION_COOKIE = "pylearn_session";
const SESSION_DAYS = 30;
const CODE_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
};

export type AuthRequest = Request & { auth?: AuthUser };

function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function tokenHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function newCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function newOpaqueToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function expiryMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000);
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.cookie ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function setSessionCookie(res: Response, token: string) {
  const secure = isProduction() ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`,
  );
}

export function clearSessionCookie(res: Response) {
  const secure = isProduction() ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

function publicUser(user: any): AuthUser {
  return {
    id: String(user.id),
    email: String(user.email ?? ""),
    name: String(user.name ?? ""),
    avatar_url: String(user.avatar_url ?? ""),
    created_at: user.created_at
      ? new Date(user.created_at).toISOString()
      : new Date().toISOString(),
  };
}

export async function createSession(userId: string, res: Response) {
  const rawToken = newOpaqueToken();
  const hash = tokenHash(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);

  if (pool) {
    await ensureRemoteAuthSchema();
    await pool.query(
      `INSERT INTO py_sessions (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), userId, hash, expiresAt],
    );
  } else {
    const db = localDB.get();
    db.sessions ??= {};
    db.sessions[hash] = {
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    };
    localDB.save(db);
  }

  setSessionCookie(res, rawToken);
}

export async function destroyCurrentSession(req: Request) {
  const rawToken = readCookie(req, SESSION_COOKIE);
  if (!rawToken) return;
  const hash = tokenHash(rawToken);

  if (pool) {
    await ensureRemoteAuthSchema();
    await pool.query("DELETE FROM py_sessions WHERE token_hash = $1", [hash]);
  } else {
    const db = localDB.get();
    if (db.sessions) {
      delete db.sessions[hash];
      localDB.save(db);
    }
  }
}

async function loadSessionUser(req: Request): Promise<AuthUser | null> {
  const rawToken = readCookie(req, SESSION_COOKIE);
  if (!rawToken) return null;
  const hash = tokenHash(rawToken);

  if (pool) {
    await ensureRemoteAuthSchema();
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.created_at
       FROM py_sessions s
       JOIN py_users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > NOW()
         AND u.email_verified_at IS NOT NULL
       LIMIT 1`,
      [hash],
    );
    return result.rows[0] ? publicUser(result.rows[0]) : null;
  }

  const db = localDB.get();
  const session = db.sessions?.[hash];
  if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
    return null;
  }
  const user = db.users[session.user_id];
  if (!user || !user.email_verified_at) return null;
  return publicUser(user);
}

export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await loadSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Debes iniciar sesión." });
      return;
    }
    (req as AuthRequest).auth = user;
    next();
  } catch (error) {
    next(error);
  }
};

export async function getAuthenticatedUser(req: Request) {
  return loadSessionUser(req);
}

export function getAuthUser(req: Request): AuthUser {
  const user = (req as AuthRequest).auth;
  if (!user) throw new Error("Authenticated user is missing");
  return user;
}

function isDevEmailMode() {
  return !isProduction() && !process.env.RESEND_API_KEY;
}

async function sendEmail(to: string, subject: string, html: string, code: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    if (isDevEmailMode() || process.env.AUTH_ALLOW_DEV_CODES === "true") {
      console.warn(`[Pylearn auth] Código para ${to}: ${code}`);
      return;
    }
    throw new Error("El correo no está configurado. Falta RESEND_API_KEY.");
  }

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("El correo no está configurado. Falta EMAIL_FROM.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`No se pudo enviar el correo (${response.status}). ${detail}`);
  }
}

export async function issueEmailVerificationCode(
  user: { id: string; email: string; name: string },
) {
  const code = newCode();
  const codeHash = tokenHash(code);
  const expiresAt = expiryMinutes(CODE_MINUTES);

  if (pool) {
    await ensureRemoteAuthSchema();
    await pool.query(
      "DELETE FROM py_email_verification_tokens WHERE user_id = $1",
      [user.id],
    );
    await pool.query(
      `INSERT INTO py_email_verification_tokens
       (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), user.id, codeHash, expiresAt],
    );
  } else {
    const db = localDB.get();
    db.emailVerificationTokens ??= {};
    for (const [id, item] of Object.entries(db.emailVerificationTokens)) {
      if (item.user_id === user.id) delete db.emailVerificationTokens[id];
    }
    db.emailVerificationTokens[crypto.randomUUID()] = {
      user_id: user.id,
      token_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
    };
    localDB.save(db);
  }

  await sendEmail(
    user.email,
    "Tu código de verificación de Pylearn",
    `<p>Hola ${escapeHtml(user.name)},</p>
     <p>Tu código de verificación es:</p>
     <p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p>
     <p>Caduca en ${CODE_MINUTES} minutos. Si no fuiste tú, ignora este mensaje.</p>`,
    code,
  );

  return isDevEmailMode() || process.env.AUTH_ALLOW_DEV_CODES === "true"
    ? code
    : undefined;
}

export async function issuePasswordResetCode(
  user: { id: string; email: string; name: string },
) {
  const code = newCode();
  const codeHash = tokenHash(code);
  const expiresAt = expiryMinutes(CODE_MINUTES);

  if (pool) {
    await ensureRemoteAuthSchema();
    await pool.query(
      "DELETE FROM py_password_reset_tokens WHERE user_id = $1",
      [user.id],
    );
    await pool.query(
      `INSERT INTO py_password_reset_tokens
       (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), user.id, codeHash, expiresAt],
    );
  } else {
    const db = localDB.get();
    db.passwordResetTokens ??= {};
    for (const [id, item] of Object.entries(db.passwordResetTokens)) {
      if (item.user_id === user.id) delete db.passwordResetTokens[id];
    }
    db.passwordResetTokens[crypto.randomUUID()] = {
      user_id: user.id,
      token_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
    };
    localDB.save(db);
  }

  await sendEmail(
    user.email,
    "Recupera tu contraseña de Pylearn",
    `<p>Hola ${escapeHtml(user.name)},</p>
     <p>Tu código para crear una nueva contraseña es:</p>
     <p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p>
     <p>Caduca en ${CODE_MINUTES} minutos y solo puede usarse una vez.</p>`,
    code,
  );

  return isDevEmailMode() || process.env.AUTH_ALLOW_DEV_CODES === "true"
    ? code
    : undefined;
}

export async function consumeCode(
  kind: "email" | "reset",
  userId: string,
  code: string,
) {
  const table =
    kind === "email"
      ? "py_email_verification_tokens"
      : "py_password_reset_tokens";
  const hash = tokenHash(code.trim());

  if (pool) {
    await ensureRemoteAuthSchema();
    const result = await pool.query(
      `SELECT id, token_hash, expires_at, attempts
       FROM ${table}
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );
    const row = result.rows[0];
    if (!row) return false;
    if (Number(row.attempts) >= MAX_CODE_ATTEMPTS) {
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [row.id]);
      return false;
    }
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [row.id]);
      return false;
    }
    if (row.token_hash !== hash) {
      await pool.query(
        `UPDATE ${table} SET attempts = attempts + 1 WHERE id = $1`,
        [row.id],
      );
      return false;
    }
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [row.id]);
    return true;
  }

  const db = localDB.get();
  const collection =
    kind === "email"
      ? db.emailVerificationTokens ?? {}
      : db.passwordResetTokens ?? {};
  const item = Object.entries(collection)
    .filter(([, value]) => value.user_id === userId)
    .sort(([, a], [, b]) =>
      String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
    )[0];
  if (!item) return false;
  const [id, value] = item;
  if (
    Number(value.attempts ?? 0) >= MAX_CODE_ATTEMPTS ||
    new Date(value.expires_at).getTime() <= Date.now()
  ) {
    delete collection[id];
    localDB.save(db);
    return false;
  }
  if (value.token_hash !== hash) {
    value.attempts = Number(value.attempts ?? 0) + 1;
    localDB.save(db);
    return false;
  }
  delete collection[id];
  localDB.save(db);
  return true;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export { publicUser };
