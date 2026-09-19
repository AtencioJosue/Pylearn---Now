import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 1,
    "title": "Asignación de variables",
    "description": "Aprende a asignar valores a variables en Python.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "¿Cuál es la forma correcta de asignar el valor 10 a una variable llamada 'x' en Python?",
    "options": [
      "x == 10",
      "x = 10",
      "int x = 10",
      "var x = 10"
    ],
    "hint": "En Python no se necesita declarar el tipo de la variable.",
    "explanation": "En Python se usa el signo '=' para asignar valores. No necesitas declarar el tipo como en otros lenguajes.",
    "correctAnswer": "x = 10",
    "orderIndex": 1
  },
  {
    "id": 2,
    "title": "Predice el output",
    "description": "Observa cómo Python imprime variables.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "x = 5\ny = 3\nprint(x + y)",
    "hint": "Suma los dos números.",
    "explanation": "x vale 5 e y vale 3. Al sumarlos obtenemos 8, que es lo que imprime print().",
    "correctAnswer": "8",
    "orderIndex": 2
  },
  {
    "id": 3,
    "title": "Completa el código",
    "description": "Crea una variable con tu nombre.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "fill_blank",
    "question": "Completa para que la variable 'nombre' tenga el valor 'Ana':\nnombre ___ 'Ana'",
    "options": [
      "=",
      "==",
      "+",
      "-",
      "str",
      "print"
    ],
    "hint": "Usa el operador de asignación.",
    "explanation": "El operador = asigna el valor 'Ana' a la variable nombre.",
    "correctAnswer": "=",
    "orderIndex": 3
  },
  {
    "id": 28,
    "title": "Asignación múltiple",
    "description": "Python permite asignar varios valores a varias variables en una sola línea, lo que hace el código más compacto y legible.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "a, b, c = 1, 2, 3\nprint(a + b + c)",
    "hint": "Suma los tres valores: a vale 1, b vale 2 y c vale 3.",
    "explanation": "La asignación múltiple `a, b, c = 1, 2, 3` asigna 1 a a, 2 a b y 3 a c en una sola línea. Luego print(1 + 2 + 3) imprime 6.",
    "correctAnswer": "6",
    "orderIndex": 28
  },
  {
    "id": 29,
    "title": "Tipo de dato con type()",
    "description": "La función type() te dice qué tipo de dato tiene una variable: int, str, float, bool, etc.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "x = 3.14\nprint(type(x))",
    "options": [
      "<class 'int'>",
      "<class 'float'>",
      "<class 'str'>",
      "<class 'number'>"
    ],
    "hint": "3.14 tiene punto decimal, ¿qué tipo de número es ese en Python?",
    "explanation": "3.14 es un número con decimales, que en Python se llama float (punto flotante). Por eso type(3.14) devuelve <class 'float'>.",
    "correctAnswer": "<class 'float'>",
    "orderIndex": 29
  },
  {
    "id": 30,
    "title": "Operadores de asignación compuesta",
    "description": "Los operadores como += y -= modifican una variable directamente. Son atajos muy usados en Python.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "puntos = 10\npuntos += 5\npuntos -= 2\nprint(puntos)",
    "hint": "Empieza en 10, suma 5, luego resta 2.",
    "explanation": "puntos empieza en 10. Con += 5 queda en 15. Con -= 2 queda en 13. El operador += es equivalente a escribir puntos = puntos + 5.",
    "correctAnswer": "13",
    "orderIndex": 30
  },
  {
    "id": 31,
    "title": "Intercambio de variables",
    "description": "Python tiene una forma elegante de intercambiar valores entre dos variables sin necesitar una variable temporal.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "a = \"hola\"\nb = \"mundo\"\na, b = b, a\nprint(a, b)",
    "hint": "Después del intercambio, ¿qué valor tiene cada variable?",
    "explanation": "La línea `a, b = b, a` es el swap clásico de Python. Intercambia los valores: a pasa a tener 'mundo' y b pasa a tener 'hola'. print(a, b) imprime los dos valores separados por espacio.",
    "correctAnswer": "mundo hola",
    "orderIndex": 31
  },
  {
    "id": 32,
    "title": "Variable booleana",
    "description": "Las variables booleanas solo pueden tener dos valores: True o False. Son fundamentales para la lógica y las condiciones.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "fill_blank",
    "question": "activo = ___\nif activo:\n    print(\"El usuario está activo\")",
    "options": [
      "True",
      "False",
      "true",
      "1",
      "bool",
      "Verdadero"
    ],
    "hint": "En Python, los valores booleanos se escriben con la primera letra en mayúscula.",
    "explanation": "La variable booleana activo debe valer True para que la condición if activo: sea verdadera y se imprima el mensaje. True y False siempre van en mayúscula en Python.",
    "correctAnswer": "True",
    "orderIndex": 32
  },
  {
    "id": 33,
    "title": "None: el valor vacío",
    "description": "None es un valor especial de Python que representa 'nada' o 'sin valor'. Es diferente de 0, False o string vacío.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "resultado = None\nprint(resultado is None)",
    "options": [
      "True",
      "False",
      "None",
      "Error"
    ],
    "hint": "Compara resultado con None usando el operador 'is'. ¿Qué retorna si son iguales?",
    "explanation": "resultado es None, así que `resultado is None` evalúa a True. En Python se usa 'is' para comparar con None, no '=='. El operador 'is' verifica identidad de objeto.",
    "correctAnswer": "True",
    "orderIndex": 33
  },
  {
    "id": 34,
    "title": "Conversión de tipos",
    "description": "Puedes convertir entre tipos de datos usando funciones como int(), str(), float(). Esto se llama type casting.",
    "topic": "Variables",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "texto = \"42\"\nnumero = int(texto)\nresultado = numero * 2\nprint(resultado)",
    "hint": "Se convierte '42' (string) a entero, luego se multiplica por 2.",
    "explanation": "int('42') convierte el string '42' al número entero 42. Luego 42 * 2 = 84. Sin int(), '42' * 2 hubiera dado '4242' (repetición de string).",
    "correctAnswer": "84",
    "orderIndex": 34
  }
];

