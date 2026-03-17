import { Router, type IRouter } from "express";
import {
  GetExercisesResponse,
  GetExerciseResponse,
  CheckAnswerBody,
  CheckAnswerResponse,
  GetProgressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type Difficulty = "beginner" | "intermediate" | "advanced" | "tryhard";
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

  // ─── INTERMEDIO ────────────────────────────────────────────────────────────
  {
    id: 19,
    title: "Comprensión de listas",
    description: "Las comprensiones de lista permiten crear listas de forma concisa en una sola línea, combinando un bucle y una condición opcional.",
    topic: "Intermedio",
    difficulty: "intermediate",
    type: "predict_output",
    question: `numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pares = [n for n in numeros if n % 2 == 0]
print(pares)`,
    hint: "La condición `if n % 2 == 0` filtra solo los números divisibles entre 2.",
    explanation: "La comprensión `[n for n in numeros if n % 2 == 0]` recorre cada número y lo incluye solo si es par. El resultado es la lista [2, 4, 6, 8, 10].",
    correctAnswer: "[2, 4, 6, 8, 10]",
    orderIndex: 19,
  },
  {
    id: 20,
    title: "Manejo de errores con try/except",
    description: "Python usa try/except para manejar errores de forma controlada, evitando que el programa se detenga abruptamente ante situaciones inesperadas.",
    topic: "Intermedio",
    difficulty: "intermediate",
    type: "fill_blank",
    question: `try:
    resultado = int("hola")
___ ValueError:
    print("Error: no es un número válido")`,
    hint: "La palabra clave que 'atrapa' un tipo de error específico en Python.",
    explanation: "La palabra `except` captura el error especificado (ValueError). Si int('hola') falla, el bloque except se ejecuta en lugar de detener el programa.",
    correctAnswer: "except",
    orderIndex: 20,
  },
  {
    id: 21,
    title: "Funciones con *args",
    description: "*args permite que una función acepte un número variable de argumentos posicionales. Todos los valores llegan como una tupla dentro de la función.",
    topic: "Intermedio",
    difficulty: "intermediate",
    type: "predict_output",
    question: `def sumar(*numeros):
    return sum(numeros)

print(sumar(2, 3, 5, 10))`,
    hint: "Suma todos los argumentos pasados: 2 + 3 + 5 + 10.",
    explanation: "*numeros recibe todos los argumentos como la tupla (2, 3, 5, 10). sum() los suma todos y devuelve 20.",
    correctAnswer: "20",
    orderIndex: 21,
  },

  // ─── DIFÍCIL ───────────────────────────────────────────────────────────────
  {
    id: 22,
    title: "Recursión: Secuencia de Fibonacci",
    description: "Una función recursiva se llama a sí misma. La secuencia de Fibonacci es el ejemplo clásico: cada número es la suma de los dos anteriores (0, 1, 1, 2, 3, 5, 8, 13...)",
    topic: "Difícil",
    difficulty: "advanced",
    type: "predict_output",
    question: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(7))`,
    hint: "La secuencia empieza: 0, 1, 1, 2, 3, 5, 8, 13... Cuenta desde la posición 0.",
    explanation: "fibonacci(7) calcula la posición 7 de la secuencia (0-indexado): 0,1,1,2,3,5,8,13. La posición 7 es 13. Cada llamada se descompone en dos más pequeñas hasta llegar al caso base (n<=1).",
    correctAnswer: "13",
    orderIndex: 22,
  },
  {
    id: 23,
    title: "Decoradores en Python",
    description: "Un decorador es una función que envuelve otra función para extender su comportamiento sin modificarla directamente. Se aplica con la sintaxis @nombre_decorador.",
    topic: "Difícil",
    difficulty: "advanced",
    type: "predict_output",
    question: `def mayusculas(func):
    def wrapper(*args):
        return func(*args).upper()
    return wrapper

@mayusculas
def saludar(nombre):
    return f"hola {nombre}"

print(saludar("mundo"))`,
    hint: "El decorador @mayusculas envuelve saludar() y convierte su resultado a mayúsculas.",
    explanation: "Cuando llamas saludar('mundo'), en realidad se ejecuta wrapper('mundo'), que llama a la función original obteniendo 'hola mundo' y luego aplica .upper(), devolviendo 'HOLA MUNDO'.",
    correctAnswer: "HOLA MUNDO",
    orderIndex: 23,
  },
  {
    id: 24,
    title: "Herencia en Programación Orientada a Objetos",
    description: "La herencia permite que una clase (hija) tome atributos y métodos de otra clase (padre). Esto promueve la reutilización de código y modela relaciones del mundo real.",
    topic: "Difícil",
    difficulty: "advanced",
    type: "fill_blank",
    question: `class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

class Perro(___):   # ¿De qué clase hereda Perro?
    def hablar(self):
        return f"{self.nombre} dice: ¡Guau!"

p = Perro("Rex")
print(p.hablar())`,
    hint: "Para heredar de una clase se escribe su nombre entre paréntesis al definir la nueva clase.",
    explanation: "Al poner `Animal` entre paréntesis en `class Perro(Animal)`, Perro hereda el método __init__ de Animal. Por eso puede acceder a self.nombre sin definirlo de nuevo.",
    correctAnswer: "Animal",
    orderIndex: 24,
  },

  // ─── TRYHARD ───────────────────────────────────────────────────────────────
  {
    id: 25,
    title: "Proyecto: Juego del Ahorcado",
    description: "Completa el juego del ahorcado. El jugador tiene 6 vidas para adivinar una palabra letra por letra. Cuando falla, debe perder una vida. Identifica la línea crítica que falta para que el juego funcione correctamente.",
    topic: "Tryhard",
    difficulty: "tryhard",
    type: "fill_blank",
    question: `import random

PALABRAS = ["python", "programacion", "computadora", "algoritmo"]

def mostrar_estado(palabra, letras_usadas, vidas):
    oculta = " ".join([l if l in letras_usadas else "_" for l in palabra])
    print(f"Palabra: {oculta}")
    print(f"Letras usadas: {', '.join(sorted(letras_usadas)) or '-'}")
    print(f"Vidas: {'❤️ ' * vidas}")

def jugar():
    palabra = random.choice(PALABRAS)
    letras_usadas = set()
    vidas = 6

    while vidas > 0:
        mostrar_estado(palabra, letras_usadas, vidas)
        if all(l in letras_usadas for l in palabra):
            print("¡Ganaste!")
            return

        letra = input("Ingresa una letra: ").lower().strip()
        if not letra.isalpha() or len(letra) != 1:
            print("Solo una letra a la vez.")
            continue
        if letra in letras_usadas:
            print("Ya usaste esa letra.")
            continue

        letras_usadas.add(letra)
        if letra in palabra:
            print("✅ ¡Correcto!")
        else:
            ___  # Resta una vida cuando la letra no está en la palabra
            print("❌ ¡Incorrecto!")

    print(f"Perdiste. La palabra era: {palabra}")

jugar()`,
    hint: "Necesitas modificar la variable `vidas` usando el operador de asignación compuesta para restar 1.",
    explanation: "La línea `vidas -= 1` es el corazón del sistema de vidas. Sin ella, el jugador nunca pierde vidas aunque falle, haciendo el juego imposible de perder. El operador -= es equivalente a escribir `vidas = vidas - 1`.",
    correctAnswer: "vidas -= 1",
    orderIndex: 25,
  },
  {
    id: 26,
    title: "Proyecto: Detector de Rostros con Cámara",
    description: "Este programa usa OpenCV para capturar video de la cámara y detectar rostros en tiempo real usando clasificadores Haar pre-entrenados. Identifica el método correcto de la API de OpenCV que realiza la detección. (Requiere: pip install opencv-python y una cámara conectada)",
    topic: "Tryhard",
    difficulty: "tryhard",
    type: "fill_blank",
    question: `import cv2

# Clasificador pre-entrenado para detectar rostros frontales
detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

camara = cv2.VideoCapture(0)  # 0 = cámara principal del dispositivo
print("Presiona 'q' para salir")

while True:
    ret, frame = camara.read()
    if not ret:
        break

    # El detector necesita la imagen en escala de grises
    gris = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detectar rostros: scaleFactor reduce la imagen en cada paso,
    # minNeighbors evita falsos positivos
    rostros = detector.___(
        gris,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    # Dibujar un rectángulo verde alrededor de cada rostro
    for (x, y, w, h) in rostros:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, "Rostro", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    cv2.putText(frame, f"Rostros detectados: {len(rostros)}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
    cv2.imshow("Detector de Rostros - PyLearn", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camara.release()
cv2.destroyAllWindows()`,
    hint: "El método de los CascadeClassifiers que 'escanea' la imagen a múltiples escalas para encontrar objetos se llama 'detectar a múltiples escalas' en inglés.",
    explanation: "detectMultiScale() es el método central de OpenCV para detección de objetos. Analiza la imagen a diferentes tamaños (escalas) para encontrar rostros sin importar qué tan lejos o cerca estén de la cámara. Devuelve una lista de rectángulos (x, y, w, h) para cada rostro encontrado.",
    correctAnswer: "detectMultiScale",
    orderIndex: 26,
  },
  {
    id: 27,
    title: "Proyecto: Red Neuronal desde Cero con NumPy",
    description: "Implementa una red neuronal de dos capas desde cero usando solo NumPy para resolver el problema XOR (que no se puede resolver con regresión lineal). El reto está en el algoritmo de retropropagación (backpropagation), que propaga el error hacia atrás para ajustar los pesos. Identifica la variable que falta en el cálculo del error de la capa oculta. (Requiere: pip install numpy)",
    topic: "Tryhard",
    difficulty: "tryhard",
    type: "fill_blank",
    question: `import numpy as np

def sigmoide(x):
    return 1 / (1 + np.exp(-x))

def sigmoide_prima(x):
    return x * (1 - x)

class RedNeuronal:
    def __init__(self, entradas, ocultas, salidas):
        np.random.seed(42)
        self.pesos1 = np.random.randn(entradas, ocultas) * 0.1  # capa oculta
        self.pesos2 = np.random.randn(ocultas, salidas) * 0.1   # capa salida

    def adelante(self, X):
        self.capa1 = sigmoide(np.dot(X, self.pesos1))
        self.salida = sigmoide(np.dot(self.capa1, self.pesos2))
        return self.salida

    def retropropagar(self, X, y, tasa=0.5):
        # 1. Error en la capa de salida
        error_salida = y - self.salida
        delta_salida = error_salida * sigmoide_prima(self.salida)

        # 2. Propagar el error hacia atrás a la capa oculta
        #    El error oculto depende de los pesos que conectan
        #    la capa oculta con la capa de salida
        error_oculto = np.dot(delta_salida, ___.T)
        delta_oculto = error_oculto * sigmoide_prima(self.capa1)

        # 3. Actualizar pesos con gradiente descendente
        self.pesos2 += tasa * np.dot(self.capa1.T, delta_salida)
        self.pesos1 += tasa * np.dot(X.T, delta_oculto)

# Problema XOR: salida = 1 solo cuando exactamente una entrada es 1
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([[0],    [1],    [1],    [0]])

red = RedNeuronal(entradas=2, ocultas=4, salidas=1)

for epoca in range(10000):
    salida = red.adelante(X)
    red.retropropagar(X, y)
    if epoca % 2500 == 0:
        error = np.mean(np.abs(y - salida))
        print(f"Época {epoca:5d}: Error = {error:.4f}")

print("\\nPredicciones XOR finales:")
for entrada, objetivo in zip(X, y):
    pred = red.adelante(entrada.reshape(1, -1))
    print(f"  {entrada} → {pred[0][0]:.3f}  (esperado: {objetivo[0]})")`,
    hint: "En la retropropagación, el error de la capa oculta se calcula multiplicando el delta de salida por la TRANSPUESTA de los pesos que conectan la capa oculta con la salida.",
    explanation: "La línea usa `self.pesos2` porque esos son los pesos que conectan la capa oculta con la capa de salida. Al multiplicar `delta_salida` por la transpuesta de `self.pesos2`, distribuimos el error de salida hacia cada neurona oculta proporcionalmente a cuánto contribuyó. Este es el núcleo del algoritmo backpropagation inventado en los años 80.",
    correctAnswer: "self.pesos2",
    orderIndex: 27,
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
