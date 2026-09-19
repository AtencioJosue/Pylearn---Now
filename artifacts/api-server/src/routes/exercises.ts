import { Router, type IRouter } from "express";
import {
  CheckAnswerBody,
  CheckAnswerResponse,
  GetExerciseResponse,
  GetExercisesResponse,
  GetGamificationStatusQueryParams,
  GetGamificationStatusResponse,
  GetProgressQueryParams,
  GetProgressResponse,
} from "@workspace/api-zod";
import { getXPProgress, runWeeklyLeagueResolution } from "../gamification";
import { localDB, type UserProgress } from "../local_db";
import { pool } from "../database";
import {
  areAnswersEquivalent,
  areUnorderedAnswersEquivalent,
  countAnswerBlanks,
} from "../modules/exercises/answer-validation";
import { exercises } from "../modules/exercises/catalog";
import { assertValidExerciseCatalog } from "../modules/exercises/catalog-validation";
import { createAnswerProgressUpdate } from "../modules/exercises/progress-update";
import {
  getRemoteUserProgress,
  updateRemoteUserProgress,
} from "../modules/exercises/remote-progress";
import { getOrCreateUserProgress } from "../modules/exercises/user-progress";

export { exercises };

const router: IRouter = Router();

assertValidExerciseCatalog(exercises);

type AnswerInput = ReturnType<typeof CheckAnswerBody.parse>;

function applyAnswer(
  exercise: (typeof exercises)[number],
  body: AnswerInput,
  progress: UserProgress,
) {
  const blankCount =
    exercise.type === "fill_blank"
      ? countAnswerBlanks(exercise.question)
      : undefined;
  const possibleAnswers = [
    exercise.correctAnswer,
    ...(exercise.acceptedAnswers ?? []),
  ];
  const correct = possibleAnswers.some((possibleAnswer) =>
    exercise.type === "multiple_select"
      ? areUnorderedAnswersEquivalent(body.answer, possibleAnswer)
      : areAnswersEquivalent(body.answer, possibleAnswer, { blankCount }),
  );
  const previousAnswer = progress.answers[String(exercise.id)];
  const progressUpdate = createAnswerProgressUpdate({
    answer: body.answer,
    correct,
    wasPreviouslyCorrect: previousAnswer?.correct === true,
    baseXp: exercise.xp ?? 10,
    doubleOrNothing: body.doubleOrNothing,
  });

  progress.answers[String(exercise.id)] = progressUpdate.storedAnswer;
  progress.totalAttempts += 1;

  if (correct) {
    progress.correctAttempts += 1;
    progress.gamification.totalXp += progressUpdate.xpEarned;
    progress.gamification.weeklyXp += progressUpdate.xpEarned;
  }

  return CheckAnswerResponse.parse({
    correct,
    feedback: correct
      ? "¡Correcto! Muy bien hecho."
      : "No exactamente. Intenta de nuevo o revisa la explicación.",
    correctAnswer: exercise.correctAnswer,
    xpEarned: progressUpdate.xpEarned,
    alreadyCompleted: progressUpdate.alreadyCompleted,
  });
}

export function buildProgressResponse(progress: UserProgress) {
  const topicProgress: Record<string, number> = {};
  const reviewExerciseIds: number[] = [];
  let completedExercises = 0;

  for (const exercise of exercises) {
    if (progress.answers[String(exercise.id)]?.correct) {
      completedExercises += 1;
      topicProgress[exercise.topic] = (topicProgress[exercise.topic] ?? 0) + 1;
    } else if (progress.answers[String(exercise.id)]) {
      reviewExerciseIds.push(exercise.id);
    }
  }

  return GetProgressResponse.parse({
    totalExercises: exercises.length,
    completedExercises,
    correctAnswers: progress.correctAttempts,
    topicProgress,
    totalAttempts: progress.totalAttempts,
    reviewExerciseIds,
  });
}

function buildGamificationResponse(progress: UserProgress) {
  const gamification = progress.gamification;
  const xpProgress = getXPProgress(gamification.totalXp);
  return GetGamificationStatusResponse.parse({
    totalXp: gamification.totalXp,
    weeklyXp: gamification.weeklyXp,
    leagueTier: gamification.leagueTier,
    boardId: gamification.boardId,
    currentLevel: xpProgress.currentLevel,
    xpInCurrentLevel: xpProgress.xpInCurrentLevel,
    xpNeededForNextLevel: xpProgress.xpNeededForNextLevel,
    percentage: xpProgress.percentage,
  });
}

