import { Router, type IRouter } from "express";
import {
  GetExercisesResponse,
  GetExerciseResponse,
  CheckAnswerBody,
  CheckAnswerResponse,
  GetProgressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type Difficulty = "beginner" | "intermediate" | "advanced";
type ExerciseType = "multiple_choice" | "fill_blank" | "predict_output";

interface ExerciseData {
  id: number;
  title: string;
  description: string;
  topic: string;
  difficulty: Difficulty;
  type: ExerciseType;
  question: string;
  options?: string[];
  hint?: string;
  explanation: string;
  correctAnswer: string;
  orderIndex: number;
}

const exercises: ExerciseData[] = [
  // --- VARIABLES ---
  {
    id: 1,
    title: "Asignación de variables",
    description: "Aprende a asignar valores a variables en Python.",
    topic: "Variables",
    difficulty: "beginner",
    type: "multiple_choice",
    question: "¿Cuál es la forma correcta de asignar el valor 10 a una variable llamada 'x' en Python?",
    options: ["x == 10", "x = 10", "int x = 10", "var x = 10"],
    hint: "En Python no se necesita declarar el tipo de la variable.",
    explanation: "En Python se usa el signo '=' para asignar valores. No necesitas declarar el tipo como en otros lenguajes.",
    correctAnswer: "x = 10",
    orderIndex: 1,
  },
  {
    id: 2,
    title: "Predice el output",
    description: "Observa cómo Python imprime variables.",
    topic: "Variables",
    difficulty: "beginner",
    type: "predict_output",
    question: `x = 5
y = 3
print(x + y)`,
    hint: "Suma los dos números.",
    explanation: "x vale 5 e y vale 3. Al sumarlos obtenemos 8, que es lo que imprime print().",
    correctAnswer: "8",
    orderIndex: 2,
  },
  {
    id: 3,
    title: "Completa el código",
    description: "Crea una variable con tu nombre.",
    topic: "Variables",
    difficulty: "beginner",
    type: "fill_blank",
    question: "Completa para que la variable 'nombre' tenga el valor 'Ana':\nnombre ___ 'Ana'",
    hint: "Usa el operador de asignación.",
    explanation: "El operador = asigna el valor 'Ana' a la variable nombre.",
    correctAnswer: "=",
    orderIndex: 3,
  },
  // --- STRINGS ---
  {
    id: 4,
    title: "Concatenación de strings",
    description: "Une dos cadenas de texto.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `saludo = "Hola"
nombre = "Mundo"
print(saludo + " " + nombre)`,
    hint: "El operador + une cadenas de texto.",
    explanation: "Al usar + con strings, Python los une (concatena). El resultado es 'Hola Mundo'.",
    correctAnswer: "Hola Mundo",
    orderIndex: 4,
  },
  {
    id: 5,
    title: "Longitud de un string",
    description: "Usa la función len() para medir texto.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `texto = "Python"
print(len(texto))`,
    hint: "Cuenta las letras de la palabra.",
    explanation: "len() devuelve la cantidad de caracteres. 'Python' tiene 6 letras.",
    correctAnswer: "6",
    orderIndex: 5,
  },
  {
    id: 6,
    title: "Método upper()",
    description: "Convierte texto a mayúsculas.",
    topic: "Strings",
    difficulty: "beginner",
    type: "multiple_choice",
    question: "¿Qué imprime el siguiente código?\ntexto = 'hola'\nprint(texto.upper())",
    options: ["hola", "HOLA", "Hola", "Error"],
    hint: "upper() convierte a mayúsculas.",
    explanation: "El método .upper() convierte todos los caracteres a mayúsculas. 'hola' se convierte en 'HOLA'.",
    correctAnswer: "HOLA",
    orderIndex: 6,
  },
  // --- LISTAS ---
  {
    id: 7,
    title: "Crear una lista",
    description: "Las listas almacenan múltiples valores.",
    topic: "Listas",
    difficulty: "beginner",
    type: "multiple_choice",
    question: "¿Cuál es la sintaxis correcta para crear una lista con los números 1, 2 y 3?",
    options: ["lista = (1, 2, 3)", "lista = [1, 2, 3]", "lista = {1, 2, 3}", "lista = 1, 2, 3"],
    hint: "Las listas usan corchetes [ ].",
    explanation: "En Python, las listas se crean con corchetes []. Los paréntesis () crean tuplas y las llaves {} crean conjuntos o diccionarios.",
    correctAnswer: "lista = [1, 2, 3]",
    orderIndex: 7,
  },
  {
    id: 8,
    title: "Acceso a elementos",
    description: "Accede a elementos de una lista por su índice.",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `frutas = ["manzana", "banana", "cereza"]
print(frutas[1])`,
    hint: "Los índices en Python empiezan en 0.",
    explanation: "El índice 0 es 'manzana', el índice 1 es 'banana', el índice 2 es 'cereza'. Por eso frutas[1] imprime 'banana'.",
    correctAnswer: "banana",
    orderIndex: 8,
  },
  {
    id: 9,
    title: "Método append()",
    description: "Agrega elementos al final de una lista.",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `numeros = [1, 2, 3]
numeros.append(4)
print(numeros)`,
    hint: "append() añade al final.",
    explanation: "append(4) añade el número 4 al final de la lista. La lista pasa de [1, 2, 3] a [1, 2, 3, 4].",
    correctAnswer: "[1, 2, 3, 4]",
    orderIndex: 9,
  },
  // --- BUCLES ---
  {
    id: 10,
    title: "Bucle for básico",
    description: "Itera sobre una lista con for.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `for i in range(3):
    print(i)`,
    hint: "range(3) genera los números 0, 1, 2.",
    explanation: "range(3) genera los números 0, 1 y 2 (no incluye el 3). El bucle imprime cada uno en una línea separada.",
    correctAnswer: "0\n1\n2",
    orderIndex: 10,
  },
  {
    id: 11,
    title: "Suma con bucle",
    description: "Acumula valores con un bucle.",
    topic: "Bucles",
    difficulty: "intermediate",
    type: "predict_output",
    question: `total = 0
for n in [1, 2, 3, 4]:
    total += n
print(total)`,
    hint: "+= suma y asigna al mismo tiempo.",
    explanation: "El bucle suma 1+2+3+4 = 10. total empieza en 0 y se le va agregando cada número.",
    correctAnswer: "10",
    orderIndex: 11,
  },
  {
    id: 12,
    title: "Bucle while",
    description: "Ejecuta código mientras una condición sea verdadera.",
    topic: "Bucles",
    difficulty: "intermediate",
    type: "predict_output",
    question: `x = 1
while x < 4:
    print(x)
    x += 1`,
    hint: "x empieza en 1 y se incrementa hasta que ya no sea menor que 4.",
    explanation: "El bucle imprime 1, 2, 3. Cuando x llega a 4, la condición x < 4 es falsa y el bucle termina.",
    correctAnswer: "1\n2\n3",
    orderIndex: 12,
  },
  // --- FUNCIONES ---
  {
    id: 13,
    title: "Definir una función",
    description: "Aprende a crear funciones en Python.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "multiple_choice",
    question: "¿Cuál es la palabra clave para definir una función en Python?",
    options: ["function", "func", "def", "define"],
    hint: "Es una abreviación de 'define'.",
    explanation: "En Python se usa 'def' para definir funciones. Por ejemplo: def mi_funcion():",
    correctAnswer: "def",
    orderIndex: 13,
  },
  {
    id: 14,
    title: "Función con return",
    description: "Las funciones pueden devolver valores.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "predict_output",
    question: `def doble(x):
    return x * 2

print(doble(5))`,
    hint: "La función multiplica su argumento por 2.",
    explanation: "doble(5) devuelve 5 * 2 = 10. La instrucción return envía ese valor de vuelta y print lo muestra.",
    correctAnswer: "10",
    orderIndex: 14,
  },
  {
    id: 15,
    title: "Función con múltiples parámetros",
    description: "Las funciones pueden recibir más de un argumento.",
    topic: "Funciones",
    difficulty: "intermediate",
    type: "predict_output",
    question: `def suma(a, b):
    return a + b

resultado = suma(3, 7)
print(resultado)`,
    hint: "La función recibe dos números y los suma.",
    explanation: "suma(3, 7) devuelve 3 + 7 = 10. Este valor se guarda en 'resultado' y luego se imprime.",
    correctAnswer: "10",
    orderIndex: 15,
  },
  // --- DICCIONARIOS ---
  {
    id: 16,
    title: "Crear un diccionario",
    description: "Los diccionarios guardan pares clave-valor.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "multiple_choice",
    question: "¿Cuál es la forma correcta de crear un diccionario en Python?",
    options: [
      'persona = ["nombre": "Ana", "edad": 25]',
      'persona = ("nombre": "Ana", "edad": 25)',
      'persona = {"nombre": "Ana", "edad": 25}',
      'persona = <nombre: "Ana", edad: 25>',
    ],
    hint: "Los diccionarios usan llaves { } con pares clave: valor.",
    explanation: "Los diccionarios en Python usan llaves {}. Cada par se escribe como clave: valor, separados por comas.",
    correctAnswer: 'persona = {"nombre": "Ana", "edad": 25}',
    orderIndex: 16,
  },
  {
    id: 17,
    title: "Acceso a valores",
    description: "Accede a un valor usando su clave.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `persona = {"nombre": "Carlos", "edad": 30}
print(persona["nombre"])`,
    hint: "Usa la clave entre corchetes para obtener el valor.",
    explanation: "Se accede a los valores del diccionario usando su clave entre corchetes. persona['nombre'] devuelve 'Carlos'.",
    correctAnswer: "Carlos",
    orderIndex: 17,
  },
  {
    id: 18,
    title: "Agregar claves",
    description: "Añade nuevos pares al diccionario.",
    topic: "Diccionarios",
    difficulty: "intermediate",
    type: "predict_output",
    question: `info = {"pais": "Mexico"}
info["ciudad"] = "CDMX"
print(len(info))`,
    hint: "len() cuenta cuántas claves tiene el diccionario.",
    explanation: "Empezamos con 1 clave ('pais') y agregamos otra ('ciudad'). Ahora el diccionario tiene 2 claves, por eso len() devuelve 2.",
    correctAnswer: "2",
    orderIndex: 18,
  },
];

// Track answers in memory (simple, session-based)
const userAnswers: Map<number, { correct: boolean; answer: string }> = new Map();

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

router.get("/exercises", (_req, res) => {
  const data = GetExercisesResponse.parse(
    exercises.map(({ correctAnswer: _c, ...ex }) => ex)
  );
  res.json(data);
});

router.get("/exercises/:id", (req, res) => {
  const id = parseInt(req.params.id ?? "");
  const exercise = exercises.find((e) => e.id === id);
  if (!exercise) {
    res.status(404).json({ message: "Exercise not found" });
    return;
  }
  const { correctAnswer: _c, ...exData } = exercise;
  const data = GetExerciseResponse.parse(exData);
  res.json(data);
});

router.post("/exercises/:id/check", (req, res) => {
  const id = parseInt(req.params.id ?? "");
  const exercise = exercises.find((e) => e.id === id);
  if (!exercise) {
    res.status(404).json({ message: "Exercise not found" });
    return;
  }

  const body = CheckAnswerBody.parse(req.body);
  const userAnswer = normalizeAnswer(body.answer);
  const correct = normalizeAnswer(exercise.correctAnswer) === userAnswer;

  userAnswers.set(id, { correct, answer: body.answer });

  const data = CheckAnswerResponse.parse({
    correct,
    feedback: correct
      ? "¡Correcto! Muy bien hecho."
      : `No exactamente. Intenta de nuevo o revisa la explicación.`,
    correctAnswer: exercise.correctAnswer,
  });
  res.json(data);
});

router.get("/progress", (_req, res) => {
  const topicProgress: Record<string, number> = {};

  for (const exercise of exercises) {
    const answer = userAnswers.get(exercise.id);
    if (answer?.correct) {
      topicProgress[exercise.topic] = (topicProgress[exercise.topic] ?? 0) + 1;
    }
  }

  const data = GetProgressResponse.parse({
    totalExercises: exercises.length,
    completedExercises: userAnswers.size,
    correctAnswers: [...userAnswers.values()].filter((a) => a.correct).length,
    topicProgress,
  });
  res.json(data);
});

export default router;
