import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 22,
    "title": "Recursión: Secuencia de Fibonacci",
    "description": "Una función recursiva se llama a sí misma. La secuencia de Fibonacci es el ejemplo clásico: cada número es la suma de los dos anteriores (0, 1, 1, 2, 3, 5, 8, 13...)",
    "topic": "Difícil",
    "difficulty": "advanced",
    "type": "predict_output",
    "question": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(fibonacci(7))",
    "hint": "La secuencia empieza: 0, 1, 1, 2, 3, 5, 8, 13... Cuenta desde la posición 0.",
    "explanation": "fibonacci(7) calcula la posición 7 de la secuencia (0-indexado): 0,1,1,2,3,5,8,13. La posición 7 es 13. Cada llamada se descompone en dos más pequeñas hasta llegar al caso base (n<=1).",
    "correctAnswer": "13",
    "orderIndex": 22
  },
  {
    "id": 23,
    "title": "Decoradores en Python",
    "description": "Un decorador es una función que envuelve otra función para extender su comportamiento sin modificarla directamente. Se aplica con la sintaxis @nombre_decorador.",
    "topic": "Difícil",
    "difficulty": "advanced",
    "type": "predict_output",
    "question": "def mayusculas(func):\n    def wrapper(*args):\n        return func(*args).upper()\n    return wrapper\n\n@mayusculas\ndef saludar(nombre):\n    return f\"hola {nombre}\"\n\nprint(saludar(\"mundo\"))",
    "hint": "El decorador @mayusculas envuelve saludar() y convierte su resultado a mayúsculas.",
    "explanation": "Cuando llamas saludar('mundo'), en realidad se ejecuta wrapper('mundo'), que llama a la función original obteniendo 'hola mundo' y luego aplica .upper(), devolviendo 'HOLA MUNDO'.",
    "correctAnswer": "HOLA MUNDO",
    "orderIndex": 23
  },
  {
    "id": 24,
    "title": "Herencia en Programación Orientada a Objetos",
    "description": "La herencia permite que una clase (hija) tome atributos y métodos de otra clase (padre). Esto promueve la reutilización de código y modela relaciones del mundo real.",
    "topic": "Difícil",
    "difficulty": "advanced",
    "type": "fill_blank",
    "question": "class Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre\n\nclass Perro(___):   # ¿De qué clase hereda Perro?\n    def hablar(self):\n        return f\"{self.nombre} dice: ¡Guau!\"\n\np = Perro(\"Rex\")\nprint(p.hablar())",
    "options": [
      "Animal",
      "object",
      "self",
      "class",
      "Clase",
      "Perro"
    ],
    "hint": "Para heredar de una clase se escribe su nombre entre paréntesis al definir la nueva clase.",
    "explanation": "Al poner `Animal` entre paréntesis en `class Perro(Animal)`, Perro hereda el método __init__ de Animal. Por eso puede acceder a self.nombre sin definirlo de nuevo.",
    "correctAnswer": "Animal",
    "orderIndex": 24
  }
];

