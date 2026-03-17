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

  // ═══════════════════════════════════════════════════════════════
  // VARIABLES — ejercicios adicionales (IDs 28-34)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 28,
    title: "Asignación múltiple",
    description: "Python permite asignar varios valores a varias variables en una sola línea, lo que hace el código más compacto y legible.",
    topic: "Variables",
    difficulty: "beginner",
    type: "predict_output",
    question: `a, b, c = 1, 2, 3
print(a + b + c)`,
    hint: "Suma los tres valores: a vale 1, b vale 2 y c vale 3.",
    explanation: "La asignación múltiple `a, b, c = 1, 2, 3` asigna 1 a a, 2 a b y 3 a c en una sola línea. Luego print(1 + 2 + 3) imprime 6.",
    correctAnswer: "6",
    orderIndex: 28,
  },
  {
    id: 29,
    title: "Tipo de dato con type()",
    description: "La función type() te dice qué tipo de dato tiene una variable: int, str, float, bool, etc.",
    topic: "Variables",
    difficulty: "beginner",
    type: "multiple_choice",
    question: `x = 3.14
print(type(x))`,
    options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'number'>"],
    hint: "3.14 tiene punto decimal, ¿qué tipo de número es ese en Python?",
    explanation: "3.14 es un número con decimales, que en Python se llama float (punto flotante). Por eso type(3.14) devuelve <class 'float'>.",
    correctAnswer: "<class 'float'>",
    orderIndex: 29,
  },
  {
    id: 30,
    title: "Operadores de asignación compuesta",
    description: "Los operadores como += y -= modifican una variable directamente. Son atajos muy usados en Python.",
    topic: "Variables",
    difficulty: "beginner",
    type: "predict_output",
    question: `puntos = 10
puntos += 5
puntos -= 2
print(puntos)`,
    hint: "Empieza en 10, suma 5, luego resta 2.",
    explanation: "puntos empieza en 10. Con += 5 queda en 15. Con -= 2 queda en 13. El operador += es equivalente a escribir puntos = puntos + 5.",
    correctAnswer: "13",
    orderIndex: 30,
  },
  {
    id: 31,
    title: "Intercambio de variables",
    description: "Python tiene una forma elegante de intercambiar valores entre dos variables sin necesitar una variable temporal.",
    topic: "Variables",
    difficulty: "beginner",
    type: "predict_output",
    question: `a = "hola"
b = "mundo"
a, b = b, a
print(a, b)`,
    hint: "Después del intercambio, ¿qué valor tiene cada variable?",
    explanation: "La línea `a, b = b, a` es el swap clásico de Python. Intercambia los valores: a pasa a tener 'mundo' y b pasa a tener 'hola'. print(a, b) imprime los dos valores separados por espacio.",
    correctAnswer: "mundo hola",
    orderIndex: 31,
  },
  {
    id: 32,
    title: "Variable booleana",
    description: "Las variables booleanas solo pueden tener dos valores: True o False. Son fundamentales para la lógica y las condiciones.",
    topic: "Variables",
    difficulty: "beginner",
    type: "fill_blank",
    question: `activo = ___
if activo:
    print("El usuario está activo")`,
    hint: "En Python, los valores booleanos se escriben con la primera letra en mayúscula.",
    explanation: "La variable booleana activo debe valer True para que la condición if activo: sea verdadera y se imprima el mensaje. True y False siempre van en mayúscula en Python.",
    correctAnswer: "True",
    orderIndex: 32,
  },
  {
    id: 33,
    title: "None: el valor vacío",
    description: "None es un valor especial de Python que representa 'nada' o 'sin valor'. Es diferente de 0, False o string vacío.",
    topic: "Variables",
    difficulty: "beginner",
    type: "multiple_choice",
    question: `resultado = None
print(resultado is None)`,
    options: ["True", "False", "None", "Error"],
    hint: "Compara resultado con None usando el operador 'is'. ¿Qué retorna si son iguales?",
    explanation: "resultado es None, así que `resultado is None` evalúa a True. En Python se usa 'is' para comparar con None, no '=='. El operador 'is' verifica identidad de objeto.",
    correctAnswer: "True",
    orderIndex: 33,
  },
  {
    id: 34,
    title: "Conversión de tipos",
    description: "Puedes convertir entre tipos de datos usando funciones como int(), str(), float(). Esto se llama type casting.",
    topic: "Variables",
    difficulty: "beginner",
    type: "predict_output",
    question: `texto = "42"
numero = int(texto)
resultado = numero * 2
print(resultado)`,
    hint: "Se convierte '42' (string) a entero, luego se multiplica por 2.",
    explanation: "int('42') convierte el string '42' al número entero 42. Luego 42 * 2 = 84. Sin int(), '42' * 2 hubiera dado '4242' (repetición de string).",
    correctAnswer: "84",
    orderIndex: 34,
  },

  // ═══════════════════════════════════════════════════════════════
  // STRINGS — ejercicios adicionales (IDs 35-41)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 35,
    title: "Longitud de un string",
    description: "La función len() cuenta cuántos caracteres tiene un string, incluyendo espacios.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `nombre = "Python"
