import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 4,
    "title": "Concatenación de strings",
    "description": "Une dos cadenas de texto.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "saludo = \"Hola\"\nnombre = \"Mundo\"\nprint(saludo + \" \" + nombre)",
    "hint": "El operador + une cadenas de texto.",
    "explanation": "Al usar + con strings, Python los une (concatena). El resultado es 'Hola Mundo'.",
    "correctAnswer": "Hola Mundo",
    "orderIndex": 4
  },
  {
    "id": 5,
    "title": "Longitud de un string",
    "description": "Usa la función len() para medir texto.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "texto = \"Python\"\nprint(len(texto))",
    "hint": "Cuenta las letras de la palabra.",
    "explanation": "len() devuelve la cantidad de caracteres. 'Python' tiene 6 letras.",
    "correctAnswer": "6",
    "orderIndex": 5
  },
  {
    "id": 6,
    "title": "Método upper()",
    "description": "Convierte texto a mayúsculas.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "multiple_choice",
    "question": "¿Qué imprime el siguiente código?\ntexto = 'hola'\nprint(texto.upper())",
    "options": [
      "hola",
      "HOLA",
      "Hola",
      "Error"
    ],
    "hint": "upper() convierte a mayúsculas.",
    "explanation": "El método .upper() convierte todos los caracteres a mayúsculas. 'hola' se convierte en 'HOLA'.",
    "correctAnswer": "HOLA",
    "orderIndex": 6
  },
  {
    "id": 35,
    "title": "Longitud de un string",
    "description": "La función len() cuenta cuántos caracteres tiene un string, incluyendo espacios.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "nombre = \"Python\"\nprint(len(nombre))",
    "hint": "Cuenta las letras: P-y-t-h-o-n",
    "explanation": "len('Python') cuenta los 6 caracteres del string: P, y, t, h, o, n. Cada letra cuenta como 1 carácter.",
    "correctAnswer": "6",
    "orderIndex": 35
  },
  {
    "id": 36,
    "title": "Slicing de strings",
    "description": "El slicing permite extraer partes de un string usando la sintaxis [inicio:fin]. El índice inicio está incluido y fin está excluido.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "frase = \"aprendiendo Python\"\nprint(frase[0:10])",
    "hint": "Extrae los caracteres desde la posición 0 hasta la 9 (la 10 no se incluye).",
    "explanation": "frase[0:10] extrae los caracteres en las posiciones 0 al 9 (10 no incluido). Eso da 'aprendiend'. La 'o' está en posición 10 y no se incluye.",
    "correctAnswer": "aprendiend",
    "orderIndex": 36
  },
  {
    "id": 37,
    "title": "Método upper() y lower()",
    "description": "Los strings tienen métodos para cambiar mayúsculas y minúsculas: .upper() convierte todo a mayúsculas y .lower() a minúsculas.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "fill_blank",
    "question": "saludo = \"hola mundo\"\nprint(saludo.___())",
    "options": [
      "upper",
      "lower",
      "capitalize",
      "title",
      "toUpper",
      "casefold"
    ],
    "hint": "El método que convierte todo a MAYÚSCULAS se llama así en inglés.",
    "explanation": "El método .upper() convierte todos los caracteres del string a mayúsculas. Entonces 'hola mundo'.upper() devuelve 'HOLA MUNDO'.",
    "correctAnswer": "upper",
    "orderIndex": 37
  },
  {
    "id": 38,
    "title": "String replace()",
    "description": "El método .replace(viejo, nuevo) reemplaza todas las ocurrencias de un substring por otro dentro del string.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "frase = \"me gusta Java\"\nnueva = frase.replace(\"Java\", \"Python\")\nprint(nueva)",
    "hint": "replace() busca 'Java' en el string y lo cambia por 'Python'.",
    "explanation": ".replace('Java', 'Python') busca todas las ocurrencias de 'Java' en la frase y las sustituye por 'Python'. El resultado es 'me gusta Python'.",
    "correctAnswer": "me gusta Python",
    "orderIndex": 38
  },
  {
    "id": 39,
    "title": "Separar un string con split()",
    "description": "El método .split(separador) divide un string en una lista de partes usando el separador indicado.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "colores = \"rojo,verde,azul\"\nlista = colores.split(\",\")\nprint(len(lista))",
    "hint": "Al dividir por ',' el string queda en 3 partes.",
    "explanation": ".split(',') divide 'rojo,verde,azul' en ['rojo', 'verde', 'azul']. Esta lista tiene 3 elementos, por eso len(lista) devuelve 3.",
    "correctAnswer": "3",
    "orderIndex": 39
  },
  {
    "id": 40,
    "title": "f-strings con expresiones",
    "description": "Dentro de las f-strings puedes incluir no solo variables, sino también expresiones y cálculos completos.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "a = 5\nb = 3\nprint(f\"La suma de {a} y {b} es {a + b}\")",
    "hint": "Calcula a + b = 5 + 3 = 8 dentro del f-string.",
    "explanation": "Las f-strings evalúan las expresiones dentro de {}. {a} se reemplaza por 5, {b} por 3, y {a + b} se calcula dando 8. El resultado final es 'La suma de 5 y 3 es 8'.",
    "correctAnswer": "La suma de 5 y 3 es 8",
    "orderIndex": 40
  },
  {
    "id": 41,
    "title": "String strip()",
    "description": "El método .strip() elimina espacios (y saltos de línea) al inicio y al final de un string. Útil para limpiar datos de entrada.",
    "topic": "Strings",
    "difficulty": "beginner",
    "type": "predict_output",
    "question": "entrada = \"   Python   \"\nlimpio = entrada.strip()\nprint(f\"[{limpio}]\")",
    "hint": "strip() quita todos los espacios del inicio y del final del string.",
    "explanation": ".strip() elimina los espacios en blanco al inicio y al final. '   Python   '.strip() da 'Python'. Los corchetes en el f-string ayudan a ver que no hay espacios sobrantes.",
    "correctAnswer": "[Python]",
    "orderIndex": 41
  }
];

