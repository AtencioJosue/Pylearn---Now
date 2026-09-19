import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeUserRecord } from "../routes/users";

test("nunca expone hashes ni sales de contraseña", () => {
  const user = sanitizeUserRecord({
    id: "user-1",
    name: "Ada",
    email: "ada@example.test",
    password_hash: "hash-secreto",
    passwordHash: "hash-camel-case",
    salt: "sal-secreta",
  });

  assert.deepEqual(user, {
    id: "user-1",
    name: "Ada",
    email: "ada@example.test",
  });
  assert.equal("password_hash" in user, false);
  assert.equal("passwordHash" in user, false);
  assert.equal("salt" in user, false);
});