print(len(nombre))`,
    hint: "Cuenta las letras: P-y-t-h-o-n",
    explanation: "len('Python') cuenta los 6 caracteres del string: P, y, t, h, o, n. Cada letra cuenta como 1 carácter.",
    correctAnswer: "6",
    orderIndex: 35,
  },
  {
    id: 36,
    title: "Slicing de strings",
    description: "El slicing permite extraer partes de un string usando la sintaxis [inicio:fin]. El índice inicio está incluido y fin está excluido.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `frase = "aprendiendo Python"
print(frase[0:10])`,
    hint: "Extrae los caracteres desde la posición 0 hasta la 9 (la 10 no se incluye).",
    explanation: "frase[0:10] extrae los caracteres en las posiciones 0 al 9 (10 no incluido). Eso da 'aprendiend'. La 'o' está en posición 10 y no se incluye.",
    correctAnswer: "aprendiend",
    orderIndex: 36,
  },
  {
    id: 37,
    title: "Método upper() y lower()",
    description: "Los strings tienen métodos para cambiar mayúsculas y minúsculas: .upper() convierte todo a mayúsculas y .lower() a minúsculas.",
    topic: "Strings",
    difficulty: "beginner",
    type: "fill_blank",
    question: `saludo = "hola mundo"
print(saludo.___())`,
    hint: "El método que convierte todo a MAYÚSCULAS se llama así en inglés.",
    explanation: "El método .upper() convierte todos los caracteres del string a mayúsculas. Entonces 'hola mundo'.upper() devuelve 'HOLA MUNDO'.",
    correctAnswer: "upper",
    orderIndex: 37,
  },
  {
    id: 38,
    title: "String replace()",
    description: "El método .replace(viejo, nuevo) reemplaza todas las ocurrencias de un substring por otro dentro del string.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `frase = "me gusta Java"
nueva = frase.replace("Java", "Python")
print(nueva)`,
    hint: "replace() busca 'Java' en el string y lo cambia por 'Python'.",
    explanation: ".replace('Java', 'Python') busca todas las ocurrencias de 'Java' en la frase y las sustituye por 'Python'. El resultado es 'me gusta Python'.",
    correctAnswer: "me gusta Python",
    orderIndex: 38,
  },
  {
    id: 39,
    title: "Separar un string con split()",
    description: "El método .split(separador) divide un string en una lista de partes usando el separador indicado.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `colores = "rojo,verde,azul"
lista = colores.split(",")
print(len(lista))`,
    hint: "Al dividir por ',' el string queda en 3 partes.",
    explanation: ".split(',') divide 'rojo,verde,azul' en ['rojo', 'verde', 'azul']. Esta lista tiene 3 elementos, por eso len(lista) devuelve 3.",
    correctAnswer: "3",
    orderIndex: 39,
  },
  {
    id: 40,
    title: "f-strings con expresiones",
    description: "Dentro de las f-strings puedes incluir no solo variables, sino también expresiones y cálculos completos.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `a = 5
b = 3
print(f"La suma de {a} y {b} es {a + b}")`,
    hint: "Calcula a + b = 5 + 3 = 8 dentro del f-string.",
    explanation: "Las f-strings evalúan las expresiones dentro de {}. {a} se reemplaza por 5, {b} por 3, y {a + b} se calcula dando 8. El resultado final es 'La suma de 5 y 3 es 8'.",
    correctAnswer: "La suma de 5 y 3 es 8",
    orderIndex: 40,
  },
  {
    id: 41,
    title: "String strip()",
    description: "El método .strip() elimina espacios (y saltos de línea) al inicio y al final de un string. Útil para limpiar datos de entrada.",
    topic: "Strings",
    difficulty: "beginner",
    type: "predict_output",
    question: `entrada = "   Python   "
