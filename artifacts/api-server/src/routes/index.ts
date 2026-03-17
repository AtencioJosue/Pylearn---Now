import { Router, type IRouter } from "express";
import healthRouter from "./health";
import exercisesRouter from "./exercises";
import usersRouter from "./users";
import forumRouter from "./forum";
import createdExercisesRouter from "./created-exercises";

const router: IRouter = Router();

router.use(healthRouter);
router.use(exercisesRouter);
router.use("/users", usersRouter);
router.use("/forum", forumRouter);
router.use("/created-exercises", createdExercisesRouter);

export default router;
