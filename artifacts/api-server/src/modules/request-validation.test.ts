import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import app from "../app";

test("rechaza consultas sin usuario e IDs de foro inválidos", async () => {
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });

  try {
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}/api`;

    const progress = await fetch(`${baseUrl}/progress`);
    const gamification = await fetch(`${baseUrl}/gamification/status`);
    const invalidPost = await fetch(`${baseUrl}/forum/posts/no-es-id/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "test-user" }),
    });

    assert.equal(progress.status, 400);
    assert.equal(gamification.status, 400);
    assert.equal(invalidPost.status, 400);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