limpio = entrada.strip()
print(f"[{limpio}]")`,
    hint: "strip() quita todos los espacios del inicio y del final del string.",
    explanation: ".strip() elimina los espacios en blanco al inicio y al final. '   Python   '.strip() da 'Python'. Los corchetes en el f-string ayudan a ver que no hay espacios sobrantes.",
    correctAnswer: "[Python]",
    orderIndex: 41,
  },

  // ═══════════════════════════════════════════════════════════════
  // LISTAS — ejercicios adicionales (IDs 42-48)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 42,
    title: "Acceder a elementos por índice",
    description: "Los elementos de una lista se acceden por su posición (índice), que empieza en 0. Los índices negativos cuentan desde el final.",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `frutas = ["manzana", "banana", "cereza", "durazno"]
print(frutas[-1])`,
    hint: "El índice -1 siempre apunta al último elemento de la lista.",
    explanation: "Los índices negativos cuentan desde el final: -1 es el último elemento, -2 el penúltimo, etc. frutas[-1] es 'durazno', el último elemento de la lista.",
    correctAnswer: "durazno",
    orderIndex: 42,
  },
  {
    id: 43,
    title: "Agregar con append()",
    description: "El método .append() agrega un elemento al final de la lista. Es la forma más común de añadir elementos uno por uno.",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `numeros = [1, 2, 3]
numeros.append(4)
numeros.append(5)
print(len(numeros))`,
    hint: "La lista empieza con 3 elementos y se agregan 2 más.",
    explanation: "append(4) agrega 4 al final: [1,2,3,4]. append(5) agrega 5: [1,2,3,4,5]. len() cuenta los 5 elementos y devuelve 5.",
    correctAnswer: "5",
    orderIndex: 43,
  },
  {
    id: 44,
    title: "Eliminar con remove()",
    description: "El método .remove(valor) busca y elimina la primera ocurrencia del valor en la lista. Si el valor no existe, lanza un ValueError.",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `colores = ["rojo", "verde", "azul", "verde"]
colores.remove("verde")
print(colores)`,
    hint: "remove() elimina solo la PRIMERA ocurrencia de 'verde'.",
    explanation: ".remove('verde') busca de izquierda a derecha y elimina solo la primera ocurrencia. La lista queda como ['rojo', 'azul', 'verde'] — el segundo 'verde' se mantiene.",
    correctAnswer: "['rojo', 'azul', 'verde']",
    orderIndex: 44,
  },
  {
    id: 45,
    title: "Slicing de listas",
    description: "Al igual que los strings, las listas soportan slicing para obtener sublistas. La sintaxis es lista[inicio:fin:paso].",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `numeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numeros[2:7:2])`,
    hint: "Desde la posición 2, toma elementos saltando de 2 en 2, hasta la posición 6.",
    explanation: "numeros[2:7:2] empieza en índice 2 (valor 2), salta de 2 en 2, hasta antes del índice 7. Toma los valores en posiciones 2, 4, 6 → [2, 4, 6].",
    correctAnswer: "[2, 4, 6]",
    orderIndex: 45,
  },
  {
    id: 46,
    title: "Ordenar una lista con sort()",
    description: "El método .sort() ordena la lista en su lugar (modifica la lista original). Para ordenar sin modificar la original, usa sorted().",
    topic: "Listas",
    difficulty: "beginner",
    type: "fill_blank",
    question: `numeros = [5, 2, 8, 1, 9, 3]
numeros.___()
print(numeros[0])`,
    hint: "El método que ordena la lista de menor a mayor modifica la lista original.",
    explanation: "numeros.sort() ordena la lista en su lugar: [1, 2, 3, 5, 8, 9]. Después de ordenar, numeros[0] es el elemento más pequeño, que es 1.",
    correctAnswer: "sort",
    orderIndex: 46,
  },
  {
    id: 47,
    title: "Verificar si un elemento está en la lista",
    description: "El operador 'in' verifica si un valor existe dentro de una lista. Devuelve True o False. También funciona para strings, tuplas y diccionarios.",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `paises = ["México", "Argentina", "Colombia", "Chile"]