router.get("/exercises", (_req, res) => {
  const data = GetExercisesResponse.parse(
    exercises.map(
      ({
        correctAnswer: _correctAnswer,
        acceptedAnswers: _acceptedAnswers,
        ...exercise
      }) => exercise,
    ),
  );
  res.json(data);
});

router.get("/exercises/:id", (req, res) => {
  const id = Number.parseInt(req.params.id ?? "", 10);
  const exercise = exercises.find((item) => item.id === id);
  if (!exercise) {
    res.status(404).json({ message: "Exercise not found" });
    return;
  }

  const {
    correctAnswer: _correctAnswer,
    acceptedAnswers: _acceptedAnswers,
    ...exerciseData
  } = exercise;
  res.json(GetExerciseResponse.parse(exerciseData));
});

router.post("/exercises/:id/check", async (req, res) => {
  const id = Number.parseInt(req.params.id ?? "", 10);
  const exercise = exercises.find((item) => item.id === id);
  if (!exercise) {
    res.status(404).json({ message: "Exercise not found" });
    return;
  }

  const parsedBody = CheckAnswerBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ message: "Invalid answer submission" });
    return;
  }
  const body = parsedBody.data;

  if (pool) {
    try {
      const data = await updateRemoteUserProgress(
        pool,
        body.userId,
        (progress) => applyAnswer(exercise, body, progress),
      );
      if (!data) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      console.error("Error saving remote exercise progress:", error);
      res.status(500).json({ message: "Could not save exercise progress" });
    }
    return;
  }

  const db = localDB.get();
  if (!db.users[body.userId]) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { progress } = getOrCreateUserProgress(db, body.userId);
  const data = applyAnswer(exercise, body, progress);
  localDB.save(db);
  res.json(data);
});

router.get("/progress", async (req, res) => {
  if (typeof req.query.userId !== "string" || !req.query.userId.trim()) {
    res.status(400).json({ message: "userId is required" });
    return;
  }
  const parsedQuery = GetProgressQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ message: "userId is required" });
    return;
  }
  const { userId } = parsedQuery.data;

  if (pool) {
    try {
      const progress = await getRemoteUserProgress(pool, userId);
      if (!progress) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(buildProgressResponse(progress));
    } catch (error) {
      console.error("Error loading remote exercise progress:", error);
      res.status(500).json({ message: "Could not load exercise progress" });
    }
    return;
  }

  const db = localDB.get();
  if (!db.users[userId]) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const lookup = getOrCreateUserProgress(db, userId);
  if (lookup.created) localDB.save(db);
  res.json(buildProgressResponse(lookup.progress));
});

router.get("/gamification/status", async (req, res) => {
  if (typeof req.query.userId !== "string" || !req.query.userId.trim()) {
    res.status(400).json({ message: "userId is required" });
    return;
  }
  const parsedQuery = GetGamificationStatusQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ message: "userId is required" });
    return;
  }
  const { userId } = parsedQuery.data;

  if (pool) {
    try {
      const progress = await getRemoteUserProgress(pool, userId);
      if (!progress) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(buildGamificationResponse(progress));
    } catch (error) {
      console.error("Error loading remote gamification:", error);
      res.status(500).json({ message: "Could not load gamification" });
    }
    return;
  }

  const db = localDB.get();
  if (!db.users[userId]) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const lookup = getOrCreateUserProgress(db, userId);
  if (lookup.created) localDB.save(db);
  res.json(buildGamificationResponse(lookup.progress));
});

router.post("/gamification/admin/resolve-leagues", async (req, res) => {
  const currentWeek = req.body?.currentWeek ?? "2026-W19";
  const nextWeek = req.body?.nextWeek ?? "2026-W20";

  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE py_user_progress
         SET league_tier = LEAST(league_tier + 1, 6),
             weekly_xp = 0,
             board_id = 'tier-' || LEAST(league_tier + 1, 6) || '-' || $1 || '-b1',
             updated_at = NOW()`,
        [nextWeek],
      );
      res.json({
        success: true,
        message: "Ligas resueltas exitosamente.",
        usersProcessed: result.rowCount ?? 0,
      });
    } catch (error) {
      console.error("Error resolving remote leagues:", error);
      res.status(500).json({ message: "Could not resolve leagues" });
    }
    return;
  }

  runWeeklyLeagueResolution(currentWeek, nextWeek);

  res.json({ success: true, message: "Ligas resueltas exitosamente." });
});

export default router;
