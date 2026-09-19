import { relations, sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const usersTable = pgTable("py_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  salt: text("salt"),
  avatarUrl: text("avatar_url").default("").notNull(),
  createdAt: createdAt(),
});

export const achievementsTable = pgTable(
  "py_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.key] })],
);

export const createdExercisesTable = pgTable("py_created_exercises", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  type: text("type").notNull(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  hint: text("hint"),
  explanation: text("explanation"),
  aiFeedback: text("ai_feedback").notNull(),
  status: text("status").notNull(),
  createdAt: createdAt(),
});

export const postsTable = pgTable("py_forum_posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  commentCount: integer("comment_count").default(0).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  createdAt: createdAt(),
});

export const commentsTable = pgTable("py_forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  createdAt: createdAt(),
});

export const forumPostLikesTable = pgTable(
  "py_forum_post_likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const forumCommentLikesTable = pgTable(
  "py_forum_comment_likes",
  {
    commentId: integer("comment_id")
      .notNull()
      .references(() => commentsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.commentId, table.userId] })],
);

export interface StoredAnswer {
  correct: boolean;
  answer: string;
}

export const userProgressTable = pgTable("py_user_progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  answers: jsonb("answers")
    .$type<Record<string, StoredAnswer>>()
    .default(sql`'{}'::jsonb`)
    .notNull(),
  totalAttempts: integer("total_attempts").default(0).notNull(),
  correctAttempts: integer("correct_attempts").default(0).notNull(),
  totalXp: integer("total_xp").default(0).notNull(),
  weeklyXp: integer("weekly_xp").default(0).notNull(),
  leagueTier: integer("league_tier").default(1).notNull(),
  boardId: text("board_id").default("bronce-initial-b1").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export const insertAchievementSchema = createInsertSchema(achievementsTable);
export const insertCreatedExerciseSchema = createInsertSchema(
  createdExercisesTable,
).omit({ id: true });
export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
export const insertCommentSchema = createInsertSchema(commentsTable).omit({
  id: true,
});
export const insertUserProgressSchema = createInsertSchema(userProgressTable);

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type Achievement = typeof achievementsTable.$inferSelect;
export type InsertAchievement = typeof achievementsTable.$inferInsert;
export type CreatedExercise = typeof createdExercisesTable.$inferSelect;
export type InsertCreatedExercise = typeof createdExercisesTable.$inferInsert;
export type Post = typeof postsTable.$inferSelect;
export type InsertPost = typeof postsTable.$inferInsert;
export type Comment = typeof commentsTable.$inferSelect;
export type InsertComment = typeof commentsTable.$inferInsert;
export type UserProgress = typeof userProgressTable.$inferSelect;
export type InsertUserProgress = typeof userProgressTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  achievements: many(achievementsTable),
  createdExercises: many(createdExercisesTable),
  posts: many(postsTable),
  comments: many(commentsTable),
  postLikes: many(forumPostLikesTable),
  commentLikes: many(forumCommentLikesTable),
  progress: one(userProgressTable, {
    fields: [usersTable.id],
    references: [userProgressTable.userId],
  }),
}));

export const achievementsRelations = relations(
  achievementsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [achievementsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const createdExercisesRelations = relations(
  createdExercisesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [createdExercisesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
  comments: many(commentsTable),
  likes: many(forumPostLikesTable),
}));

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
  likes: many(forumCommentLikesTable),
}));

export const userProgressRelations = relations(userProgressTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userProgressTable.userId],
    references: [usersTable.id],
  }),
}));