print("Brasil" in paises)
print("Chile" in paises)`,
    hint: "Verifica si 'Brasil' y 'Chile' están en la lista de países.",
    explanation: "'Brasil' no está en la lista, así que devuelve False. 'Chile' sí está, así que devuelve True. El operador 'in' es sensible a mayúsculas.",
    correctAnswer: "False\nTrue",
    orderIndex: 47,
  },
  {
    id: 48,
    title: "Listas anidadas",
    description: "Una lista puede contener otras listas como elementos, creando estructuras bidimensionales (matrices). Se accede con doble índice: lista[fila][columna].",
    topic: "Listas",
    difficulty: "beginner",
    type: "predict_output",
    question: `matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(matriz[1][2])`,
    hint: "El primer índice selecciona la fila (0=primera, 1=segunda), el segundo selecciona la columna.",
    explanation: "matriz[1] accede a la segunda fila: [4, 5, 6]. Luego [2] accede al tercer elemento de esa fila: 6. Los índices siempre empiezan en 0.",
    correctAnswer: "6",
    orderIndex: 48,
  },

  // ═══════════════════════════════════════════════════════════════
  // BUCLES — ejercicios adicionales (IDs 49-55)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 49,
    title: "Bucle while",
    description: "El bucle while repite un bloque de código mientras una condición sea verdadera. Es útil cuando no sabes de antemano cuántas veces se repetirá.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `contador = 1
while contador <= 4:
    print(contador)
    contador += 1`,
    hint: "El bucle imprime contador y lo incrementa. ¿Cuándo se detiene?",
    explanation: "El bucle comienza con contador=1 e imprime 1, 2, 3, 4. Cuando contador llega a 5, la condición contador<=4 es False y el bucle termina. Cada iteración imprime el valor actual.",
    correctAnswer: "1\n2\n3\n4",
    orderIndex: 49,
  },
  {
    id: 50,
    title: "break: salir del bucle",
    description: "La sentencia break interrumpe inmediatamente el bucle más cercano, sin importar si la condición sigue siendo verdadera.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `for i in range(10):
    if i == 5:
        break
    print(i)`,
    hint: "El bucle se detiene en cuanto i vale 5, antes de imprimir ese valor.",
    explanation: "El bucle for itera i desde 0 hasta 9. Cuando i es 5, se ejecuta break antes del print, por eso 5 no se imprime. Se imprime del 0 al 4.",
    correctAnswer: "0\n1\n2\n3\n4",
    orderIndex: 50,
  },
  {
    id: 51,
    title: "continue: saltar una iteración",
    description: "La sentencia continue salta el resto del código en la iteración actual y pasa directamente a la siguiente, sin salir del bucle.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `for i in range(1, 6):
    if i == 3:
        continue
    print(i)`,
    hint: "continue salta la iteración cuando i==3, pero el bucle continúa.",
    explanation: "Cuando i es 3, continue hace que se salte el print(3) y vaya directo al siguiente i. Por eso se imprimen todos los números del 1 al 5 excepto el 3.",
    correctAnswer: "1\n2\n4\n5",
    orderIndex: 51,
  },
  {
    id: 52,
    title: "range() con paso",
    description: "range(inicio, fin, paso) genera una secuencia de números. El paso puede ser positivo o negativo, permitiendo contar hacia arriba o hacia abajo.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `for n in range(10, 0, -2):
    print(n)`,
    hint: "Empieza en 10 y va restando 2 en cada paso, hasta que llegue a 0 (sin incluirlo).",
    explanation: "range(10, 0, -2) genera: 10, 8, 6, 4, 2. Comienza en 10, resta 2 cada vez, y se detiene antes de llegar a 0. Se imprimen los 5 valores.",
    correctAnswer: "10\n8\n6\n4\n2",
    orderIndex: 52,
  },
  {
    id: 53,
    title: "enumerate(): índice y valor",
    description: "enumerate() recorre una lista dándote tanto el índice como el valor de cada elemento. Evita tener que usar un contador manual.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `frutas = ["manzana", "banana", "cereza"]
