import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 16,
    "title": "Crear un diccionario",
    "description": "Los diccionarios guardan pares clave-valor.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "¿Cuál es la forma correcta de crear un diccionario en Python?",
    "options": [
      "persona = [\"nombre\": \"Ana\", \"edad\": 25]",
      "persona = (\"nombre\": \"Ana\", \"edad\": 25)",
      "persona = {\"nombre\": \"Ana\", \"edad\": 25}",
      "persona = <nombre: \"Ana\", edad: 25>"
    ],
    "hint": "Los diccionarios usan llaves { } con pares clave: valor.",
    "explanation": "Los diccionarios en Python usan llaves {}. Cada par se escribe como clave: valor, separados por comas.",
    "correctAnswer": "persona = {\"nombre\": \"Ana\", \"edad\": 25}",
    "orderIndex": 16
  },
  {
    "id": 17,
    "title": "Acceso a valores",
    "description": "Accede a un valor usando su clave.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "persona = {\"nombre\": \"Carlos\", \"edad\": 30}\nprint(persona[\"nombre\"])",
    "hint": "Usa la clave entre corchetes para obtener el valor.",
    "explanation": "Se accede a los valores del diccionario usando su clave entre corchetes. persona['nombre'] devuelve 'Carlos'.",
    "correctAnswer": "Carlos",
    "orderIndex": 17
  },
  {
    "id": 18,
    "title": "Agregar claves",
    "description": "Añade nuevos pares al diccionario.",
    "topic": "Diccionarios",
    "difficulty": "intermediate",
    "type": "predict_output",
    "question": "info = {\"pais\": \"Mexico\"}\ninfo[\"ciudad\"] = \"CDMX\"\nprint(len(info))",
    "hint": "len() cuenta cuántas claves tiene el diccionario.",
    "explanation": "Empezamos con 1 clave ('pais') y agregamos otra ('ciudad'). Ahora el diccionario tiene 2 claves, por eso len() devuelve 2.",
    "correctAnswer": "2",
    "orderIndex": 18
  },
  {
    "id": 63,
    "title": "Acceder con .get()",
    "description": "El método .get(clave, defecto) accede a un valor del diccionario. Si la clave no existe, devuelve el valor defecto (o None si no se especifica), sin lanzar un error.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "persona = {\"nombre\": \"Luis\", \"edad\": 25}\nprint(persona.get(\"ciudad\", \"No especificada\"))\nprint(persona.get(\"nombre\", \"Desconocido\"))",
    "hint": "get() devuelve el segundo argumento si la clave no existe.",
    "explanation": "'ciudad' no es una clave en el diccionario, así que .get() devuelve 'No especificada'. 'nombre' sí existe, así que devuelve 'Luis' e ignora el valor por defecto.",
    "correctAnswer": "No especificada\nLuis",
    "orderIndex": 63
  },
  {
    "id": 64,
    "title": "Claves y valores con .keys() y .values()",
    "description": ".keys() devuelve todas las claves del diccionario y .values() devuelve todos los valores. Ambos se pueden recorrer con un bucle for.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "notas = {\"Matemáticas\": 90, \"Física\": 85, \"Química\": 92}\ntotal = sum(notas.values())\nprint(total)",
    "hint": "sum() puede sumar los valores del diccionario directamente.",
    "explanation": ".values() retorna los valores [90, 85, 92]. sum() los suma: 90+85+92 = 267. Este patrón es muy útil para calcular totales o promedios de diccionarios.",
    "correctAnswer": "267",
    "orderIndex": 64
  },
  {
    "id": 65,
    "title": "Iterar con .items()",
    "description": ".items() devuelve pares (clave, valor) de cada entrada del diccionario, perfectos para iterar con un bucle for y acceder a ambos a la vez.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "precios = {\"manzana\": 2, \"banana\": 1, \"cereza\": 5}\nfor fruta, precio in precios.items():\n    print(f\"{fruta}: ${precio}\")",
    "hint": ".items() devuelve pares (clave, valor) que se desempaquetan en 'fruta' y 'precio'.",
    "explanation": ".items() genera los pares ('manzana', 2), ('banana', 1), ('cereza', 5). En cada iteración, fruta recibe la clave y precio el valor. Se imprime una línea por fruta.",
    "correctAnswer": "manzana: $2\nbanana: $1\ncereza: $5",
    "orderIndex": 65
  },
  {
    "id": 66,
    "title": "Verificar si una clave existe",
    "description": "El operador 'in' con diccionarios verifica si una CLAVE existe, no un valor. Es más eficiente que usar .get() solo para verificar existencia.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "config = {\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": True}\nprint(\"tema\" in config)\nprint(\"fuente\" in config)",
    "hint": "'tema' es una clave del diccionario, 'fuente' no lo es.",
    "explanation": "'tema' sí existe como clave en config, así que 'tema' in config devuelve True. 'fuente' no es una clave, así que devuelve False. El operador 'in' en dicts verifica claves, no valores.",
    "correctAnswer": "True\nFalse",
    "orderIndex": 66
  },
  {
    "id": 67,
    "title": "Eliminar con .pop()",
    "description": ".pop(clave) elimina una entrada del diccionario y devuelve su valor. Si la clave no existe, lanza un KeyError (o devuelve un valor por defecto si se especifica).",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "carrito = {\"leche\": 2, \"pan\": 3, \"queso\": 5}\nprecio = carrito.pop(\"pan\")\nprint(precio)\nprint(len(carrito))",
    "hint": ".pop() elimina 'pan' del diccionario y devuelve su valor (3).",
    "explanation": "carrito.pop('pan') elimina la entrada 'pan' del diccionario y devuelve su valor 3. Después el carrito tiene solo 2 entradas (leche y queso), por eso len devuelve 2.",
    "correctAnswer": "3\n2",
    "orderIndex": 67
  },
  {
    "id": 68,
    "title": "Diccionarios anidados",
    "description": "Los diccionarios pueden contener otros diccionarios como valores. Esto es útil para representar estructuras de datos complejas como registros de personas.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "estudiante = {\n    \"nombre\": \"Sofía\",\n    \"notas\": {\"matematicas\": 95, \"ingles\": 88}\n}\npromedio = (estudiante[\"notas\"][\"matematicas\"] + estudiante[\"notas\"][\"ingles\"]) / 2\nprint(promedio)",
    "hint": "Accede al diccionario anidado con doble índice y calcula el promedio.",
    "explanation": "estudiante['notas']['matematicas'] es 95 y estudiante['notas']['ingles'] es 88. (95+88)/2 = 91.5. Los diccionarios anidados se acceden encadenando claves.",
    "correctAnswer": "91.5",
    "orderIndex": 68
  },
  {
    "id": 69,
    "title": "Comprensión de diccionarios",
    "description": "Al igual que las comprensiones de lista, Python permite crear diccionarios de forma concisa con la sintaxis {clave: valor for elemento in iterable}.",
    "topic": "Diccionarios",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "numeros = [1, 2, 3, 4, 5]\ncuadrados = {n: n**2 for n in numeros}\nprint(cuadrados[4])",
    "hint": "El diccionario mapea cada número a su cuadrado. ¿Cuál es el cuadrado de 4?",
    "explanation": "La comprensión de diccionario crea {1:1, 2:4, 3:9, 4:16, 5:25}. cuadrados[4] accede al valor asociado a la clave 4, que es 4²=16.",
    "correctAnswer": "16",
    "orderIndex": 69
  }
];

