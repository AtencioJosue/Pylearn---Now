import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {
  hashPassword,
  needsPasswordRehash,
  verifyPassword,
} from "../lib/crypto";

test("genera hashes versionados y compara contraseñas de forma segura", async () => {
  const password = "Una contraseña segura 2026";
  const stored = await hashPassword(password);

  assert.match(stored.hash, /^pbkdf2-sha512\$210000\$[a-f0-9]{128}$/);
  assert.equal(await verifyPassword(password, stored.salt, stored.hash), true);
  assert.equal(await verifyPassword("incorrecta", stored.salt, stored.hash), false);
  assert.equal(needsPasswordRehash(stored.hash), false);
});

test("mantiene acceso a hashes heredados y los marca para actualizar", async () => {
  const password = "contraseña anterior";
  const salt = crypto.randomBytes(16).toString("hex");
  const legacyHash = crypto
    .pbkdf2Sync(password, salt, 1_000, 64, "sha512")
    .toString("hex");

  assert.equal(await verifyPassword(password, salt, legacyHash), true);
  assert.equal(await verifyPassword("incorrecta", salt, legacyHash), false);
  assert.equal(needsPasswordRehash(legacyHash), true);
});