for i, fruta in enumerate(frutas):
    print(f"{i}: {fruta}")`,
    hint: "enumerate() genera pares (índice, valor) empezando desde 0.",
    explanation: "enumerate() genera (0, 'manzana'), (1, 'banana'), (2, 'cereza'). Cada par se desempaqueta en i y fruta. El resultado son tres líneas con el formato 'índice: valor'.",
    correctAnswer: "0: manzana\n1: banana\n2: cereza",
    orderIndex: 53,
  },
  {
    id: 54,
    title: "zip(): combinar listas",
    description: "zip() combina dos o más listas en pares, recorriendo todos simultáneamente. Se detiene cuando la lista más corta se agota.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `nombres = ["Ana", "Luis", "Eva"]
edades = [22, 30, 25]
for nombre, edad in zip(nombres, edades):
    print(f"{nombre} tiene {edad} años")`,
    hint: "zip() empareja: ('Ana', 22), ('Luis', 30), ('Eva', 25).",
    explanation: "zip() combina las dos listas elemento por elemento. En cada iteración, nombre y edad reciben el valor correspondiente de cada lista. Se imprimen las 3 líneas una por una.",
    correctAnswer: "Ana tiene 22 años\nLuis tiene 30 años\nEva tiene 25 años",
    orderIndex: 54,
  },
  {
    id: 55,
    title: "Bucles anidados",
    description: "Un bucle anidado es un bucle dentro de otro bucle. El bucle interno se ejecuta completamente en cada iteración del bucle externo.",
    topic: "Bucles",
    difficulty: "beginner",
    type: "predict_output",
    question: `for i in range(1, 3):
    for j in range(1, 3):
        print(f"{i}x{j}={i*j}")`,
    hint: "El bucle externo va de 1 a 2, y por cada valor ejecuta el bucle interno (también 1 a 2).",
    explanation: "i toma valores 1 y 2. Por cada i, j también toma 1 y 2. Eso da 4 combinaciones: 1x1=1, 1x2=2, 2x1=2, 2x2=4. El bucle interno se ejecuta completo por cada iteración del externo.",
    correctAnswer: "1x1=1\n1x2=2\n2x1=2\n2x2=4",
    orderIndex: 55,
  },

  // ═══════════════════════════════════════════════════════════════
  // FUNCIONES — ejercicios adicionales (IDs 56-62)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 56,
    title: "Parámetros con valor por defecto",
    description: "Puedes asignar valores por defecto a los parámetros de una función. Si el usuario no pasa ese argumento, se usa el valor por defecto.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "predict_output",
    question: `def saludar(nombre, saludo="Hola"):
    print(f"{saludo}, {nombre}!")

saludar("María")
saludar("Carlos", "Buenos días")`,
    hint: "La primera llamada no pasa el segundo argumento, así que usa el valor por defecto.",
    explanation: "saludar('María') usa el saludo por defecto 'Hola', dando 'Hola, María!'. saludar('Carlos', 'Buenos días') sobreescribe el defecto con 'Buenos días', dando 'Buenos días, Carlos!'.",
    correctAnswer: "Hola, María!\nBuenos días, Carlos!",
    orderIndex: 56,
  },
  {
    id: 57,
    title: "Argumentos con nombre (keyword args)",
    description: "Al llamar una función puedes especificar el nombre de cada parámetro, lo que permite pasarlos en cualquier orden y hace el código más claro.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "predict_output",
    question: `def presentar(nombre, edad, ciudad):
    print(f"{nombre}, {edad} años, de {ciudad}")

presentar(edad=20, ciudad="Bogotá", nombre="Ana")`,
    hint: "Al usar los nombres, puedes pasarlos en cualquier orden.",
    explanation: "Al usar keyword arguments (nombre=, edad=, ciudad=), el orden de los argumentos no importa. Python los asigna por nombre, no por posición. El resultado es igual a si los hubieras pasado en el orden original.",
    correctAnswer: "Ana, 20 años, de Bogotá",
    orderIndex: 57,
  },
  {
    id: 58,
    title: "Retornar múltiples valores",
    description: "Una función en Python puede retornar múltiples valores a la vez, separados por comas. Python los empaqueta automáticamente en una tupla.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "predict_output",
    question: `def min_max(lista):
    return min(lista), max(lista)

