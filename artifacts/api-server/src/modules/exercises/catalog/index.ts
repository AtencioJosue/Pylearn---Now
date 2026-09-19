import { topicExercises as group1 } from "./01-variables";
import { topicExercises as group2 } from "./02-strings";
import { topicExercises as group3 } from "./03-listas";
import { topicExercises as group4 } from "./04-bucles";
import { topicExercises as group5 } from "./05-funciones";
import { topicExercises as group6 } from "./06-diccionarios";
import { topicExercises as group7 } from "./07-intermedio";
import { topicExercises as group8 } from "./08-dificil";
import { topicExercises as group9 } from "./09-tryhard";
import { topicExercises as group10 } from "./10-variables-basicas-mision-1";
import { topicExercises as group11 } from "./11-variables-basicas-mision-2";
import { topicExercises as group12 } from "./12-strings-basicas-mision-1";
import { topicExercises as group13 } from "./13-strings-basicas-mision-2";
import { topicExercises as group14 } from "./14-listas-basicas-mision-1";
import { topicExercises as group15 } from "./15-listas-basicas-mision-2";
import { topicExercises as group16 } from "./16-bucles-basicas-mision-1";
import { topicExercises as group17 } from "./17-bucles-basicas-mision-2";
import { topicExercises as group18 } from "./18-funciones-basicas-mision-1";
import { topicExercises as group19 } from "./19-funciones-basicas-mision-2";
import { topicExercises as group20 } from "./20-diccionarios-basicas-mision-1";
import { topicExercises as group21 } from "./21-diccionarios-basicas-mision-2";
import { academyExpansion } from "./22-academia-expandida";
import type { ExerciseData } from "../types";

export const exercises: ExerciseData[] = [
  ...group1,
  ...group2,
  ...group3,
  ...group4,
  ...group5,
  ...group6,
  ...group7,
  ...group8,
  ...group9,
  ...group10,
  ...group11,
  ...group12,
  ...group13,
  ...group14,
  ...group15,
  ...group16,
  ...group17,
  ...group18,
  ...group19,
  ...group20,
  ...group21,
  ...academyExpansion,
].sort((a, b) => a.id - b.id);
