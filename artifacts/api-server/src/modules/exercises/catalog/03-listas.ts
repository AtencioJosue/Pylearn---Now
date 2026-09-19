import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 7,
    "title": "Crear una lista",
    "description": "Las listas almacenan múltiples valores.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "¿Cuál es la sintaxis correcta para crear una lista con los números 1, 2 y 3?",
    "options": [
      "lista = (1, 2, 3)",
      "lista = [1, 2, 3]",
      "lista = {1, 2, 3}",
      "lista = 1, 2, 3"
    ],
    "hint": "Las listas usan corchetes [ ].",
    "explanation": "En Python, las listas se crean con corchetes []. Los paréntesis () crean tuplas y las llaves {} crean conjuntos o diccionarios.",
    "correctAnswer": "lista = [1, 2, 3]",
    "orderIndex": 7
  },
  {
    "id": 8,
    "title": "Acceso a elementos",
    "description": "Accede a elementos de una lista por su índice.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "frutas = [\"manzana\", \"banana\", \"cereza\"]\nprint(frutas[1])",
    "hint": "Los índices en Python empiezan en 0.",
    "explanation": "El índice 0 es 'manzana', el índice 1 es 'banana', el índice 2 es 'cereza'. Por eso frutas[1] imprime 'banana'.",
    "correctAnswer": "banana",
    "orderIndex": 8
  },
  {
    "id": 9,
    "title": "Método append()",
    "description": "Agrega elementos al final de una lista.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "numeros = [1, 2, 3]\nnumeros.append(4)\nprint(numeros)",
    "hint": "append() añade al final.",
    "explanation": "append(4) añade el número 4 al final de la lista. La lista pasa de [1, 2, 3] a [1, 2, 3, 4].",
    "correctAnswer": "[1, 2, 3, 4]",
    "orderIndex": 9
  },
  {
    "id": 42,
    "title": "Acceder a elementos por índice",
    "description": "Los elementos de una lista se acceden por su posición (índice), que empieza en 0. Los índices negativos cuentan desde el final.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "frutas = [\"manzana\", \"banana\", \"cereza\", \"durazno\"]\nprint(frutas[-1])",
    "hint": "El índice -1 siempre apunta al último elemento de la lista.",
    "explanation": "Los índices negativos cuentan desde el final: -1 es el último elemento, -2 el penúltimo, etc. frutas[-1] es 'durazno', el último elemento de la lista.",
    "correctAnswer": "durazno",
    "orderIndex": 42
  },
  {
    "id": 43,
    "title": "Agregar con append()",
    "description": "El método .append() agrega un elemento al final de la lista. Es la forma más común de añadir elementos uno por uno.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "numeros = [1, 2, 3]\nnumeros.append(4)\nnumeros.append(5)\nprint(len(numeros))",
    "hint": "La lista empieza con 3 elementos y se agregan 2 más.",
    "explanation": "append(4) agrega 4 al final: [1,2,3,4]. append(5) agrega 5: [1,2,3,4,5]. len() cuenta los 5 elementos y devuelve 5.",
    "correctAnswer": "5",
    "orderIndex": 43
  },
  {
    "id": 44,
    "title": "Eliminar con remove()",
    "description": "El método .remove(valor) busca y elimina la primera ocurrencia del valor en la lista. Si el valor no existe, lanza un ValueError.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "colores = [\"rojo\", \"verde\", \"azul\", \"verde\"]\ncolores.remove(\"verde\")\nprint(colores)",
    "hint": "remove() elimina solo la PRIMERA ocurrencia de 'verde'.",
    "explanation": ".remove('verde') busca de izquierda a derecha y elimina solo la primera ocurrencia. La lista queda como ['rojo', 'azul', 'verde'] — el segundo 'verde' se mantiene.",
    "correctAnswer": "['rojo', 'azul', 'verde']",
    "orderIndex": 44
  },
  {
    "id": 45,
    "title": "Slicing de listas",
    "description": "Al igual que los strings, las listas soportan slicing para obtener sublistas. La sintaxis es lista[inicio:fin:paso].",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "numeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\nprint(numeros[2:7:2])",
    "hint": "Desde la posición 2, toma elementos saltando de 2 en 2, hasta la posición 6.",
    "explanation": "numeros[2:7:2] empieza en índice 2 (valor 2), salta de 2 en 2, hasta antes del índice 7. Toma los valores en posiciones 2, 4, 6 → [2, 4, 6].",
    "correctAnswer": "[2, 4, 6]",
    "orderIndex": 45
  },
  {
    "id": 46,
    "title": "Ordenar una lista con sort()",
    "description": "El método .sort() ordena la lista en su lugar (modifica la lista original). Para ordenar sin modificar la original, usa sorted().",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "fill_blank",
    "question": "numeros = [5, 2, 8, 1, 9, 3]\nnumeros.___()\nprint(numeros[0])",
    "options": [
      "sort",
      "sorted",
      "order",
      "reverse",
      "arrange",
      "min"
    ],
    "hint": "El método que ordena la lista de menor a mayor modifica la lista original.",
    "explanation": "numeros.sort() ordena la lista en su lugar: [1, 2, 3, 5, 8, 9]. Después de ordenar, numeros[0] es el elemento más pequeño, que es 1.",
    "correctAnswer": "sort",
    "orderIndex": 46
  },
  {
    "id": 47,
    "title": "Verificar si un elemento está en la lista",
    "description": "El operador 'in' verifica si un valor existe dentro de una lista. Devuelve True o False. También funciona para strings, tuplas y diccionarios.",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "paises = [\"México\", \"Argentina\", \"Colombia\", \"Chile\"]\nprint(\"Brasil\" in paises)\nprint(\"Chile\" in paises)",
    "hint": "Verifica si 'Brasil' y 'Chile' están en la lista de países.",
    "explanation": "'Brasil' no está en la lista, así que devuelve False. 'Chile' sí está, así que devuelve True. El operador 'in' es sensible a mayúsculas.",
    "correctAnswer": "False\nTrue",
    "orderIndex": 47
  },
  {
    "id": 48,
    "title": "Listas anidadas",
    "description": "Una lista puede contener otras listas como elementos, creando estructuras bidimensionales (matrices). Se accede con doble índice: lista[fila][columna].",
    "topic": "Listas",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(matriz[1][2])",
    "hint": "El primer índice selecciona la fila (0=primera, 1=segunda), el segundo selecciona la columna.",
    "explanation": "matriz[1] accede a la segunda fila: [4, 5, 6]. Luego [2] accede al tercer elemento de esa fila: 6. Los índices siempre empiezan en 0.",
    "correctAnswer": "6",
    "orderIndex": 48
  }
];

