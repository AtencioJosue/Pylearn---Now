import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 13,
    "title": "Definir una función",
    "description": "Aprende a crear funciones en Python.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "¿Cuál es la palabra clave para definir una función en Python?",
    "options": [
      "function",
      "func",
      "def",
      "define"
    ],
    "hint": "Es una abreviación de 'define'.",
    "explanation": "En Python se usa 'def' para definir funciones. Por ejemplo: def mi_funcion():",
    "correctAnswer": "def",
    "orderIndex": 13
  },
  {
    "id": 14,
    "title": "Función con return",
    "description": "Las funciones pueden devolver valores.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "def doble(x):\n    return x * 2\n\nprint(doble(5))",
    "hint": "La función multiplica su argumento por 2.",
    "explanation": "doble(5) devuelve 5 * 2 = 10. La instrucción return envía ese valor de vuelta y print lo muestra.",
    "correctAnswer": "10",
    "orderIndex": 14
  },
  {
    "id": 15,
    "title": "Función con múltiples parámetros",
    "description": "Las funciones pueden recibir más de un argumento.",
    "topic": "Funciones",
    "difficulty": "intermediate",
    "type": "predict_output",
    "question": "def suma(a, b):\n    return a + b\n\nresultado = suma(3, 7)\nprint(resultado)",
    "hint": "La función recibe dos números y los suma.",
    "explanation": "suma(3, 7) devuelve 3 + 7 = 10. Este valor se guarda en 'resultado' y luego se imprime.",
    "correctAnswer": "10",
    "orderIndex": 15
  },
  {
    "id": 56,
    "title": "Parámetros con valor por defecto",
    "description": "Puedes asignar valores por defecto a los parámetros de una función. Si el usuario no pasa ese argumento, se usa el valor por defecto.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "def saludar(nombre, saludo=\"Hola\"):\n    print(f\"{saludo}, {nombre}!\")\n\nsaludar(\"María\")\nsaludar(\"Carlos\", \"Buenos días\")",
    "hint": "La primera llamada no pasa el segundo argumento, así que usa el valor por defecto.",
    "explanation": "saludar('María') usa el saludo por defecto 'Hola', dando 'Hola, María!'. saludar('Carlos', 'Buenos días') sobreescribe el defecto con 'Buenos días', dando 'Buenos días, Carlos!'.",
    "correctAnswer": "Hola, María!\nBuenos días, Carlos!",
    "orderIndex": 56
  },
  {
    "id": 57,
    "title": "Argumentos con nombre (keyword args)",
    "description": "Al llamar una función puedes especificar el nombre de cada parámetro, lo que permite pasarlos en cualquier orden y hace el código más claro.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "def presentar(nombre, edad, ciudad):\n    print(f\"{nombre}, {edad} años, de {ciudad}\")\n\npresentar(edad=20, ciudad=\"Bogotá\", nombre=\"Ana\")",
    "hint": "Al usar los nombres, puedes pasarlos en cualquier orden.",
    "explanation": "Al usar keyword arguments (nombre=, edad=, ciudad=), el orden de los argumentos no importa. Python los asigna por nombre, no por posición. El resultado es igual a si los hubieras pasado en el orden original.",
    "correctAnswer": "Ana, 20 años, de Bogotá",
    "orderIndex": 57
  },
  {
    "id": 58,
    "title": "Retornar múltiples valores",
    "description": "Una función en Python puede retornar múltiples valores a la vez, separados por comas. Python los empaqueta automáticamente en una tupla.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "def min_max(lista):\n    return min(lista), max(lista)\n\nminimo, maximo = min_max([3, 1, 7, 2, 9, 4])\nprint(f\"Min: {minimo}, Max: {maximo}\")",
    "hint": "La función retorna dos valores y se desempaquetan en dos variables.",
    "explanation": "min([3,1,7,2,9,4]) es 1 y max es 9. La función retorna (1, 9) como tupla. Con minimo, maximo = ... se desempaquetan en variables separadas.",
    "correctAnswer": "Min: 1, Max: 9",
    "orderIndex": 58
  },
  {
    "id": 59,
    "title": "Funciones lambda",
    "description": "Una función lambda es una función anónima de una sola expresión. Se define con la palabra clave lambda y es útil para operaciones simples.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "fill_blank",
    "question": "cuadrado = ___ x: x ** 2\nprint(cuadrado(5))",
    "options": [
      "lambda",
      "def",
      "func",
      "fun",
      "anon",
      "fn"
    ],
    "hint": "La palabra clave para crear funciones anónimas de una sola expresión en Python.",
    "explanation": "lambda x: x ** 2 crea una función anónima que toma x y devuelve x al cuadrado. Es equivalente a def cuadrado(x): return x ** 2. cuadrado(5) devuelve 25.",
    "correctAnswer": "lambda",
    "orderIndex": 59
  },
  {
    "id": 60,
    "title": "Scope: variables locales y globales",
    "description": "Las variables dentro de una función son locales (no existen fuera). Las variables fuera son globales. Para modificar una global desde dentro de una función, usa global.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "mensaje = \"global\"\n\ndef cambiar():\n    mensaje = \"local\"\n    print(mensaje)\n\ncambiar()\nprint(mensaje)",
    "hint": "La variable dentro de la función es local y no modifica la variable global.",
    "explanation": "Dentro de cambiar(), mensaje = 'local' crea una variable LOCAL. No modifica la global. Por eso primero se imprime 'local' (dentro de la función) y luego 'global' (la variable global sin cambiar).",
    "correctAnswer": "local\nglobal",
    "orderIndex": 60
  },
  {
    "id": 61,
    "title": "Docstrings: documentar funciones",
    "description": "Los docstrings son strings de documentación que describen qué hace una función. Se escriben como primer elemento del cuerpo de la función, entre triple comillas.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "fill_blank",
    "question": "def calcular_area(radio):\n    \"\"\"Calcula el área de un círculo dado su radio.\"\"\"\n    import math\n    return math.pi * radio ** 2\n\nprint(calcular_area.___)",
    "options": [
      "__doc__",
      "__str__",
      "__name__",
      "__help__",
      "doc",
      "description"
    ],
    "hint": "Los docstrings se acceden mediante un atributo especial que tiene doble guión bajo a cada lado.",
    "explanation": "El atributo __doc__ de cualquier función devuelve su docstring. calcular_area.__doc__ imprime 'Calcula el área de un círculo dado su radio.' Los docstrings son fundamentales para documentar código profesional.",
    "correctAnswer": "__doc__",
    "orderIndex": 61
  },
  {
    "id": 62,
    "title": "Función que llama otra función",
    "description": "Las funciones pueden llamar a otras funciones. Esto se llama composición de funciones y es un principio fundamental de la programación modular.",
    "topic": "Funciones",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "def doblar(n):\n    return n * 2\n\ndef cuadruplicar(n):\n    return doblar(doblar(n))\n\nprint(cuadruplicar(3))",
    "hint": "cuadruplicar llama a doblar dos veces sobre el mismo número.",
    "explanation": "cuadruplicar(3) llama a doblar(doblar(3)). La primera llamada doblar(3) da 6. La segunda doblar(6) da 12. El resultado final es 12.",
    "correctAnswer": "12",
    "orderIndex": 62
  }
];

