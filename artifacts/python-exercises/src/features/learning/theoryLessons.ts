export interface TheoryQuiz {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface TheoryLesson {
  emoji: string;
  title: string;
  objective: string;
  prerequisite: string;
  analogyTitle: string;
  analogy: string;
  essentials: string[];
  code: string;
  trace: string[];
  output: string;
  mistake: string;
  correction: string;
  why: string;
  deepDive: string;
  quiz: TheoryQuiz;
  challenge: string;
  recap: string[];
}

export interface TheoryLessonContext {
  topic: string;
  exerciseTitle?: string;
  description?: string;
  question?: string;
  explanation?: string;
  hint?: string;
}

const LESSONS: Record<string, TheoryLesson> = {
  variables: {
    emoji: "📦",
    title: "Variables: datos con nombre",
    objective:
      "Guardar, consultar y actualizar valores sin perder de vista qué representa cada uno.",
    prerequisite: "Reconocer números, texto y la función print().",
    analogyTitle: "Cajones con etiquetas",
    analogy:
      "Una variable se parece a una etiqueta pegada a un dato. La etiqueta permite encontrarlo después y puede apuntar a un valor nuevo cuando la reasignas.",
    essentials: [
      "El nombre va a la izquierda de =.",
      "El valor se evalúa antes de guardarse.",
      "Usa nombres descriptivos en snake_case.",
    ],
    code: `monedas = 10
monedas += 5
mensaje = f"Ahora tienes {monedas} monedas"
print(mensaje)`,
    trace: [
      "monedas comienza con 10.",
      "+= toma el valor actual y suma 5.",
      "La f-string inserta el nuevo valor en el mensaje.",
      "print() muestra el texto construido.",
    ],
    output: "Ahora tienes 15 monedas",
    mistake: `edad = "16"
proxima_edad = edad + 1`,
    correction: `edad = int("16")
proxima_edad = edad + 1`,
    why: '"16" es texto. Convertirlo a int permite realizar una suma numérica.',
    deepDive:
      "En Python una variable no es una caja física: es un nombre que referencia un objeto. Por eso el tipo pertenece al valor y una misma variable puede reasignarse.",
    quiz: {
      prompt:
        "Después de ejecutar `puntos = 4` y `puntos *= 3`, ¿qué guarda `puntos`?",
      options: ["7", "12", "43"],
      answer: 1,
      explanation:
        "*= multiplica el valor actual y guarda el resultado: 4 × 3.",
    },
    challenge:
      "Crea las variables `precio` y `cantidad`, calcula el total y forma un mensaje con una f-string.",
    recap: [
      "= asigna",
      "la reasignación actualiza",
      "el tipo del dato determina las operaciones",
    ],
  },
  strings: {
    emoji: "💬",
    title: "Strings: texto que puedes transformar",
    objective:
      "Crear, combinar e inspeccionar texto usando índices, métodos y f-strings.",
    prerequisite: "Saber asignar valores a variables.",
    analogyTitle: "Una tira de caracteres",
    analogy:
      "Imagina un tren: cada vagón contiene un carácter y tiene una posición que empieza en 0. Puedes leer un vagón o tomar varios con slicing.",
    essentials: [
      "El texto vive entre comillas.",
      "Los índices comienzan en 0.",
      "Las f-strings insertan expresiones entre llaves.",
    ],
    code: `nombre = "Ada"
lenguaje = "Python"
mensaje = f"{nombre} aprende {lenguaje.upper()}"
print(mensaje)`,
    trace: [
      "Se crean dos cadenas.",
      "upper() devuelve una versión en mayúsculas.",
      "La f-string combina ambos valores.",
      "print() muestra la nueva cadena.",
    ],
    output: "Ada aprende PYTHON",
    mistake: `edad = 16
mensaje = "Edad: " + edad`,
    correction: `edad = 16
mensaje = f"Edad: {edad}"`,
    why: "No se concatena directamente un string con un entero; la f-string realiza la representación de forma clara.",
    deepDive:
      "Los strings son inmutables: métodos como upper() crean otro string; no alteran el original.",
    quiz: {
      prompt: 'Si `palabra = "PYTHON"`, ¿qué devuelve `palabra[1:4]`?',
      options: ["PYT", "YTH", "YTHO"],
      answer: 1,
      explanation:
        "El inicio se incluye y el final se excluye: posiciones 1, 2 y 3.",
    },
    challenge:
      "Guarda tu nombre y una actividad favorita; crea una frase con f-string y muéstrala en mayúsculas.",
    recap: [
      "índice desde 0",
      "slicing excluye el final",
      "los métodos producen nuevos strings",
    ],
  },
  listas: {
    emoji: "🎒",
    title: "Listas: una colección que cambia",
    objective: "Agrupar valores ordenados y modificarlos con seguridad.",
    prerequisite: "Comprender variables e índices.",
    analogyTitle: "Una mochila con compartimentos",
    analogy:
      "Cada compartimento guarda un elemento y tiene una posición. Puedes añadir, reemplazar o quitar objetos sin crear una variable por cada uno.",
    essentials: [
      "Se escriben entre corchetes.",
      "Mantienen el orden y permiten repetidos.",
      "append() agrega al final.",
    ],
    code: `tareas = ["leer", "practicar"]
tareas.append("descansar")
tareas[0] = "repasar"
print(tareas)`,
    trace: [
      "La lista nace con dos elementos.",
      "append() agrega un tercero.",
      "El índice 0 reemplaza el primer elemento.",
      "Se imprime la lista actualizada.",
    ],
    output: "['repasar', 'practicar', 'descansar']",
    mistake: `colores = ["azul", "verde"]
print(colores[2])`,
    correction: `colores = ["azul", "verde"]
print(colores[1])`,
    why: "Con dos elementos solo existen los índices 0 y 1.",
    deepDive:
      "Una lista es mutable. Si dos variables apuntan a la misma lista, un cambio realizado desde una también se observa desde la otra.",
    quiz: {
      prompt: "¿Qué método añade un elemento al final de una lista?",
      options: ["add()", "append()", "push()"],
      answer: 1,
      explanation:
        "append(valor) modifica la lista y coloca el valor al final.",
    },
    challenge:
      "Crea una lista de tres metas, añade una cuarta y reemplaza la primera por una meta cumplida.",
    recap: ["orden estable", "índices desde 0", "las listas son mutables"],
  },
  bucles: {
    emoji: "🔁",
    title: "Bucles: repetir con propósito",
    objective: "Automatizar repeticiones y saber qué cambia en cada vuelta.",
    prerequisite: "Variables, listas y bloques con sangría.",
    analogyTitle: "Un robot con una ruta",
    analogy:
      "Le entregas al robot una colección y una instrucción. Visita cada elemento una vez y ejecuta el bloque indentado.",
    essentials: [
      "for recorre una secuencia.",
      "while repite mientras una condición sea verdadera.",
      "La sangría define el bloque repetido.",
    ],
    code: `puntos = [3, 5, 2]
total = 0
for punto in puntos:
    total += punto
print(total)`,
    trace: [
      "total comienza en 0.",
      "Primera vuelta: suma 3.",
      "Segunda vuelta: suma 5.",
      "Tercera vuelta: suma 2 y termina.",
    ],
    output: "10",
    mistake: `energia = 3
while energia > 0:
    print(energia)`,
    correction: `energia = 3
while energia > 0:
    print(energia)
    energia -= 1`,
    why: "La condición debe acercarse a ser falsa; de lo contrario aparece un bucle infinito.",
    deepDive:
      "break finaliza el bucle y continue salta a la siguiente vuelta. Úsalos cuando expresen la intención mejor que una condición complicada.",
    quiz: {
      prompt: "¿Cuántas vueltas realiza `for i in range(4)`?",
      options: ["3", "4", "5"],
      answer: 1,
      explanation: "range(4) genera 0, 1, 2 y 3: cuatro valores.",
    },
    challenge:
      "Recorre una lista de precios y acumula únicamente los que sean mayores que cero.",
    recap: [
      "for recorre",
      "while depende de una condición",
      "la sangría es parte de la lógica",
    ],
  },
  funciones: {
    emoji: "⚙️",
    title: "Funciones: herramientas reutilizables",
    objective: "Encapsular una tarea, recibir datos y devolver un resultado.",
    prerequisite: "Variables, operadores y bloques indentados.",
    analogyTitle: "Una máquina con entrada y salida",
    analogy:
      "Los parámetros son ingredientes, el cuerpo es el proceso y return entrega el producto para utilizarlo en otra parte.",
    essentials: [
      "def crea la función.",
      "Los parámetros reciben argumentos.",
      "return devuelve un valor y finaliza la llamada.",
    ],
    code: `def calcular_descuento(precio, porcentaje):
    descuento = precio * porcentaje / 100
    return precio - descuento

final = calcular_descuento(80, 25)
print(final)`,
    trace: [
      "La función se define; todavía no se ejecuta.",
      "La llamada asigna 80 y 25 a los parámetros.",
      "Se calcula el descuento.",
      "return entrega el precio final.",
    ],
    output: "60.0",
    mistake: `def duplicar(numero):
    numero * 2

resultado = duplicar(5)`,
    correction: `def duplicar(numero):
    return numero * 2

resultado = duplicar(5)`,
    why: "Sin return, Python devuelve None de forma implícita.",
    deepDive:
      "Cada llamada crea un ámbito local. Las variables definidas dentro no existen fuera, salvo que su valor se devuelva.",
    quiz: {
      prompt: "¿Qué palabra entrega un valor al código que llamó a la función?",
      options: ["print", "return", "yield from"],
      answer: 1,
      explanation:
        "return devuelve el valor; print solo lo muestra en pantalla.",
    },
    challenge:
      "Escribe una función que reciba base y altura y devuelva el área de un rectángulo.",
    recap: [
      "una responsabilidad",
      "parámetros como entradas",
      "return como salida",
    ],
  },
  diccionarios: {
    emoji: "🗂️",
    title: "Diccionarios: buscar por significado",
    objective: "Modelar datos relacionados mediante pares de clave y valor.",
    prerequisite: "Variables y colecciones básicas.",
    analogyTitle: "Una ficha con campos",
    analogy:
      "En vez de recordar una posición, preguntas por una etiqueta: nombre, edad o nivel. Cada clave conduce a su valor.",
    essentials: [
      "Se escriben con llaves.",
      "Cada clave es única.",
      "get() permite consultar con un valor alternativo.",
    ],
    code: `jugador = {"nombre": "Luna", "puntos": 20}
jugador["puntos"] += 5
nivel = jugador.get("nivel", 1)
print(jugador["puntos"], nivel)`,
    trace: [
      "Se crean dos pares clave-valor.",
      "La clave puntos se actualiza.",
      "nivel no existe, así que get() usa 1.",
      "Se muestran ambos valores.",
    ],
    output: "25 1",
    mistake: `jugador = {"nombre": "Luna"}
print(jugador["nivel"])`,
    correction: `jugador = {"nombre": "Luna"}
print(jugador.get("nivel", 1))`,
    why: "Los corchetes generan KeyError si la clave falta; get() puede proporcionar un valor alternativo.",
    deepDive:
      "Las claves deben ser hashables, por ejemplo strings, números o tuplas inmutables. Una lista no puede ser clave.",
    quiz: {
      prompt: "¿Cuál expresión obtiene la edad sin fallar si no existe?",
      options: ["persona[edad]", 'persona.get("edad", 0)', "persona.age"],
      answer: 1,
      explanation: "get() busca la clave y devuelve 0 cuando no está presente.",
    },
    challenge:
      "Modela un libro con título, autor y páginas; luego actualiza la cantidad de páginas.",
    recap: ["clave → valor", "claves únicas", "get() para consultas seguras"],
  },
  slicing: {
    emoji: "✂️",
    title: "Slicing: seleccionar un tramo",
    objective:
      "Extraer partes de una secuencia controlando inicio, fin y paso.",
    prerequisite: "Índices de strings o listas.",
    analogyTitle: "Marcar un tramo en una regla",
    analogy:
      "El corte comienza en una marca incluida y se detiene antes de la marca final. Un tercer valor indica de cuánto en cuánto avanzar.",
    essentials: [
      "La forma es secuencia[inicio:fin:paso].",
      "fin no se incluye.",
      "Los índices negativos cuentan desde el final.",
    ],
    code: `lenguaje = "PYTHON"
inicio = lenguaje[:3]
pares = lenguaje[::2]
reversa = lenguaje[::-1]
print(inicio, pares, reversa)`,
    trace: [
      ":3 toma posiciones 0, 1 y 2.",
      "::2 avanza de dos en dos.",
      "::-1 recorre hacia atrás.",
    ],
    output: "PYT PTO NOHTYP",
    mistake: `numeros = [10, 20, 30, 40]
centro = numeros[1:3]  # esperar 20, 30 y 40`,
    correction: `numeros = [10, 20, 30, 40]
centro = numeros[1:4]`,
    why: "El índice final es exclusivo; para incluir la posición 3 el fin debe ser 4.",
    deepDive:
      "Omitir límites usa los extremos naturales. Un paso negativo también invierte el sentido de los valores predeterminados.",
    quiz: {
      prompt: "¿Qué obtiene `[0, 1, 2, 3, 4][1:4]`?",
      options: ["[1, 2, 3]", "[1, 2, 3, 4]", "[0, 1, 2, 3]"],
      answer: 0,
      explanation: "Incluye el índice 1 y se detiene antes del índice 4.",
    },
    challenge:
      "Toma una palabra, extrae sus tres últimas letras y crea también su versión invertida.",
    recap: ["inicio incluido", "fin excluido", "paso controla el avance"],
  },
  tipos: {
    emoji: "🧬",
    title: "Tipos: las reglas de cada dato",
    objective:
      "Reconocer el tipo de un valor y convertirlo cuando una operación lo requiera.",
    prerequisite: "Asignación de variables.",
    analogyTitle: "Herramientas para materiales distintos",
    analogy:
      "No usas unas tijeras como martillo. Del mismo modo, cada tipo admite operaciones distintas y Python protege esas reglas.",
    essentials: [
      "int y float representan números.",
      "str representa texto.",
      "type() inspecciona y int(), float(), str() convierten.",
    ],
    code: `entrada = "12"
cantidad = int(entrada)
precio = 2.5
total = cantidad * precio
print(type(total).__name__, total)`,
    trace: [
      "entrada comienza como str.",
      "int() crea un entero.",
      "entero por float produce float.",
      "Se muestra el tipo y el valor.",
    ],
    output: "float 30.0",
    mistake: `cantidad = input("Cantidad: ")
total = cantidad * 2.5`,
    correction: `cantidad = int(input("Cantidad: "))
total = cantidad * 2.5`,
    why: "input() siempre devuelve texto; hay que convertirlo antes del cálculo.",
    deepDive:
      "Python usa tipado dinámico pero fuerte: no declaras el tipo del nombre, aunque las operaciones sí respetan el tipo de cada objeto.",
    quiz: {
      prompt: "¿Qué devuelve `type(3.0).__name__`?",
      options: ["int", "float", "number"],
      answer: 1,
      explanation: "El punto decimal hace que 3.0 sea un float.",
    },
    challenge:
      "Convierte dos entradas de texto a números, súmalas y muestra el tipo del resultado.",
    recap: [
      "input() da str",
      "convierte antes de calcular",
      "type() ayuda a diagnosticar",
    ],
  },
  booleanos: {
    emoji: "🚦",
    title: "Booleanos: decidir con True o False",
    objective:
      "Construir condiciones combinando comparaciones y operadores lógicos.",
    prerequisite: "Variables y operadores de comparación.",
    analogyTitle: "Un semáforo lógico",
    analogy:
      "Una condición responde sí o no. Puedes combinar varias señales con and, or y not para decidir qué camino ejecutar.",
    essentials: [
      "== compara; = asigna.",
      "and exige que ambas condiciones sean verdaderas.",
      "or necesita al menos una y not invierte.",
    ],
    code: `edad = 19
tiene_entrada = True
puede_pasar = edad >= 18 and tiene_entrada
print(puede_pasar)`,
    trace: [
      "19 >= 18 produce True.",
      "tiene_entrada ya es True.",
      "True and True produce True.",
    ],
    output: "True",
    mistake: `edad = 19
if edad = 18:
    print("Puede pasar")`,
    correction: `edad = 19
if edad >= 18:
    print("Puede pasar")`,
    why: "= asigna; una condición necesita un operador de comparación como == o >=.",
    deepDive:
      "and y or cortocircuitan: Python deja de evaluar cuando ya conoce el resultado lógico.",
    quiz: {
      prompt: "¿Qué produce `True and not False`?",
      options: ["True", "False", "None"],
      answer: 0,
      explanation: "not False es True; luego True and True es True.",
    },
    challenge:
      "Crea una condición que permita acceso si el usuario tiene clave y no está bloqueado.",
    recap: ["comparar no es asignar", "and combina requisitos", "not invierte"],
  },
  busqueda: {
    emoji: "🔎",
    title: "Búsqueda: encontrar con intención",
    objective:
      "Comprobar pertenencia y localizar elementos sin recorrer de más.",
    prerequisite: "Listas, strings y condicionales.",
    analogyTitle: "Un índice de biblioteca",
    analogy:
      "Primero decides si necesitas saber si algo existe, dónde está o cuántas veces aparece. Cada pregunta tiene una herramienta distinta.",
    essentials: [
      "in comprueba pertenencia.",
      "index() devuelve una posición, pero falla si no existe.",
      "enumerate() entrega posición y valor al recorrer.",
    ],
    code: `nombres = ["Ada", "Linus", "Guido"]
buscado = "Guido"
if buscado in nombres:
    posicion = nombres.index(buscado)
    print(posicion)`,
    trace: [
      "in confirma que el nombre existe.",
      "index() busca la primera coincidencia.",
      "La posición se muestra de forma segura.",
    ],
    output: "2",
    mistake: `posicion = nombres.index("Grace")`,
    correction: `posicion = nombres.index("Grace") if "Grace" in nombres else -1`,
    why: "index() genera ValueError cuando el elemento no está; conviene comprobar antes.",
    deepDive:
      "Buscar repetidamente en una lista cuesta más al crecer. Si solo necesitas pertenencia y los valores son únicos, un set suele ser mejor.",
    quiz: {
      prompt: "¿Qué operador responde si un valor está en una colección?",
      options: ["in", "is", "find"],
      answer: 0,
      explanation:
        "in devuelve un booleano y funciona con listas, strings, sets y diccionarios.",
    },
    challenge:
      "Busca un producto en una lista y muestra su posición o un mensaje si no existe.",
    recap: [
      "define la pregunta",
      "comprueba antes de index()",
      "elige la colección adecuada",
    ],
  },
  separar: {
    emoji: "🧩",
    title: "Separar y unir texto",
    objective:
      "Transformar una cadena en partes y reconstruirla de manera controlada.",
    prerequisite: "Strings y listas.",
    analogyTitle: "Cortar y volver a ensamblar",
    analogy:
      "split() corta usando un separador y entrega una lista; join() toma una lista de textos y coloca un conector entre ellos.",
    essentials: [
      "split() devuelve una lista.",
      "El separador puede ser explícito.",
      "join() se llama desde el texto separador.",
    ],
    code: `registro = "Ada,Python,95"
partes = registro.split(",")
resumen = " | ".join(partes)
print(resumen)`,
    trace: [
      "split(',') detecta las comas.",
      "Se crea una lista de tres textos.",
      "join() intercala ' | '.",
    ],
    output: "Ada | Python | 95",
    mistake: `palabras = ["hola", "mundo"]
texto = palabras.join(" ")`,
    correction: `palabras = ["hola", "mundo"]
texto = " ".join(palabras)`,
    why: "join() pertenece al string que actuará como separador, no a la lista.",
    deepDive:
      "split() sin argumentos trata grupos de espacios como uno y elimina espacios en los extremos, útil para texto ingresado por personas.",
    quiz: {
      prompt: '¿Qué devuelve `"a-b-c".split("-")`?',
      options: ["['a', 'b', 'c']", "'abc'", "('a', 'b', 'c')"],
      answer: 0,
      explanation: "split() devuelve una lista con cada fragmento encontrado.",
    },
    challenge:
      "Separa una oración en palabras, invierte la lista y vuelve a unirla con espacios.",
    recap: [
      "split: string → lista",
      "join: lista → string",
      "elige bien el separador",
    ],
  },
  condicionales: {
    emoji: "🧭",
    title: "Condicionales: elegir una ruta",
    objective: "Tomar decisiones exclusivas a partir de condiciones claras.",
    prerequisite: "Booleanos, comparaciones y sangría.",
    analogyTitle: "Un cruce con señales",
    analogy:
      "if prueba la primera ruta; elif ofrece rutas alternativas y else cubre el caso restante. Solo se ejecuta la primera rama verdadera.",
    essentials: [
      "La condición termina en dos puntos.",
      "La sangría pertenece a la rama.",
      "Ordena de lo específico a lo general.",
    ],
    code: `nota = 16
if nota >= 18:
    nivel = "excelente"
elif nota >= 11:
    nivel = "aprobado"
else:
    nivel = "por reforzar"
print(nivel)`,
    trace: [
      "La primera condición es falsa.",
      "La segunda es verdadera.",
      "Se asigna aprobado y las demás ramas se omiten.",
    ],
    output: "aprobado",
    mistake: `if nota >= 11:
    nivel = "aprobado"
elif nota >= 18:
    nivel = "excelente"`,
    correction: `if nota >= 18:
    nivel = "excelente"
elif nota >= 11:
    nivel = "aprobado"`,
    why: "Con el orden incorrecto, una nota alta entra antes en la condición general y nunca llega a excelente.",
    deepDive:
      "Una cadena if/elif expresa categorías excluyentes. Usa varios if independientes cuando más de una regla pueda cumplirse.",
    quiz: {
      prompt:
        "En una cadena if/elif/else, ¿cuántas ramas se ejecutan como máximo?",
      options: ["Una", "Dos", "Todas"],
      answer: 0,
      explanation: "Python se detiene en la primera condición verdadera.",
    },
    challenge:
      "Clasifica una temperatura como fría, templada o caliente, cuidando el orden de los límites.",
    recap: [
      "primera condición verdadera",
      "orden importa",
      "sangría define cada rama",
    ],
  },
  modulos: {
    emoji: "🧰",
    title: "Módulos: reutilizar herramientas",
    objective:
      "Importar bibliotecas y usar alias claros para acceder a sus funciones.",
    prerequisite: "Funciones y notación con punto.",
    analogyTitle: "Una caja de herramientas etiquetada",
    analogy:
      "import abre una caja sin vaciarla sobre la mesa. El alias es una etiqueta corta y el punto selecciona una herramienta concreta.",
    essentials: [
      "import modulo conserva el espacio de nombres.",
      "as crea un alias, como np.",
      "modulo.funcion() muestra de dónde viene cada herramienta.",
    ],
    code: `import numpy as np

datos = np.array([2, 4, 6])
promedio = np.mean(datos)
print(promedio)`,
    trace: [
      "NumPy se vincula al alias np.",
      "np.array() crea un arreglo.",
      "np.mean() calcula su media.",
      "print() muestra el valor obtenido.",
    ],
    output: "4.0",
    mistake: `import numpy as np
datos = numpy.array([1, 2, 3])`,
    correction: `import numpy as np
datos = np.array([1, 2, 3])`,
    why: "Al elegir el alias np, ese es el nombre disponible en el archivo.",
    deepDive:
      "Los módulos crean espacios de nombres. Esto evita choques entre funciones con el mismo nombre y hace explícito el origen de cada operación.",
    quiz: {
      prompt: "Tras `import numpy as np`, ¿cómo llamas a `array`?",
      options: ["numpy.array()", "np.array()", "array.numpy()"],
      answer: 1,
      explanation: "El alias np reemplaza al nombre numpy dentro del archivo.",
    },
    challenge:
      "Importa math con un alias, calcula una raíz cuadrada y explica con un comentario de dónde viene la función.",
    recap: ["import vincula", "as crea alias", "el punto accede a miembros"],
  },
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function safeExample(context: TheoryLessonContext) {
  const question = context.question?.trim();
  if (
    question &&
    (question.includes("\n") || /[=()[\]{}:]/.test(question)) &&
    question.length <= 700
  ) {
    return question.replaceAll("___", "# completa aquí");
  }
  const topic = context.topic.replaceAll('"', "'");
  return `tema = "${topic}"
print(f"Estoy practicando: {tema}")`;
}

function genericLesson(context: TheoryLessonContext): TheoryLesson {
  const description =
    context.description ||
    `Aprender a reconocer y aplicar ${context.topic} en un problema de Python.`;
  const hint =
    context.hint ||
    "Separa el problema en datos de entrada, transformación y resultado.";
  return {
    emoji: "🐍",
    title: `${context.topic}: construye el mapa mental`,
    objective: description,
    prerequisite:
      "Leer código de arriba hacia abajo e identificar los datos que cambian.",
    analogyTitle: "Del mapa al recorrido",
    analogy: `Piensa en “${context.exerciseTitle || context.topic}” como una ruta: primero identifica el punto de partida, después cada transformación y finalmente el resultado que debes comprobar.`,
    essentials: [
      "Nombra qué dato entra.",
      "Describe una sola transformación por paso.",
      "Predice el resultado antes de ejecutar.",
    ],
    code: safeExample(context),
    trace: [
      "Identifica los valores iniciales.",
      "Lee una instrucción cada vez.",
      "Anota qué cambia y qué permanece.",
      "Compara el resultado con el objetivo.",
    ],
    output: "El resultado depende de seguir la traza sin saltar pasos.",
    mistake:
      "Intentar memorizar la respuesta sin explicar qué hace cada línea.",
    correction: hint,
    why: "Una estrategia explícita se puede reutilizar en ejercicios nuevos; una respuesta memorizada no.",
    deepDive:
      context.explanation ||
      "Cuando puedas explicar el estado del programa después de cada línea, ya no dependes de adivinar: puedes justificar tu solución.",
    quiz: {
      prompt: "¿Cuál es la mejor primera acción frente a un código nuevo?",
      options: [
        "Ejecutarlo muchas veces al azar",
        "Identificar entradas y seguir los cambios paso a paso",
        "Memorizar su última línea",
      ],
      answer: 1,
      explanation:
        "Trazar los datos convierte el código en una secuencia comprensible y verificable.",
    },
    challenge: `Explica con tus propias palabras qué dato entra, qué cambia y qué debe salir en “${context.exerciseTitle || context.topic}”.`,
    recap: ["entrada", "transformación", "resultado comprobable"],
  };
}

export function getTheoryLesson(context: TheoryLessonContext): TheoryLesson {
  const topic = normalize(context.topic);
  const aliases: Array<[string, string]> = [
    ["separar", "separar"],
    ["busqueda", "busqueda"],
    ["slicing", "slicing"],
    ["boolean", "booleanos"],
    ["tipo", "tipos"],
    ["variable", "variables"],
    ["string", "strings"],
    ["cadena", "strings"],
    ["lista", "listas"],
    ["bucle", "bucles"],
    ["funcion", "funciones"],
    ["diccionario", "diccionarios"],
    ["condicional", "condicionales"],
    ["decision", "condicionales"],
    ["modulo", "modulos"],
    ["biblioteca", "modulos"],
    ["numpy", "modulos"],
  ];
  const match = aliases.find(([fragment]) => topic.includes(fragment));
  return match ? LESSONS[match[1]] : genericLesson(context);
}
