import type { Difficulty, ExerciseData } from "../types";

type ChoiceSeed = [
  question: string,
  options: string[],
  answer: string,
  explanation: string,
];
type PredictionSeed = [code: string, answer: string, explanation: string];
type FillSeed = [
  template: string,
  options: string[],
  answer: string,
  explanation: string,
];
type SelectSeed = [
  question: string,
  options: string[],
  answers: string[],
  explanation: string,
];
type OrderSeed = [question: string, lines: string[], explanation: string];
type CodeSeed = [
  question: string,
  answer: string,
  accepted: string[],
  explanation: string,
];

interface LessonBlueprint {
  topic: string;
  lesson: string;
  skill: string;
  concept: ChoiceSeed;
  prediction: PredictionSeed;
  fill: FillSeed;
  select: SelectSeed;
  order: OrderSeed;
  bug: ChoiceSeed;
  code: CodeSeed;
  review: ChoiceSeed;
}

let nextId = 213;

function difficultyForLesson(index: number): Difficulty {
  if (index < 7) return "beginner";
  if (index < 15) return "intermediate";
  if (index < 21) return "advanced";
  return "tryhard";
}

function createExercise(
  blueprint: LessonBlueprint,
  lessonIndex: number,
  data: Omit<
    ExerciseData,
    "id" | "orderIndex" | "topic" | "difficulty" | "lesson" | "skills"
  >,
): ExerciseData {
  const id = nextId++;
  const difficulty = difficultyForLesson(lessonIndex);
  return {
    ...data,
    id,
    orderIndex: id,
    topic: blueprint.topic,
    difficulty,
    lesson: blueprint.lesson,
    skills: [blueprint.skill],
    xp:
      difficulty === "tryhard"
        ? 45
        : difficulty === "advanced"
          ? 30
          : difficulty === "intermediate"
            ? 20
            : 15,
    coins: difficulty === "tryhard" ? 25 : difficulty === "advanced" ? 18 : 10,
    theme: `Misión: ${blueprint.lesson}`,
    pytoReaction: `¡Cada intento fortalece tu habilidad con ${blueprint.skill}!`,
  };
}

