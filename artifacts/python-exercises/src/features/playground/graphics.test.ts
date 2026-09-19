import test from "node:test";
import assert from "node:assert/strict";
import {
  applyGraphicsMessage,
  CHART_TEMPLATE,
  GAME_TEMPLATE,
  PYGAME_TEMPLATE,
  gameKeyIndex,
} from "./graphics.ts";

test("opens a safe, bounded game screen", () => {
  const output = applyGraphicsMessage(
    null,
    {
      action: "open",
      width: 9000,
      height: 20,
      title: "Mi juego",
      background: "#123456",
    },
    4,
  );
  assert.equal(output?.kind, "canvas");
  if (output?.kind !== "canvas") return;
  assert.equal(output.width, 1280);
  assert.equal(output.height, 160);
  assert.equal(output.session, 4);
  assert.equal(output.background, "#123456");
});

test("keeps valid drawing commands and rejects unsafe image paths", () => {
  const output = applyGraphicsMessage(
    null,
    {
      action: "frame",
      commands: [
        { t: "circle", x: 20, y: 30, radius: 12, color: "gold" },
        { t: "image", path: "../secreto.png", x: 0, y: 0 },
        { t: "unknown" },
      ],
    },
    2,
  );
  assert.equal(output?.kind, "canvas");
  if (output?.kind !== "canvas") return;
  assert.equal(output.commands.length, 1);
  assert.equal(output.commands[0].t, "circle");
});

test("accepts Matplotlib images without truncating their base64 data", () => {
  const data = "a".repeat(1200);
  const output = applyGraphicsMessage(
    null,
    { action: "image", title: "Progreso", data },
    7,
  );
  assert.equal(output?.kind, "image");
  if (output?.kind !== "image") return;
  assert.equal(output.dataUrl, `data:image/png;base64,${data}`);
  assert.equal(output.session, 7);
});

test("normalizes game keys and ships runnable starter examples", () => {
  assert.equal(gameKeyIndex("W"), gameKeyIndex("w"));
  assert.ok(gameKeyIndex("ArrowRight") >= 0);
  assert.match(GAME_TEMPLATE, /from pylearn import/);
  assert.match(GAME_TEMPLATE, /actualizar\(60\)/);
  assert.match(PYGAME_TEMPLATE, /import pygame/);
  assert.match(PYGAME_TEMPLATE, /pygame\.display\.flip\(\)/);
  assert.match(CHART_TEMPLATE, /plt\.show\(\)/);
});

test("sanitizes outlined circles, ellipses and polygons", () => {
  const output = applyGraphicsMessage(
    null,
    {
      action: "frame",
      commands: [
        { t: "circle", x: 20, y: 20, radius: 9, color: "red", width: 2 },
        { t: "ellipse", x: 4, y: 5, w: 30, h: 12, color: "blue", width: 0 },
        {
          t: "polygon",
          points: [
            [0, 0],
            [20, 0],
            [10, 10],
          ],
          color: "gold",
          width: 3,
        },
      ],
    },
    9,
  );
  assert.equal(output?.kind, "canvas");
  if (output?.kind !== "canvas") return;
  assert.deepEqual(
    output.commands.map((command) => command.t),
    ["circle", "ellipse", "polygon"],
  );
});
