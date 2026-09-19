import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 19,
    "title": "Comprensión de listas",
    "description": "Las comprensiones de lista permiten crear listas de forma concisa en una sola línea, combinando un bucle y una condición opcional.",
    "topic": "Intermedio",
    "difficulty": "intermediate",
    "type": "predict_output",
    "question": "numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\npares = [n for n in numeros if n % 2 == 0]\nprint(pares)",
    "hint": "La condición `if n % 2 == 0` filtra solo los números divisibles entre 2.",
    "explanation": "La comprensión `[n for n in numeros if n % 2 == 0]` recorre cada número y lo incluye solo si es par. El resultado es la lista [2, 4, 6, 8, 10].",
    "correctAnswer": "[2, 4, 6, 8, 10]",
    "orderIndex": 19
  },
  {
    "id": 20,
    "title": "Manejo de errores con try/except",
    "description": "Python usa try/except para manejar errores de forma controlada, evitando que el programa se detenga abruptamente ante situaciones inesperadas.",
    "topic": "Intermedio",
    "difficulty": "intermediate",
    "type": "fill_blank",
    "question": "try:\n    resultado = int(\"hola\")\n___ ValueError:\n    print(\"Error: no es un número válido\")",
    "options": [
      "except",
      "catch",
      "finally",
      "else",
      "try",
      "error"
    ],
    "hint": "La palabra clave que 'atrapa' un tipo de error específico en Python.",
    "explanation": "La palabra `except` captura el error especificado (ValueError). Si int('hola') falla, el bloque except se ejecuta en lugar de detener el programa.",
    "correctAnswer": "except",
    "orderIndex": 20
  },
  {
    "id": 21,
    "title": "Funciones con *args",
    "description": "*args permite que una función acepte un número variable de argumentos posicionales. Todos los valores llegan como una tupla dentro de la función.",
    "topic": "Intermedio",
    "difficulty": "intermediate",
    "type": "predict_output",
    "question": "def sumar(*numeros):\n    return sum(numeros)\n\nprint(sumar(2, 3, 5, 10))",
    "hint": "Suma todos los argumentos pasados: 2 + 3 + 5 + 10.",
    "explanation": "*numeros recibe todos los argumentos como la tupla (2, 3, 5, 10). sum() los suma todos y devuelve 20.",
    "correctAnswer": "20",
    "orderIndex": 21
  }
];