minimo, maximo = min_max([3, 1, 7, 2, 9, 4])
print(f"Min: {minimo}, Max: {maximo}")`,
    hint: "La función retorna dos valores y se desempaquetan en dos variables.",
    explanation: "min([3,1,7,2,9,4]) es 1 y max es 9. La función retorna (1, 9) como tupla. Con minimo, maximo = ... se desempaquetan en variables separadas.",
    correctAnswer: "Min: 1, Max: 9",
    orderIndex: 58,
  },
  {
    id: 59,
    title: "Funciones lambda",
    description: "Una función lambda es una función anónima de una sola expresión. Se define con la palabra clave lambda y es útil para operaciones simples.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "fill_blank",
    question: `cuadrado = ___ x: x ** 2
print(cuadrado(5))`,
    hint: "La palabra clave para crear funciones anónimas de una sola expresión en Python.",
    explanation: "lambda x: x ** 2 crea una función anónima que toma x y devuelve x al cuadrado. Es equivalente a def cuadrado(x): return x ** 2. cuadrado(5) devuelve 25.",
    correctAnswer: "lambda",
    orderIndex: 59,
  },
  {
    id: 60,
    title: "Scope: variables locales y globales",
    description: "Las variables dentro de una función son locales (no existen fuera). Las variables fuera son globales. Para modificar una global desde dentro de una función, usa global.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "predict_output",
    question: `mensaje = "global"

def cambiar():
    mensaje = "local"
    print(mensaje)

cambiar()
print(mensaje)`,
    hint: "La variable dentro de la función es local y no modifica la variable global.",
    explanation: "Dentro de cambiar(), mensaje = 'local' crea una variable LOCAL. No modifica la global. Por eso primero se imprime 'local' (dentro de la función) y luego 'global' (la variable global sin cambiar).",
    correctAnswer: "local\nglobal",
    orderIndex: 60,
  },
  {
    id: 61,
    title: "Docstrings: documentar funciones",
    description: "Los docstrings son strings de documentación que describen qué hace una función. Se escriben como primer elemento del cuerpo de la función, entre triple comillas.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "fill_blank",
    question: `def calcular_area(radio):
    """Calcula el área de un círculo dado su radio."""
    import math
    return math.pi * radio ** 2

print(calcular_area.___)`,
    hint: "Los docstrings se acceden mediante un atributo especial que tiene doble guión bajo a cada lado.",
    explanation: "El atributo __doc__ de cualquier función devuelve su docstring. calcular_area.__doc__ imprime 'Calcula el área de un círculo dado su radio.' Los docstrings son fundamentales para documentar código profesional.",
    correctAnswer: "__doc__",
    orderIndex: 61,
  },
  {
    id: 62,
    title: "Función que llama otra función",
    description: "Las funciones pueden llamar a otras funciones. Esto se llama composición de funciones y es un principio fundamental de la programación modular.",
    topic: "Funciones",
    difficulty: "beginner",
    type: "predict_output",
    question: `def doblar(n):
    return n * 2

def cuadruplicar(n):
    return doblar(doblar(n))

print(cuadruplicar(3))`,
    hint: "cuadruplicar llama a doblar dos veces sobre el mismo número.",
    explanation: "cuadruplicar(3) llama a doblar(doblar(3)). La primera llamada doblar(3) da 6. La segunda doblar(6) da 12. El resultado final es 12.",
    correctAnswer: "12",
    orderIndex: 62,
  },

  // ═══════════════════════════════════════════════════════════════
  // DICCIONARIOS — ejercicios adicionales (IDs 63-69)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 63,
    title: "Acceder con .get()",
    description: "El método .get(clave, defecto) accede a un valor del diccionario. Si la clave no existe, devuelve el valor defecto (o None si no se especifica), sin lanzar un error.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `persona = {"nombre": "Luis", "edad": 25}
print(persona.get("ciudad", "No especificada"))
print(persona.get("nombre", "Desconocido"))`,
    hint: "get() devuelve el segundo argumento si la clave no existe.",
    explanation: "'ciudad' no es una clave en el diccionario, así que .get() devuelve 'No especificada'. 'nombre' sí existe, así que devuelve 'Luis' e ignora el valor por defecto.",
    correctAnswer: "No especificada\nLuis",
    orderIndex: 63,
  },
  {
    id: 64,
    title: "Claves y valores con .keys() y .values()",
    description: ".keys() devuelve todas las claves del diccionario y .values() devuelve todos los valores. Ambos se pueden recorrer con un bucle for.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `notas = {"Matemáticas": 90, "Física": 85, "Química": 92}