function buildLesson(
  blueprint: LessonBlueprint,
  lessonIndex: number,
): ExerciseData[] {
  const [conceptQuestion, conceptOptions, conceptAnswer, conceptExplanation] =
    blueprint.concept;
  const [predictionCode, predictionAnswer, predictionExplanation] =
    blueprint.prediction;
  const [fillTemplate, fillOptions, fillAnswer, fillExplanation] =
    blueprint.fill;
  const [selectQuestion, selectOptions, selectAnswers, selectExplanation] =
    blueprint.select;
  const [orderQuestion, orderLines, orderExplanation] = blueprint.order;
  const [bugQuestion, bugOptions, bugAnswer, bugExplanation] = blueprint.bug;
  const [codeQuestion, codeAnswer, acceptedAnswers, codeExplanation] =
    blueprint.code;
  const [reviewQuestion, reviewOptions, reviewAnswer, reviewExplanation] =
    blueprint.review;

  return [
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: concepto clave`,
      description: "Activa tus conocimientos antes de comenzar la misión.",
      type: "multiple_choice",
      question: conceptQuestion,
      options: conceptOptions,
      correctAnswer: conceptAnswer,
      explanation: conceptExplanation,
      hint: `Piensa en la regla principal de ${blueprint.skill}.`,
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: predice la consola`,
      description: "Lee el programa paso a paso antes de elegir su salida.",
      type: "predict_output",
      question: predictionCode,
      options: [predictionAnswer],
      correctAnswer: predictionAnswer,
      explanation: predictionExplanation,
      hint: "Anota el valor de cada variable después de cada línea.",
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: pieza perdida`,
      description: "Completa el fragmento para que Python pueda ejecutarlo.",
      type: "fill_blank",
      question: fillTemplate,
      options: fillOptions,
      correctAnswer: fillAnswer,
      explanation: fillExplanation,
      hint: "Observa la sintaxis que rodea al espacio vacío.",
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: selección experta`,
      description: "Puede haber más de una opción correcta.",
      type: "multiple_select",
      question: selectQuestion,
      options: selectOptions,
      correctAnswer: JSON.stringify(selectAnswers),
      explanation: selectExplanation,
      hint: "Revisa cada opción por separado antes de marcarla.",
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: reconstruye el programa`,
      description: "Ordena las líneas para formar una solución válida.",
      type: "order",
      question: orderQuestion,
      options: [...orderLines.slice(1), orderLines[0]],
      correctAnswer: JSON.stringify(orderLines),
      explanation: orderExplanation,
      hint: "Busca primero la línea que prepara los datos.",
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: laboratorio de bugs`,
      description:
        "Encuentra la línea que impide que el programa funcione como se espera.",
      type: "bug",
      question: bugQuestion,
      options: bugOptions,
      correctAnswer: bugAnswer,
      explanation: bugExplanation,
      hint: "Comprueba signos, nombres y estructura de control.",
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: escribe la solución`,
      description: "Resuelve el reto escribiendo una instrucción de Python.",
      type: "code",
      question: codeQuestion,
      correctAnswer: codeAnswer,
      acceptedAnswers,
      explanation: codeExplanation,
      hint: `Usa lo aprendido sobre ${blueprint.skill}.`,
    }),
    createExercise(blueprint, lessonIndex, {
      title: `${blueprint.lesson}: punto de control`,
      description: "Cierra la lección comprobando la idea más importante.",
      type: "multiple_choice",
      question: reviewQuestion,
      options: reviewOptions,
      correctAnswer: reviewAnswer,
      explanation: reviewExplanation,
      hint: "Descarta primero las opciones que no son sintaxis válida de Python.",
    }),
  ];
}

const lessons: LessonBlueprint[] = [
  {
    topic: "Condicionales - Decisiones inteligentes",
    lesson: "La puerta del if",
    skill: "condiciones básicas",
    concept: [
      "¿Qué palabra inicia una condición en Python?",
      ["if", "when", "check", "case"],
      "if",
      "Python utiliza if para ejecutar un bloque cuando una condición es verdadera.",
    ],
    prediction: [
      "energia = 7\nif energia >= 5:\n    print('Avanzar')",
      "Avanzar",
      "La condición 7 >= 5 es verdadera, por eso se ejecuta print().",
    ],
    fill: [
      "edad = 18\n___ edad >= 18:\n    print('Acceso')",
      ["if", "for", "def", "while"],
      "if",
      "La palabra if abre el bloque condicional.",
    ],
    select: [
      "¿Cuáles expresiones producen un booleano?",
      ["5 > 2", "nombre == 'Pylearn'", "print('hola')", "edad + 1"],
      ["5 > 2", "nombre == 'Pylearn'"],
      "Las comparaciones > y == producen True o False.",
    ],
    order: [
      "Construye una comprobación de mayoría de edad.",
      ["edad = 20", "if edad >= 18:", "    print('Mayor de edad')"],
      "Primero se crea la variable, luego se evalúa y finalmente se ejecuta el bloque.",
    ],
    bug: [
      "¿Qué línea tiene el error de sintaxis?",
      ["edad = 20", "if edad >= 18", "    print('Acceso')"],
      "if edad >= 18",
      "Los bloques if deben terminar su cabecera con dos puntos.",
    ],
    code: [
      "Escribe una condición que imprima 'Positivo' cuando numero sea mayor que 0.",
      "if numero > 0: print('Positivo')",
      ["if numero > 0:\n    print('Positivo')"],
      "La comparación numero > 0 decide si se ejecuta el mensaje.",
    ],
    review: [
      "¿Qué ocurre si la condición de un if es False?",
      [
        "Se omite su bloque",
        "Python se cierra",
        "Siempre se ejecuta",
        "La variable se elimina",
      ],
      "Se omite su bloque",
      "Python continúa después del bloque sin ejecutar sus instrucciones.",
    ],
  },
  {
    topic: "Condicionales - Decisiones inteligentes",
    lesson: "Rutas con elif y else",
    skill: "ramificaciones",
    concept: [
      "¿Para qué sirve elif?",
      [
        "Probar otra condición",
        "Crear una función",
        "Repetir un bloque",
        "Importar un módulo",
      ],
      "Probar otra condición",
      "elif permite evaluar una condición adicional cuando las anteriores fallaron.",
    ],
    prediction: [
      "puntos = 72\nif puntos >= 90:\n    print('Oro')\nelif puntos >= 60:\n    print('Plata')\nelse:\n    print('Bronce')",
      "Plata",
      "72 no llega a 90, pero sí cumple puntos >= 60.",
    ],
    fill: [
      "temperatura = 12\nif temperatura > 25:\n    print('Calor')\n___:\n    print('Fresco')",
      ["else", "elif", "except", "finally"],
      "else",
      "else cubre el caso restante y no lleva condición.",
    ],
    select: [
      "¿Qué afirmaciones sobre if/elif/else son correctas?",
      [
        "Solo se ejecuta una rama",
        "else es opcional",
        "elif debe ir antes de if",
        "puede haber varios elif",
      ],
      [
        "Solo se ejecuta una rama",
        "else es opcional",
        "puede haber varios elif",
      ],
      "La cadena se evalúa de arriba abajo y se detiene en la primera rama verdadera.",
    ],
    order: [
      "Clasifica una puntuación.",
      [
        "puntos = 45",
        "if puntos >= 50:",
        "    print('Superado')",
        "else:",
        "    print('Reintenta')",
      ],
      "La rama else pertenece al if y debe aparecer después de su bloque.",
    ],
    bug: [
      "¿Qué línea está fuera de orden?",
      ["nota = 80", "else:", "if nota >= 60:", "    print('Aprobado')"],
      "else:",
      "else no puede aparecer antes del if al que pertenece.",
    ],
    code: [
      "Escribe una expresión condicional que guarde 'par' o 'impar' en tipo según numero.",
      "tipo = 'par' if numero % 2 == 0 else 'impar'",
      ['tipo = "par" if numero % 2 == 0 else "impar"'],
      "La expresión condicional permite elegir un valor en una sola línea.",
    ],
    review: [
      "¿Cuándo se ejecuta else?",
      [
        "Cuando ninguna condición anterior es verdadera",
        "Siempre",
        "Solo si if es verdadero",
        "Antes de elif",
      ],
      "Cuando ninguna condición anterior es verdadera",
      "else es la ruta de respaldo de la cadena condicional.",
    ],
  },
  {
    topic: "Condicionales - Decisiones inteligentes",
    lesson: "Guardianes lógicos",
    skill: "operadores lógicos",
    concept: [
      "¿Qué operador exige que ambas condiciones sean verdaderas?",
      ["and", "or", "not", "in"],
      "and",
      "and devuelve True únicamente cuando ambos lados son verdaderos.",
    ],
    prediction: [
      "nivel = 8\ntiene_llave = True\nif nivel >= 5 and tiene_llave:\n    print('Tesoro')\nelse:\n    print('Bloqueado')",
      "Tesoro",
      "Las dos condiciones son verdaderas.",
    ],
    fill: [
      "usuario = 'Pylearn'\nif usuario == 'Pylearn' ___ usuario == 'Admin':\n    print('Bienvenido')",
      ["or", "and", "not", "is"],
      "or",
      "or acepta que cualquiera de las dos comparaciones sea verdadera.",
    ],
    select: [
      "Con x = 10, ¿cuáles expresiones son True?",
      ["x > 5 and x < 20", "x == 3 or x == 10", "not x > 0", "x < 5"],
      ["x > 5 and x < 20", "x == 3 or x == 10"],
      "10 está entre 5 y 20 y también coincide con la segunda parte del or.",
    ],
    order: [
      "Valida un acceso con dos requisitos.",
      [
        "edad = 20",
        "tiene_pase = True",
        "if edad >= 18 and tiene_pase:",
        "    print('Entrar')",
      ],
      "Primero se preparan ambos datos y luego se combinan con and.",
    ],
    bug: [
      "¿Qué línea usa un operador inexistente en Python?",
      [
        "activo = True",
        "saldo = 50",
        "if activo && saldo > 0:",
        "    print('Disponible')",
      ],
      "if activo && saldo > 0:",
      "Python escribe and, no &&.",
    ],
    code: [
      "Escribe una expresión que sea True si edad está entre 18 y 65 inclusive.",
      "18 <= edad <= 65",
      ["edad >= 18 and edad <= 65"],
      "Python permite encadenar comparaciones o combinarlas con and.",
    ],
    review: [
      "¿Qué hace not True?",
      ["Devuelve False", "Devuelve True", "Produce un error", "Devuelve None"],
      "Devuelve False",
      "not invierte un valor booleano.",
    ],
  },
  {
    topic: "Tuplas y conjuntos - Colecciones únicas",
    lesson: "Tuplas inmutables",
    skill: "tuplas",
    concept: [
      "¿Qué característica distingue a una tupla?",
      [
        "No se puede modificar",
        "Solo guarda números",
        "No conserva orden",
        "No admite índices",
      ],
      "No se puede modificar",
      "Una tupla es una colección ordenada e inmutable.",
    ],
    prediction: [
      "punto = (4, 7)\nprint(punto[1])",
      "7",
      "El índice 1 corresponde al segundo elemento.",
    ],
    fill: [
      "coordenadas = (10, 20)\nx, y = coordenadas\nprint(___)",
      ["x", "coordenadas[2]", "z", "len"],
      "x",
      "El desempaquetado asigna 10 a x y 20 a y.",
    ],
    select: [
      "¿Cuáles son tuplas válidas?",
      ["(1, 2)", "('solo',)", "[1, 2]", "{1, 2}"],
      ["(1, 2)", "('solo',)"],
      "La coma crea la tupla de un elemento; los otros símbolos crean lista y conjunto.",
    ],
    order: [
      "Desempaqueta una posición y muéstrala.",
      ["posicion = (3, 9)", "fila, columna = posicion", "print(fila, columna)"],
      "La tupla debe existir antes de desempaquetarla.",
    ],
    bug: [
      "¿Qué línea intenta modificar una tupla?",
      [
        "colores = ('azul', 'verde')",
        "print(colores[0])",
        "colores[0] = 'rojo'",
      ],
      "colores[0] = 'rojo'",
      "Los elementos de una tupla no se pueden reasignar.",
    ],
    code: [
      "Crea una tupla de un solo elemento con el texto 'Python'.",
      "lenguajes = ('Python',)",
      ['lenguajes = ("Python",)'],
      "La coma final es necesaria para crear una tupla de un elemento.",
    ],
    review: [
      "¿Qué devuelve len((2, 4, 6))?",
      ["3", "6", "2", "Error"],
      "3",
      "len cuenta los tres elementos de la tupla.",
    ],
  },
  {
    topic: "Tuplas y conjuntos - Colecciones únicas",
    lesson: "El poder de los sets",
    skill: "conjuntos",
    concept: [
      "¿Qué elimina automáticamente un set?",
      [
        "Valores duplicados",
        "Números negativos",
        "Textos",
        "Valores ordenados",
      ],
      "Valores duplicados",
      "Los conjuntos almacenan elementos únicos.",
    ],
    prediction: [
      "numeros = {1, 1, 2, 3, 3}\nprint(len(numeros))",
      "3",
      "El conjunto contiene únicamente 1, 2 y 3.",
    ],
    fill: [
      "a = {1, 2, 3}\nb = {3, 4}\nprint(a ___ b)",
      ["&", "+", "*", "/"],
      "&",
      "El operador & calcula la intersección de conjuntos.",
    ],
    select: [
      "¿Qué operaciones pertenecen a los conjuntos?",
      ["unión", "intersección", "diferencia", "acceso por índice"],
      ["unión", "intersección", "diferencia"],
      "Los sets permiten operaciones matemáticas, pero no acceso posicional.",
    ],
    order: [
      "Elimina duplicados de una lista.",
      [
        "nombres = ['Ana', 'Ana', 'Luis']",
        "unicos = set(nombres)",
        "print(len(unicos))",
      ],
      "Primero existe la lista y luego se convierte en set.",
    ],
    bug: [
      "¿Qué línea intenta indexar un conjunto?",
      ["ids = {10, 20, 30}", "ids.add(40)", "print(ids[0])"],
      "print(ids[0])",
      "Los conjuntos no tienen índices.",
    ],
    code: [
      "Crea un conjunto con 1, 2 y 3 llamado numeros.",
      "numeros = {1, 2, 3}",
      [],
      "Las llaves con elementos crean un conjunto.",
    ],
    review: [
      "¿Qué método añade un elemento a un set?",
      ["add", "append", "push", "insert"],
      "add",
      "Los conjuntos utilizan add().",
    ],
  },
  {
    topic: "Errores - Laboratorio de bugs",
    lesson: "Atrapa la excepción",
    skill: "try y except",
    concept: [
      "¿Qué bloque captura un error?",
      ["except", "else", "match", "with"],
      "except",
      "except maneja las excepciones que ocurren dentro de try.",
    ],
    prediction: [
      "try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print('Sin dividir')",
      "Sin dividir",
      "La división por cero activa el bloque except indicado.",
    ],
    fill: [
      "try:\n    numero = int('hola')\n___ ValueError:\n    print('Dato inválido')",
      ["except", "if", "catch", "error"],
      "except",
      "Python usa except seguido del tipo de excepción.",
    ],
    select: [
      "¿Cuáles son excepciones incorporadas de Python?",
      ["ValueError", "TypeError", "IndexError", "CompileFail"],
      ["ValueError", "TypeError", "IndexError"],
      "Las tres primeras forman parte de las excepciones estándar.",
    ],
    order: [
      "Maneja una conversión insegura.",
      ["try:", "    edad = int(texto)", "except ValueError:", "    edad = 0"],
      "La operación riesgosa va dentro de try y la alternativa dentro de except.",
    ],
    bug: [
      "¿Qué línea usa una palabra de otro lenguaje?",
      [
        "try:",
        "    resultado = 10 / divisor",
        "catch ZeroDivisionError:",
        "    resultado = 0",
      ],
      "catch ZeroDivisionError:",
      "Python utiliza except en lugar de catch.",
    ],
    code: [
      "Escribe un except que capture ValueError y asigne 0 a numero.",
      "except ValueError: numero = 0",
      ["except ValueError:\n    numero = 0"],
      "Capturar la excepción concreta evita ocultar otros problemas.",
    ],
    review: [
      "¿Por qué conviene capturar errores concretos?",
      [
        "Para no ocultar fallos inesperados",
        "Para hacer el código más lento",
        "Porque except solo admite uno",
        "Para eliminar try",
      ],
      "Para no ocultar fallos inesperados",
      "Una excepción específica documenta qué problema esperas resolver.",
    ],
  },
  {
    topic: "Errores - Laboratorio de bugs",
    lesson: "Limpieza garantizada",
    skill: "else y finally",
    concept: [
      "¿Qué bloque se ejecuta haya o no una excepción?",
      ["finally", "else", "except", "raise"],
      "finally",
      "finally se ejecuta siempre y resulta útil para liberar recursos.",
    ],
    prediction: [
      "try:\n    print('A')\nexcept ValueError:\n    print('B')\nelse:\n    print('C')\nfinally:\n    print('D')",
      "A\nC\nD",
      "No hay error: se ejecutan try, else y finalmente finally.",
    ],
    fill: [
      "archivo = None\ntry:\n    archivo = open('datos.txt')\n___:\n    print('Proceso terminado')",
      ["finally", "else", "if", "raise"],
      "finally",
      "finally expresa una acción que debe ocurrir siempre.",
    ],
    select: [
      "¿Qué afirmaciones son verdaderas?",
      [
        "else se ejecuta si no hubo error",
        "finally se ejecuta siempre",
        "except debe aparecer antes de try",
        "finally puede liberar recursos",
      ],
      [
        "else se ejecuta si no hubo error",
        "finally se ejecuta siempre",
        "finally puede liberar recursos",
      ],
      "else representa el camino exitoso y finally la limpieza final.",
    ],
    order: [
      "Forma una estructura completa de manejo de errores.",
      [
        "try:",
        "    procesar()",
        "except ValueError:",
        "    recuperar()",
        "finally:",
        "    limpiar()",
      ],
      "El orden válido es try, except y finally.",
    ],
    bug: [
      "¿Qué línea está mal ubicada?",
      ["finally:", "    cerrar()", "try:", "    abrir()"],
      "finally:",
      "finally necesita aparecer después de un bloque try.",
    ],
    code: [
      "Escribe un bloque finally que llame a cerrar().",
      "finally: cerrar()",
      ["finally:\n    cerrar()"],
      "La llamada queda garantizada al colocarla en finally.",
    ],
    review: [
      "¿Cuándo se ejecuta el else asociado a try?",
      [
        "Cuando try termina sin excepción",
        "Cuando ocurre cualquier error",
        "Antes de try",
        "Solo dentro de finally",
      ],
      "Cuando try termina sin excepción",
      "El else separa la lógica exitosa del código protegido.",
    ],
  },
  {
    topic: "Errores - Laboratorio de bugs",
    lesson: "Crea tus propias alertas",
    skill: "raise",
    concept: [
      "¿Qué palabra lanza una excepción manualmente?",
      ["raise", "throw", "error", "except"],
      "raise",
      "raise permite señalar que un dato o estado no es válido.",
    ],
    prediction: [
      "edad = -2\ntry:\n    if edad < 0:\n        raise ValueError('Edad inválida')\nexcept ValueError:\n    print('Revisar')",
      "Revisar",
      "La condición lanza ValueError y except la captura.",
    ],
    fill: [
      "if saldo < 0:\n    ___ ValueError('Saldo inválido')",
      ["raise", "except", "return", "asserted"],
      "raise",
      "raise lanza la excepción indicada.",
    ],
    select: [
      "¿Cuándo tiene sentido usar raise?",
      [
        "Al validar argumentos",
        "Ante un estado imposible",
        "Para imprimir cualquier texto",
        "Al rechazar datos inválidos",
      ],
      [
        "Al validar argumentos",
        "Ante un estado imposible",
        "Al rechazar datos inválidos",
      ],
      "raise comunica al código llamador que la operación no puede continuar.",
    ],
    order: [
      "Valida una cantidad positiva.",
      [
        "def comprar(cantidad):",
        "    if cantidad <= 0:",
        "        raise ValueError('Cantidad inválida')",
        "    return cantidad",
      ],
      "Primero se define la función, se valida y luego se devuelve el valor aceptado.",
    ],
    bug: [
      "¿Qué línea usa una excepción que no existe?",
      ["precio = -1", "if precio < 0:", "    raise PriceIsBad('Error')"],
      "    raise PriceIsBad('Error')",
      "Una excepción personalizada debe definirse antes o se debe usar una estándar.",
    ],
    code: [
      "Lanza ValueError con el mensaje 'Vacío' cuando nombre esté vacío.",
      "if not nombre: raise ValueError('Vacío')",
      ["if nombre == '':\n    raise ValueError('Vacío')"],
      "La condición detecta valores vacíos y raise detiene la operación.",
    ],
    review: [
      "¿Qué tipo suele indicar que un argumento tiene un valor inadecuado?",
      ["ValueError", "ImportError", "EOFError", "StopIteration"],
      "ValueError",
      "ValueError describe un valor del tipo correcto pero contenido inválido.",
    ],
  },
  {
    topic: "Archivos - Expedición de datos",
    lesson: "Explora archivos de texto",
    skill: "lectura de archivos",
    concept: [
      "¿Qué modo abre un archivo solo para lectura?",
      ["r", "w", "a", "x"],
      "r",
      "El modo r abre un archivo existente para leerlo.",
    ],
    prediction: [
      "lineas = ['uno\\n', 'dos\\n']\nprint(len(lineas))",
      "2",
      "La lista contiene dos líneas, aunque cada una termine con salto de línea.",
    ],
    fill: [
      "with open('notas.txt', 'r', encoding='utf-8') as archivo:\n    contenido = archivo.___()",
      ["read", "write", "append", "save"],
      "read",
      "read() devuelve el contenido del archivo.",
    ],
    select: [
      "¿Qué métodos sirven para leer?",
      ["read", "readline", "readlines", "write"],
      ["read", "readline", "readlines"],
      "Los tres métodos read leen distinta cantidad de contenido.",
    ],
    order: [
      "Lee e imprime un archivo de forma segura.",
      [
        "with open('mensaje.txt', encoding='utf-8') as archivo:",
        "    texto = archivo.read()",
        "    print(texto)",
      ],
      "with mantiene el archivo abierto durante el bloque y lo cierra al salir.",
    ],
    bug: [
      "¿Qué línea intenta leer después de cerrar el archivo?",
      [
        "archivo = open('datos.txt')",
        "archivo.close()",
        "contenido = archivo.read()",
      ],
      "contenido = archivo.read()",
      "No se puede leer desde un archivo que ya se cerró.",
    ],
    code: [
      "Escribe una expresión que abra datos.txt en modo lectura y la guarde en archivo.",
      "archivo = open('datos.txt', 'r')",
      ['archivo = open("datos.txt", "r")', "archivo = open('datos.txt')"],
      "open devuelve un objeto de archivo; r es el modo de lectura predeterminado.",
    ],
    review: [
      "¿Qué ventaja ofrece with open(...)?",
      [
        "Cierra el archivo automáticamente",
        "Duplica el archivo",
        "Lo convierte en lista",
        "Evita usar rutas",
      ],
      "Cierra el archivo automáticamente",
      "El administrador de contexto garantiza el cierre del recurso.",
    ],
  },
  {
    topic: "Archivos - Expedición de datos",
    lesson: "Escribe recuerdos",
    skill: "escritura de archivos",
    concept: [
      "¿Qué modo reemplaza el contenido de un archivo?",
      ["w", "a", "r", "rb"],
      "w",
      "El modo w escribe desde cero y trunca un archivo existente.",
    ],
    prediction: [
      "texto = 'Py'\ntexto += 'learn'\nprint(texto)",
      "Pylearn",
      "El operador += concatena el nuevo texto al anterior.",
    ],
    fill: [
      "with open('log.txt', '___') as archivo:\n    archivo.write('Nuevo evento\\n')",
      ["a", "r", "rb", "read"],
      "a",
      "a agrega contenido al final sin borrar lo anterior.",
    ],
    select: [
      "¿Qué acciones son buenas prácticas al escribir archivos?",
      [
        "Usar encoding explícito",
        "Usar with",
        "Comprobar errores",
        "Dejar siempre el archivo abierto",
      ],
      ["Usar encoding explícito", "Usar with", "Comprobar errores"],
      "Estas prácticas hacen la escritura más predecible y segura.",
    ],
    order: [
      "Guarda una puntuación.",
      [
        "puntuacion = 120",
        "with open('score.txt', 'w') as archivo:",
        "    archivo.write(str(puntuacion))",
      ],
      "El número se prepara, se abre el archivo y se convierte a texto antes de escribir.",
    ],
    bug: [
      "¿Qué línea intenta escribir un entero directamente?",
      [
        "puntos = 100",
        "with open('score.txt', 'w') as archivo:",
        "    archivo.write(puntos)",
      ],
      "    archivo.write(puntos)",
      "write espera una cadena; usa str(puntos).",
    ],
    code: [
      "Escribe la línea que agrega 'OK' a log.txt usando with.",
      "with open('log.txt', 'a') as archivo: archivo.write('OK')",
      ['with open("log.txt", "a") as archivo:\n    archivo.write("OK")'],
      "El modo a conserva el contenido previo y with se ocupa del cierre.",
    ],
    review: [
      "¿Qué devuelve write normalmente?",
      [
        "Cantidad de caracteres escritos",
        "El archivo completo",
        "Siempre None",
        "Una lista",
      ],
      "Cantidad de caracteres escritos",
      "write informa cuántos caracteres pudo escribir.",
    ],
  },
  {
    topic: "Módulos - Caja de herramientas",
    lesson: "Importaciones claras",
    skill: "import",
    concept: [
      "¿Cómo importas todo el módulo math?",
      ["import math", "include math", "from math", "using math"],
      "import math",
      "import math deja sus funciones bajo el nombre math.",
    ],
    prediction: [
      "import math\nprint(math.floor(4.9))",
      "4",
      "floor redondea hacia abajo al entero menor.",
    ],
    fill: [
      "___ math import sqrt\nprint(sqrt(25))",
      ["from", "import", "use", "with"],
      "from",
      "from módulo import nombre trae un elemento específico.",
    ],
    select: [
      "¿Cuáles son importaciones válidas?",
      [
        "import math",
        "from random import randint",
        "import datetime as dt",
        "using pathlib",
      ],
      ["import math", "from random import randint", "import datetime as dt"],
      "Python admite import, from ... import y alias con as.",
    ],
    order: [
      "Importa y usa pi.",
      [
        "from math import pi",
        "radio = 2",
        "area = pi * radio ** 2",
        "print(area)",
      ],
      "La importación debe estar disponible antes del cálculo.",
    ],
    bug: [
      "¿Qué línea usa sqrt sin importarlo?",
      ["import math", "numero = 16", "print(sqrt(numero))"],
      "print(sqrt(numero))",
      "Con import math debes llamar math.sqrt(numero).",
    ],
    code: [
      "Importa random con el alias rnd.",
      "import random as rnd",
      [],
      "as crea un alias local para el módulo.",
    ],
    review: [
      "¿Qué mejora un alias?",
      [
        "Acorta un nombre largo con claridad",
        "Instala el módulo",
        "Evita todos los errores",
        "Hace privada la librería",
      ],
      "Acorta un nombre largo con claridad",
      "Los alias resultan útiles cuando son convencionales y legibles.",
    ],
  },
  {
    topic: "Módulos - Caja de herramientas",
    lesson: "Biblioteca estándar",
    skill: "módulos estándar",
    concept: [
      "¿Qué módulo trabaja con rutas de archivos de forma moderna?",
      ["pathlib", "random", "statistics", "decimal"],
      "pathlib",
      "pathlib representa rutas mediante objetos Path.",
    ],
    prediction: [
      "from statistics import mean\nprint(mean([2, 4, 6]))",
      "4",
      "La media de 2, 4 y 6 es 4.",
    ],
    fill: [
      "from random import ___\nprint(randint(1, 6))",
      ["randint", "mean", "Path", "sqrt"],
      "randint",
      "randint genera un entero dentro del intervalo inclusivo.",
    ],
    select: [
      "Relaciona módulos con usos válidos.",
      [
        "datetime: fechas",
        "statistics: promedios",
        "random: azar",
        "math: archivos JSON",
      ],
      ["datetime: fechas", "statistics: promedios", "random: azar"],
      "Cada módulo estándar agrupa herramientas de un dominio concreto.",
    ],
    order: [
      "Calcula una media.",
      [
        "from statistics import mean",
        "notas = [14, 16, 18]",
        "promedio = mean(notas)",
        "print(promedio)",
      ],
      "Importa la función antes de invocarla con la lista.",
    ],
    bug: [
      "¿Qué importación no coincide con el uso?",
      [
        "from pathlib import Path",
        "ruta = Path('datos.txt')",
        "promedio = Path.mean([1, 2])",
      ],
      "promedio = Path.mean([1, 2])",
      "mean pertenece a statistics, no a Path.",
    ],
    code: [
      "Importa la clase Path desde pathlib.",
      "from pathlib import Path",
      [],
      "Esta forma permite usar Path directamente.",
    ],
    review: [
      "¿La biblioteca estándar requiere instalar cada módulo con pip?",
      ["No", "Sí, siempre", "Solo math", "Solo en Windows"],
      "No",
      "Sus módulos se distribuyen junto con Python.",
    ],
  },
  {
    topic: "POO - Academia de objetos",
    lesson: "Tu primera clase",
    skill: "clases",
    concept: [
      "¿Qué palabra define una clase?",
      ["class", "object", "def", "new"],
      "class",
      "class inicia la definición de un nuevo tipo.",
    ],
    prediction: [
      "class Mascota:\n    especie = 'serpiente'\nprint(Mascota.especie)",
      "serpiente",
      "especie es un atributo de clase accesible desde Mascota.",
    ],
    fill: [
      "___ Mascota:\n    energia = 100",
      ["class", "def", "new", "type"],
      "class",
      "La palabra class crea la plantilla del objeto.",
    ],
    select: [
      "¿Qué puede contener una clase?",
      ["Atributos", "Métodos", "Docstrings", "Solo números"],
      ["Atributos", "Métodos", "Docstrings"],
      "Una clase puede agrupar estado, comportamiento y documentación.",
    ],
    order: [
      "Crea e instancia una clase vacía.",
      [
        "class Robot:",
        "    pass",
        "ayudante = Robot()",
        "print(type(ayudante))",
      ],
      "Primero se define la clase y después se llama para crear la instancia.",
    ],
    bug: [
      "¿Qué línea intenta instanciar una clase inexistente?",
      ["class Robot:", "    pass", "r = Robots()"],
      "r = Robots()",
      "El nombre definido es Robot, sin s final.",
    ],
    code: [
      "Define una clase vacía llamada Curso.",
      "class Curso: pass",
      ["class Curso:\n    pass"],
      "pass permite dejar temporalmente vacío el cuerpo de la clase.",
    ],
    review: [
      "¿Qué es una instancia?",
      [
        "Un objeto creado a partir de una clase",
        "Una importación",
        "Un comentario",
        "Un tipo de bucle",
      ],
      "Un objeto creado a partir de una clase",
      "La clase es la plantilla; la instancia es el objeto concreto.",
    ],
  },
  {
    topic: "POO - Academia de objetos",
    lesson: "Construye con __init__",
    skill: "inicialización",
    concept: [
      "¿Cuándo se ejecuta __init__?",
      [
        "Al crear una instancia",
        "Al importar math",
        "Al terminar un bucle",
        "Al borrar una variable",
      ],
      "Al crear una instancia",
      "__init__ configura el estado inicial del objeto.",
    ],
    prediction: [
      "class Heroe:\n    def __init__(self, nombre):\n        self.nombre = nombre\nh = Heroe('Pylearn')\nprint(h.nombre)",
      "Pylearn",
      "El argumento se guarda en el atributo nombre de la instancia.",
    ],
    fill: [
      "class Punto:\n    def __init__(___, x):\n        self.x = x",
      ["self", "this", "obj", "class"],
      "self",
      "Por convención, self referencia la instancia actual.",
    ],
    select: [
      "¿Cuáles afirmaciones sobre self son correctas?",
      [
        "Referencia la instancia",
        "Permite acceder a atributos",
        "Debe ser el primer parámetro de métodos de instancia",
        "Es una palabra reservada obligatoria",
      ],
      [
        "Referencia la instancia",
        "Permite acceder a atributos",
        "Debe ser el primer parámetro de métodos de instancia",
      ],
      "self es una convención necesaria en la firma, aunque su nombre no sea palabra reservada.",
    ],
    order: [
      "Crea un jugador con nombre.",
      [
        "class Jugador:",
        "    def __init__(self, nombre):",
        "        self.nombre = nombre",
        "jugador = Jugador('Ana')",
      ],
      "La inicialización vive dentro de la clase y la instancia recibe el argumento.",
    ],
    bug: [
      "¿Qué línea olvidó self?",
      ["class Cuenta:", "    def __init__(saldo):", "        saldo.valor = 0"],
      "    def __init__(saldo):",
      "Aunque el nombre puede variar, esa firma no acepta el argumento saldo adicional esperado; debe ser def __init__(self, saldo) para ese diseño.",
    ],
    code: [
      "Escribe la asignación que guarda el parámetro nivel como atributo.",
      "self.nivel = nivel",
      [],
      "Los atributos de instancia se asignan sobre self.",
    ],
    review: [
      "¿Dónde vive un atributo propio de cada objeto?",
      ["En self", "En import", "En return", "En except"],
      "En self",
      "self.atributo mantiene un valor independiente por instancia.",
    ],
  },
  {
    topic: "POO - Academia de objetos",
    lesson: "Métodos con personalidad",
    skill: "métodos",
    concept: [
      "¿Qué recibe primero un método de instancia?",
      ["self", "class", "return", "new"],
      "self",
      "self permite al método leer y modificar su objeto.",
    ],
    prediction: [
      "class Contador:\n    def __init__(self):\n        self.valor = 0\n    def subir(self):\n        self.valor += 1\nc = Contador()\nc.subir()\nprint(c.valor)",
      "1",
      "subir modifica el atributo valor del objeto c.",
    ],
    fill: [
      "class Saludo:\n    def mensaje(self):\n        ___ 'Hola'",
      ["return", "print =", "yield from", "class"],
      "return",
      "return entrega el texto al código que llama al método.",
    ],
    select: [
      "¿Qué pueden hacer los métodos de instancia?",
      [
        "Leer atributos",
        "Cambiar atributos",
        "Recibir argumentos",
        "Existir sin clase",
      ],
      ["Leer atributos", "Cambiar atributos", "Recibir argumentos"],
      "Los métodos modelan comportamientos de los objetos de una clase.",
    ],
    order: [
      "Crea y usa un método.",
      [
        "class Luz:",
        "    def encender(self):",
        "        return 'on'",
        "lampara = Luz()",
        "print(lampara.encender())",
      ],
      "La clase se define antes de instanciarla y llamar su método.",
    ],
    bug: [
      "¿Qué llamada olvida los paréntesis?",
      ["robot = Robot()", "resultado = robot.saludar", "print(resultado)"],
      "resultado = robot.saludar",
      "Sin paréntesis se guarda el método, no su resultado.",
    ],
    code: [
      "Dentro de una clase, define un método duplicar que devuelva self.valor * 2.",
      "def duplicar(self): return self.valor * 2",
      ["def duplicar(self):\n    return self.valor * 2"],
      "El método usa el estado actual y devuelve el doble.",
    ],
    review: [
      "¿Qué diferencia hay entre atributo y método?",
      [
        "El atributo guarda estado y el método define comportamiento",
        "No existe diferencia",
        "El método solo guarda texto",
        "El atributo siempre es función",
      ],
      "El atributo guarda estado y el método define comportamiento",
      "Estado y comportamiento se agrupan dentro del objeto.",
    ],
  },
  {
    topic: "POO - Academia de objetos",
    lesson: "Herencia de poderes",
    skill: "herencia",
    concept: [
      "¿Cómo declaras que Perro hereda de Animal?",
      [
        "class Perro(Animal):",
        "class Perro -> Animal:",
        "class Perro inherits Animal:",
        "Animal class Perro:",
      ],
      "class Perro(Animal):",
      "La clase base se coloca entre paréntesis.",
    ],
    prediction: [
      "class Animal:\n    def hablar(self):\n        return 'sonido'\nclass Gato(Animal):\n    pass\nprint(Gato().hablar())",
      "sonido",
      "Gato hereda el método hablar de Animal.",
    ],
    fill: [
      "class Vehiculo:\n    pass\nclass Bicicleta(___):\n    pass",
      ["Vehiculo", "self", "super", "object()"],
      "Vehiculo",
      "La clase padre se escribe entre paréntesis en la definición.",
    ],
    select: [
      "¿Qué permite la herencia?",
      [
        "Reutilizar comportamiento",
        "Especializar una clase",
        "Sobrescribir métodos",
        "Eliminar la sintaxis de Python",
      ],
      [
        "Reutilizar comportamiento",
        "Especializar una clase",
        "Sobrescribir métodos",
      ],
      "La clase hija puede reutilizar y adaptar lo recibido.",
    ],
    order: [
      "Especializa un saludo.",
      [
        "class Animal:",
        "    def hablar(self): return '...'",
        "class Perro(Animal):",
        "    def hablar(self): return 'guau'",
        "print(Perro().hablar())",
      ],
      "La clase base debe existir antes de la clase hija.",
    ],
    bug: [
      "¿Qué clase padre no está definida?",
      ["class Animal:", "    pass", "class Gato(Mascota):", "    pass"],
      "class Gato(Mascota):",
      "Mascota no fue definida; la clase disponible se llama Animal.",
    ],
    code: [
      "Define Mago como clase hija de Heroe.",
      "class Mago(Heroe): pass",
      ["class Mago(Heroe):\n    pass"],
      "Colocar Heroe entre paréntesis establece la herencia.",
    ],
    review: [
      "¿Qué función accede a la implementación de la clase padre?",
      ["super", "parent", "base", "inherit"],
      "super",
      "super() permite llamar métodos de la clase base.",
    ],
  },
  {
    topic: "Comprensiones - Atajos pythónicos",
    lesson: "Listas en una línea",
    skill: "list comprehensions",
    concept: [
      "¿Qué crea [x * 2 for x in numeros]?",
      ["Una lista", "Un diccionario", "Una función", "Un archivo"],
      "Una lista",
      "La comprensión evalúa una expresión por cada elemento.",
    ],
    prediction: [
      "cuadrados = [n ** 2 for n in range(4)]\nprint(cuadrados)",
      "[0, 1, 4, 9]",
      "range(4) produce 0, 1, 2 y 3; después cada valor se eleva al cuadrado.",
    ],
    fill: [
      "pares = [n for n in range(8) ___ n % 2 == 0]",
      ["if", "when", "and", "where"],
      "if",
      "El filtro opcional se coloca después del recorrido.",
    ],
    select: [
      "¿Qué partes puede tener una list comprehension?",
      ["Expresión", "for", "Filtro if", "Bloque except obligatorio"],
      ["Expresión", "for", "Filtro if"],
      "La forma combina transformación, recorrido y un filtro opcional.",
    ],
    order: [
      "Construye una comprensión de longitudes.",
      [
        "nombres = ['Ana', 'Pylearn']",
        "largos = [len(nombre) for nombre in nombres]",
        "print(largos)",
      ],
      "La colección debe existir antes de recorrerla.",
    ],
    bug: [
      "¿Qué comprensión tiene el orden incorrecto?",
      [
        "numeros = [1, 2, 3]",
        "dobles = [for n in numeros n * 2]",
        "print(dobles)",
      ],
      "dobles = [for n in numeros n * 2]",
      "La expresión va antes de for: [n * 2 for n in numeros].",
    ],
    code: [
      "Crea una lista cuadrados con n ** 2 para n en range(5).",
      "cuadrados = [n ** 2 for n in range(5)]",
      ["cuadrados = [n*n for n in range(5)]"],
      "La comprensión expresa la transformación y el recorrido con claridad.",
    ],
    review: [
      "¿Cuándo conviene evitar una comprensión?",
      [
        "Cuando la lógica se vuelve difícil de leer",
        "Siempre",
        "Cuando hay una sola transformación",
        "Cuando crea una lista",
      ],
      "Cuando la lógica se vuelve difícil de leer",
      "La legibilidad sigue siendo más importante que ahorrar líneas.",
    ],
  },
  {
    topic: "Comprensiones - Atajos pythónicos",
    lesson: "Diccionarios y conjuntos rápidos",
    skill: "dict y set comprehensions",
    concept: [
      "¿Qué crea {n: n ** 2 for n in range(3)}?",
      ["Un diccionario", "Un conjunto", "Una tupla", "Una cadena"],
      "Un diccionario",
      "Los dos puntos separan la clave y el valor.",
    ],
    prediction: [
      "iniciales = {nombre[0] for nombre in ['Ana', 'Luis', 'Alba']}\nprint(len(iniciales))",
      "2",
      "Las iniciales únicas son A y L.",
    ],
    fill: [
      "mapa = {n: n * 10 ___ n in range(3)}",
      ["for", "if", "while", "from"],
      "for",
      "La comprensión de diccionario usa clave: valor seguido del recorrido.",
    ],
    select: [
      "¿Cuáles expresiones son comprensiones válidas?",
      [
        "{x for x in datos}",
        "{x: len(x) for x in nombres}",
        "[x for x in datos]",
        "{for x in datos}",
      ],
      [
        "{x for x in datos}",
        "{x: len(x) for x in nombres}",
        "[x for x in datos]",
      ],
      "El elemento o la pareja clave:valor debe aparecer antes de for.",
    ],
    order: [
      "Crea un mapa de longitudes.",
      [
        "palabras = ['sol', 'planeta']",
        "longitudes = {p: len(p) for p in palabras}",
        "print(longitudes['sol'])",
      ],
      "Primero se crea la fuente y después el diccionario derivado.",
    ],
    bug: [
      "¿Qué línea mezcla incorrectamente la sintaxis?",
      [
        "datos = ['a', 'bb']",
        "largos = {p, len(p) for p in datos}",
        "print(largos)",
      ],
      "largos = {p, len(p) for p in datos}",
      "Un diccionario necesita dos puntos: {p: len(p) for p in datos}.",
    ],
    code: [
      "Crea un set llamado pares con los pares de range(10).",
      "pares = {n for n in range(10) if n % 2 == 0}",
      [],
      "Las llaves sin pareja clave:valor forman un set comprehension.",
    ],
    review: [
      "¿Qué distingue un dict comprehension de uno de set?",
      [
        "La pareja clave: valor",
        "El uso de for",
        "Los corchetes",
        "El nombre de la variable",
      ],
      "La pareja clave: valor",
      "Los dos puntos indican que se construye un diccionario.",
    ],
  },
  {
    topic: "Algoritmos - Desafíos de lógica",
    lesson: "Busca con estrategia",
    skill: "búsqueda",
    concept: [
      "¿Qué devuelve normalmente list.index(valor)?",
      [
        "La posición del valor",
        "El valor duplicado",
        "True siempre",
        "La lista ordenada",
      ],
      "La posición del valor",
      "index busca la primera aparición y devuelve su índice.",
    ],
    prediction: [
      "numeros = [4, 9, 2, 9]\nprint(numeros.index(9))",
      "1",
      "La primera aparición de 9 está en el índice 1.",
    ],
    fill: [
      "encontrado = objetivo ___ datos",
      ["in", "inside", "has", "at"],
      "in",
      "in comprueba pertenencia y devuelve un booleano.",
    ],
    select: [
      "¿Qué opciones pueden buscar un elemento?",
      ["in", "index", "un bucle for", "append"],
      ["in", "index", "un bucle for"],
      "append agrega elementos; las demás opciones permiten localizar o comprobar.",
    ],
    order: [
      "Busca manualmente un objetivo.",
      [
        "posicion = -1",
        "for i, valor in enumerate(datos):",
        "    if valor == objetivo:",
        "        posicion = i",
        "        break",
      ],
      "Se prepara el valor por defecto, se recorre con índices y se detiene al encontrar.",
    ],
    bug: [
      "¿Qué línea compara el índice en lugar del valor?",
      [
        "for i, valor in enumerate(datos):",
        "    if i == objetivo:",
        "        print('Encontrado')",
      ],
      "    if i == objetivo:",
      "La búsqueda pretende comparar valor con objetivo.",
    ],
    code: [
      "Escribe una expresión que indique si objetivo está en datos.",
      "objetivo in datos",
      [],
      "El operador in comunica la intención directamente.",
    ],
    review: [
      "¿Por qué usar break después de encontrar?",
      [
        "Evita recorrer elementos innecesarios",
        "Borra la lista",
        "Ordena los datos",
        "Crea otro bucle",
      ],
      "Evita recorrer elementos innecesarios",
      "Una vez hallado el objetivo, continuar puede ser trabajo desperdiciado.",
    ],
  },
  {
    topic: "Algoritmos - Desafíos de lógica",
    lesson: "Ordena el inventario",
    skill: "ordenamiento",
    concept: [
      "¿Qué función devuelve una nueva lista ordenada?",
      ["sorted", "sort", "order", "arrange"],
      "sorted",
      "sorted acepta cualquier iterable y devuelve una lista nueva.",
    ],
    prediction: [
      "datos = [3, 1, 2]\nordenados = sorted(datos, reverse=True)\nprint(ordenados)",
      "[3, 2, 1]",
      "reverse=True solicita orden descendente.",
    ],
    fill: [
      "nombres = ['Luz', 'Alejandro', 'Sol']\nprint(sorted(nombres, key=___))",
      ["len", "size", "count", "length"],
      "len",
      "key=len ordena usando la longitud de cada texto.",
    ],
    select: [
      "¿Qué afirmaciones son correctas?",
      [
        "sorted devuelve una lista nueva",
        "list.sort modifica la lista",
        "reverse=True invierte el criterio",
        "sort funciona en cualquier string",
      ],
      [
        "sorted devuelve una lista nueva",
        "list.sort modifica la lista",
        "reverse=True invierte el criterio",
      ],
      "sort es un método de listas; sorted es una función más general.",
    ],
    order: [
      "Ordena productos por precio.",
      [
        "productos = [('A', 30), ('B', 10)]",
        "ordenados = sorted(productos, key=lambda item: item[1])",
        "print(ordenados[0][0])",
      ],
      "Primero existen los datos, después se ordenan por el segundo elemento.",
    ],
    bug: [
      "¿Qué línea espera un resultado de sort()?",
      ["datos = [3, 1]", "resultado = datos.sort()", "print(resultado[0])"],
      "print(resultado[0])",
      "sort modifica datos y devuelve None; resultado no es una lista.",
    ],
    code: [
      "Ordena numeros de mayor a menor y guarda el resultado en ordenados.",
      "ordenados = sorted(numeros, reverse=True)",
      [],
      "sorted con reverse conserva la lista original.",
    ],
    review: [
      "¿Qué usa key en sorted?",
      [
        "Una función que calcula el criterio",
        "Una contraseña",
        "El primer elemento siempre",
        "Un nombre de archivo",
      ],
      "Una función que calcula el criterio",
      "Python aplica esa función a cada elemento para decidir el orden.",
    ],
  },
  {
    topic: "Algoritmos - Desafíos de lógica",
    lesson: "Piensa recursivamente",
    skill: "recursión",
    concept: [
      "¿Qué evita que una función recursiva continúe para siempre?",
      [
        "El caso base",
        "Un import",
        "Una lista vacía siempre",
        "El nombre de la función",
      ],
      "El caso base",
      "El caso base devuelve un resultado sin hacer otra llamada recursiva.",
    ],
    prediction: [
      "def cuenta(n):\n    if n == 0:\n        return 0\n    return 1 + cuenta(n - 1)\nprint(cuenta(3))",
      "3",
      "La función suma uno durante tres llamadas hasta llegar al caso base.",
    ],
    fill: [
      "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n ___ 1)",
      ["-", "+", "*", "/"],
      "-",
      "Cada llamada debe acercarse al caso base reduciendo n.",
    ],
    select: [
      "Una función recursiva segura suele necesitar...",
      [
        "Un caso base",
        "Progreso hacia ese caso",
        "Una llamada a sí misma",
        "Un bucle infinito",
      ],
      ["Un caso base", "Progreso hacia ese caso", "Una llamada a sí misma"],
      "Estas tres partes hacen que el proceso termine y produzca un resultado.",
    ],
    order: [
      "Construye una suma recursiva.",
      [
        "def suma_hasta(n):",
        "    if n <= 0:",
        "        return 0",
        "    return n + suma_hasta(n - 1)",
      ],
      "El caso base aparece antes de la llamada recursiva.",
    ],
    bug: [
      "¿Qué línea se aleja del caso base?",
      ["def bajar(n):", "    if n == 0: return", "    bajar(n + 1)"],
      "    bajar(n + 1)",
      "Si n es positivo, sumar uno nunca lo acerca a cero.",
    ],
    code: [
      "Escribe el caso base que devuelve 1 cuando n <= 1.",
      "if n <= 1: return 1",
      ["if n <= 1:\n    return 1"],
      "El caso base detiene las llamadas para los valores mínimos.",
    ],
    review: [
      "¿Qué riesgo tiene una recursión sin final?",
      ["RecursionError", "FileNotFoundError", "KeyError siempre", "Ninguno"],
      "RecursionError",
      "Python limita la profundidad de llamadas para proteger la ejecución.",
    ],
  },
  {
    topic: "Proyecto final - Pylearn Quest",
    lesson: "Validador de expediciones",
    skill: "integración de conceptos",
    concept: [
      "¿Qué conviene hacer antes de procesar datos externos?",
      [
        "Validarlos",
        "Suponer que siempre son correctos",
        "Borrarlos",
        "Convertir todo en None",
      ],
      "Validarlos",
      "La validación evita que entradas incompletas o incorrectas dañen el flujo.",
    ],
    prediction: [
      "registro = {'nombre': 'Pylearn', 'nivel': 5}\nvalido = 'nombre' in registro and registro['nivel'] > 0\nprint(valido)",
      "True",
      "Las dos condiciones se cumplen.",
    ],
    fill: [
      "def validar(datos):\n    if 'nombre' not in datos:\n        ___ ValueError('Falta nombre')\n    return True",
      ["raise", "except", "print", "yield"],
      "raise",
      "El validador comunica el dato faltante con una excepción.",
    ],
    select: [
      "¿Qué mejora un validador?",
      [
        "Mensajes claros",
        "Comprobaciones específicas",
        "Pruebas con entradas límite",
        "Capturar todo sin informar",
      ],
      [
        "Mensajes claros",
        "Comprobaciones específicas",
        "Pruebas con entradas límite",
      ],
      "Un buen validador explica el problema y cubre casos normales y extremos.",
    ],
    order: [
      "Valida y guarda un registro.",
      [
        "datos = {'nombre': 'Ana'}",
        "if 'nombre' not in datos:",
        "    raise ValueError('Falta nombre')",
        "registros.append(datos)",
      ],
      "Solo se guarda el registro después de superar la validación.",
    ],
    bug: [
      "¿Qué línea accede antes de comprobar?",
      ["nivel = datos['nivel']", "if 'nivel' not in datos:", "    nivel = 1"],
      "nivel = datos['nivel']",
      "El acceso puede lanzar KeyError antes de llegar a la comprobación.",
    ],
    code: [
      "Escribe una expresión que sea True si nombre existe en datos y no está vacío.",
      "'nombre' in datos and bool(datos['nombre'])",
      ["'nombre' in datos and datos['nombre'] != ''"],
      "Primero se comprueba la clave; el cortocircuito evita un KeyError.",
    ],
    review: [
      "¿Qué prueba un caso límite?",
      [
        "Valores en los extremos o situaciones poco comunes",
        "Solo el caso más sencillo",
        "El color de la interfaz",
        "La velocidad de internet",
      ],
      "Valores en los extremos o situaciones poco comunes",
      "Los límites suelen descubrir errores que un ejemplo normal no muestra.",
    ],
  },
  {
    topic: "Proyecto final - Pylearn Quest",
    lesson: "Motor de aventuras",
    skill: "diseño de programas",
    concept: [
      "¿Qué ayuda a dividir un programa grande?",
      [
        "Funciones con una responsabilidad",
        "Una sola línea enorme",
        "Variables sin nombre",
        "Duplicar código",
      ],
      "Funciones con una responsabilidad",
      "Las funciones pequeñas permiten entender, probar y reutilizar cada parte.",
    ],
    prediction: [
      "def recompensa(nivel):\n    return nivel * 10\nmisiones = [1, 3, 2]\nprint(sum(recompensa(n) for n in misiones))",
      "60",
      "Las recompensas son 10, 30 y 20; sumadas dan 60.",
    ],
    fill: [
      "def cargar_jugador(nombre):\n    return {'nombre': nombre, 'xp': 0}\n\njugador = cargar_jugador(___)",
      ["'Pylearn'", "Pylearn", "nombre =", "return"],
      "'Pylearn'",
      "La función espera un texto como argumento.",
    ],
    select: [
      "¿Qué componentes mejoran un proyecto?",
      [
        "Funciones pequeñas",
        "Nombres descriptivos",
        "Manejo de errores",
        "Código repetido",
      ],
      ["Funciones pequeñas", "Nombres descriptivos", "Manejo de errores"],
      "La estructura clara reduce errores y facilita futuras mejoras.",
    ],
    order: [
      "Ejecuta una misión completa.",
      [
        "jugador = crear_jugador('Pylearn')",
        "mision = elegir_mision(jugador)",
        "resultado = jugar(mision)",
        "actualizar(jugador, resultado)",
        "guardar(jugador)",
      ],
      "El flujo prepara al jugador, juega, actualiza el estado y finalmente lo guarda.",
    ],
    bug: [
      "¿Qué línea llama una variable como si fuera función?",
      ["puntos = 100", "bono = 20", "total = puntos(bono)"],
      "total = puntos(bono)",
      "Para sumar los valores debe usarse puntos + bono.",
    ],
    code: [
      "Define una función total_xp que devuelva la suma de la clave 'xp' de cada jugador.",
      "def total_xp(jugadores): return sum(j['xp'] for j in jugadores)",
      [
        "def total_xp(jugadores):\n    return sum(jugador['xp'] for jugador in jugadores)",
      ],
      "La función generadora extrae cada XP y sum calcula el total.",
    ],
    review: [
      "¿Qué debería hacer una función llamada guardar_partida?",
      [
        "Guardar el estado de la partida",
        "Dibujar toda la interfaz",
        "Calcular cualquier cosa",
        "Cambiar su nombre",
      ],
      "Guardar el estado de la partida",
      "El nombre y la responsabilidad de una función deben coincidir.",
    ],
  },
];

export const academyExpansion: ExerciseData[] = lessons.flatMap(buildLesson);

const capstoneBlueprint = lessons[lessons.length - 1];

academyExpansion.push(
  createExercise(capstoneBlueprint, lessons.length, {
    title: "Pylearn Quest: diseña el inventario",
    description: "Elige las estructuras apropiadas para el proyecto final.",
    type: "multiple_select",
    question:
      "¿Qué estructuras encajan en un inventario con cantidades por objeto?",
    options: [
      "Un diccionario objeto: cantidad",
      "Una lista para conservar el orden visual",
      "Una variable separada por cada objeto",
      "Un set si solo importa la posesión",
    ],
    correctAnswer: JSON.stringify([
      "Un diccionario objeto: cantidad",
      "Una lista para conservar el orden visual",
      "Un set si solo importa la posesión",
    ]),
    explanation:
      "La estructura depende de la necesidad: cantidades, orden o pertenencia. Variables sueltas no escalan.",
    hint: "Piensa qué información debe representar cada colección.",
  }),
  createExercise(capstoneBlueprint, lessons.length, {
    title: "Pylearn Quest: reconstruye la batalla",
    description: "Ordena el flujo de una ronda del juego.",
    type: "order",
    question: "Coloca las acciones en un orden seguro.",
    options: [
      "daño = calcular_ataque(jugador)",
      "enemigo['vida'] -= daño",
      "if enemigo['vida'] <= 0:",
      "    entregar_recompensa(jugador)",
    ],
    correctAnswer: JSON.stringify([
      "daño = calcular_ataque(jugador)",
      "enemigo['vida'] -= daño",
      "if enemigo['vida'] <= 0:",
      "    entregar_recompensa(jugador)",
    ]),
    explanation:
      "Primero se calcula el daño, luego se aplica y finalmente se comprueba el resultado.",
    hint: "Una condición solo puede evaluar el estado después de actualizarlo.",
  }),
  createExercise(capstoneBlueprint, lessons.length, {
    title: "Pylearn Quest: función de progreso",
    description: "Escribe una pieza reutilizable del proyecto final.",
    type: "code",
    question:
      "Define subir_nivel(jugador) para aumentar jugador['nivel'] en 1.",
    correctAnswer: "def subir_nivel(jugador): jugador['nivel'] += 1",
    acceptedAnswers: [
      "def subir_nivel(jugador):\n    jugador['nivel'] = jugador['nivel'] + 1",
      "def subir_nivel(jugador):\n    jugador['nivel'] += 1",
    ],
    explanation:
      "La función recibe el estado mutable del jugador y actualiza únicamente su nivel.",
    hint: "Puedes usar el operador +=.",
  }),
  createExercise(capstoneBlueprint, lessons.length, {
    title: "Pylearn Quest: misión completada",
    description: "Último control antes de obtener la insignia de la academia.",
    type: "multiple_choice",
    question:
      "¿Cuál es la mejor señal de que un programa está bien estructurado?",
    options: [
      "Cada parte tiene una responsabilidad clara y puede probarse",
      "Tiene el menor número posible de líneas",
      "Usa todas las funciones de Python",
      "Nunca muestra mensajes de error",
    ],
    correctAnswer:
      "Cada parte tiene una responsabilidad clara y puede probarse",
    explanation:
      "La claridad, las responsabilidades pequeñas y las pruebas permiten mantener el programa con confianza.",
    hint: "Piensa en lo que facilitará corregir y ampliar el proyecto.",
  }),
);

if (academyExpansion.length !== 188) {
  throw new Error(
    `La expansión de la academia debe contener 188 ejercicios, contiene ${academyExpansion.length}`,
  );
}
