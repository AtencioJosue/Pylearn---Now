import assert from "node:assert/strict";
import test from "node:test";
import type { LocalDB } from "../../local_db";
import { getOrCreateUserProgress } from "./user-progress";

function createDatabase(): LocalDB {
  return {
    users: { first: { id: "first" }, second: { id: "second" } },
    achievements: {},
    answers: { "7": { correct: true, answer: "print" } },
    posts: [],
    postIdCounter: 1,
    comments: {},
    commentIdCounter: 1,
    totalAttempts: 3,
    correctAttempts: 1,
    userGamification: {
      totalXp: 10,
      weeklyXp: 10,
      leagueTier: 1,
      boardId: "bronce-initial-b1",
    },
  };
}

test("el primer usuario conserva el progreso global anterior", () => {
  const db = createDatabase();
  const lookup = getOrCreateUserProgress(db, "first");

  assert.equal(lookup.claimedLegacyProgress, true);
  assert.equal(lookup.progress.answers["7"]?.correct, true);
  assert.equal(lookup.progress.totalAttempts, 3);
  assert.equal(lookup.progress.gamification.totalXp, 10);
  assert.equal(db.legacyProgressClaimedBy, "first");
});

test("cada usuario nuevo obtiene progreso independiente", () => {
  const db = createDatabase();
  const first = getOrCreateUserProgress(db, "first").progress;
  const second = getOrCreateUserProgress(db, "second").progress;

  second.answers["8"] = { correct: true, answer: "range" };
  second.gamification.totalXp = 20;

  assert.equal(first.answers["8"], undefined);
  assert.equal(first.gamification.totalXp, 10);
  assert.deepEqual(Object.keys(second.answers), ["8"]);
});

test("consultar de nuevo devuelve el mismo progreso", () => {
  const db = createDatabase();
  const firstLookup = getOrCreateUserProgress(db, "first");
  const secondLookup = getOrCreateUserProgress(db, "first");

  assert.equal(secondLookup.created, false);
  assert.equal(secondLookup.progress, firstLookup.progress);
});