total = sum(notas.values())
print(total)`,
    hint: "sum() puede sumar los valores del diccionario directamente.",
    explanation: ".values() retorna los valores [90, 85, 92]. sum() los suma: 90+85+92 = 267. Este patrón es muy útil para calcular totales o promedios de diccionarios.",
    correctAnswer: "267",
    orderIndex: 64,
  },
  {
    id: 65,
    title: "Iterar con .items()",
    description: ".items() devuelve pares (clave, valor) de cada entrada del diccionario, perfectos para iterar con un bucle for y acceder a ambos a la vez.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `precios = {"manzana": 2, "banana": 1, "cereza": 5}
for fruta, precio in precios.items():
    print(f"{fruta}: ${precio}")`,
    hint: ".items() devuelve pares (clave, valor) que se desempaquetan en 'fruta' y 'precio'.",
    explanation: ".items() genera los pares ('manzana', 2), ('banana', 1), ('cereza', 5). En cada iteración, fruta recibe la clave y precio el valor. Se imprime una línea por fruta.",
    correctAnswer: "manzana: $2\nbanana: $1\ncereza: $5",
    orderIndex: 65,
  },
  {
    id: 66,
    title: "Verificar si una clave existe",
    description: "El operador 'in' con diccionarios verifica si una CLAVE existe, no un valor. Es más eficiente que usar .get() solo para verificar existencia.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `config = {"tema": "oscuro", "idioma": "es", "notificaciones": True}
print("tema" in config)
print("fuente" in config)`,
    hint: "'tema' es una clave del diccionario, 'fuente' no lo es.",
    explanation: "'tema' sí existe como clave en config, así que 'tema' in config devuelve True. 'fuente' no es una clave, así que devuelve False. El operador 'in' en dicts verifica claves, no valores.",
    correctAnswer: "True\nFalse",
    orderIndex: 66,
  },
  {
    id: 67,
    title: "Eliminar con .pop()",
    description: ".pop(clave) elimina una entrada del diccionario y devuelve su valor. Si la clave no existe, lanza un KeyError (o devuelve un valor por defecto si se especifica).",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `carrito = {"leche": 2, "pan": 3, "queso": 5}
precio = carrito.pop("pan")
print(precio)
print(len(carrito))`,
    hint: ".pop() elimina 'pan' del diccionario y devuelve su valor (3).",
    explanation: "carrito.pop('pan') elimina la entrada 'pan' del diccionario y devuelve su valor 3. Después el carrito tiene solo 2 entradas (leche y queso), por eso len devuelve 2.",
    correctAnswer: "3\n2",
    orderIndex: 67,
  },
  {
    id: 68,
    title: "Diccionarios anidados",
    description: "Los diccionarios pueden contener otros diccionarios como valores. Esto es útil para representar estructuras de datos complejas como registros de personas.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `estudiante = {
    "nombre": "Sofía",
    "notas": {"matematicas": 95, "ingles": 88}
}
promedio = (estudiante["notas"]["matematicas"] + estudiante["notas"]["ingles"]) / 2
print(promedio)`,
    hint: "Accede al diccionario anidado con doble índice y calcula el promedio.",
    explanation: "estudiante['notas']['matematicas'] es 95 y estudiante['notas']['ingles'] es 88. (95+88)/2 = 91.5. Los diccionarios anidados se acceden encadenando claves.",
    correctAnswer: "91.5",
    orderIndex: 68,
  },
  {
    id: 69,
    title: "Comprensión de diccionarios",
    description: "Al igual que las comprensiones de lista, Python permite crear diccionarios de forma concisa con la sintaxis {clave: valor for elemento in iterable}.",
    topic: "Diccionarios",
    difficulty: "beginner",
    type: "predict_output",
    question: `numeros = [1, 2, 3, 4, 5]
cuadrados = {n: n**2 for n in numeros}
print(cuadrados[4])`,
    hint: "El diccionario mapea cada número a su cuadrado. ¿Cuál es el cuadrado de 4?",
    explanation: "La comprensión de diccionario crea {1:1, 2:4, 3:9, 4:16, 5:25}. cuadrados[4] accede al valor asociado a la clave 4, que es 4²=16.",
    correctAnswer: "16",
    orderIndex: 69,
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
