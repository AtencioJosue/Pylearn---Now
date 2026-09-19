import assert from "node:assert/strict";
import test from "node:test";
import { getTableName } from "drizzle-orm";
import {
  achievementsTable,
  commentsTable,
  createdExercisesTable,
  forumCommentLikesTable,
  forumPostLikesTable,
  postsTable,
  userProgressTable,
  usersTable,
} from "@workspace/db/schema";

test("el esquema PostgreSQL coincide con las tablas usadas por las rutas", () => {
  assert.deepEqual(
    [
      usersTable,
      achievementsTable,
      createdExercisesTable,
      postsTable,
      commentsTable,
      forumPostLikesTable,
      forumCommentLikesTable,
      userProgressTable,
    ].map(getTableName),
    [
      "py_users",
      "py_achievements",
      "py_created_exercises",
      "py_forum_posts",
      "py_forum_comments",
      "py_forum_post_likes",
      "py_forum_comment_likes",
      "py_user_progress",
    ],
  );
});
