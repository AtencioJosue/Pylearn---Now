// Mock API server for local development
// Run with: node mock-server.mjs
import http from 'node:http';

const PORT = 3001;

// ═══════════════════════════════════════════════
// In-memory database
// ═══════════════════════════════════════════════

const exercises = [
  // ── Variables ──
  { id: 1, title: "Creando tu primera variable", description: "Las variables son como cajas donde guardas datos. Crea una variable y asígnale un valor.", topic: "Variables", difficulty: "beginner", type: "fill_blank", question: "# Crea una variable llamada 'edad' con el valor 17\n___ = 17\nprint(edad)", options: ["edad", "print", "17", "variable", "int", "str"], hint: "Recuerda: el nombre de la variable va a la izquierda del signo =", explanation: "En Python, las variables se crean simplemente asignando un valor con el operador =. No necesitas declarar el tipo.", orderIndex: 1 },
  { id: 2, title: "Tipos de datos básicos", description: "Python tiene varios tipos de datos. ¿Puedes identificar qué tipo es cada uno?", topic: "Variables", difficulty: "beginner", type: "multiple_choice", question: "¿Qué tipo de dato es el valor 3.14?", options: ["int", "float", "str", "bool"], hint: "Piensa en los números con punto decimal", explanation: "3.14 es un número decimal, por lo tanto es de tipo float (punto flotante).", orderIndex: 2 },
  { id: 3, title: "Reasignando variables", description: "Las variables pueden cambiar su valor en cualquier momento.", topic: "Variables", difficulty: "beginner", type: "predict_output", question: "x = 10\nx = x + 5\nprint(x)", options: null, hint: "Primero x vale 10, luego se le suma 5", explanation: "x empieza valiendo 10. Luego x = x + 5 calcula 10 + 5 = 15 y lo guarda en x.", orderIndex: 3 },

  // ── Strings ──
  { id: 4, title: "Concatenación de strings", description: "Aprende a unir textos en Python.", topic: "Strings", difficulty: "beginner", type: "predict_output", question: 'nombre = "Py"\napellido = "thon"\nprint(nombre + apellido)', options: null, hint: "El operador + une strings", explanation: "El operador + concatena (une) dos strings. 'Py' + 'thon' = 'Python'.", orderIndex: 1 },
  { id: 5, title: "f-strings mágicas", description: "Las f-strings son la forma moderna de formatear texto en Python.", topic: "Strings", difficulty: "beginner", type: "fill_blank", question: 'lenguaje = "Python"\nversion = 3\n# Completa para que imprima: \"Uso Python 3\"\nprint(f\"Uso {___} {version}\")', options: ["lenguaje", "python", "version", "f", "print", "str"], hint: "Dentro de las llaves {} va el nombre de la variable", explanation: "Las f-strings permiten insertar variables directamente en el texto usando {nombre_variable}.", orderIndex: 2 },
  { id: 6, title: "Métodos de strings", description: "Los strings tienen métodos útiles para transformar texto.", topic: "Strings", difficulty: "beginner", type: "predict_output", question: 'texto = "hola mundo"\nprint(texto.upper())', options: null, hint: ".upper() convierte todo a mayúsculas", explanation: "El método .upper() devuelve una copia del string con todos los caracteres en mayúsculas.", orderIndex: 3 },
  { id: 7, title: "Slicing de strings", description: "Puedes cortar partes de un string usando índices.", topic: "Strings", difficulty: "beginner", type: "predict_output", question: 'palabra = "PYTHON"\nprint(palabra[0:3])', options: null, hint: "El slicing [0:3] toma los caracteres del índice 0 al 2 (el 3 no se incluye)", explanation: "El slicing [0:3] extrae los caracteres en las posiciones 0, 1 y 2, es decir 'PYT'.", orderIndex: 4 },

  // ── Listas ──
  { id: 8, title: "Crear una lista", description: "Las listas son colecciones ordenadas de elementos.", topic: "Listas", difficulty: "beginner", type: "predict_output", question: 'frutas = ["manzana", "banana", "cereza"]\nprint(len(frutas))', options: null, hint: "len() devuelve la cantidad de elementos", explanation: "len() cuenta los elementos de la lista. La lista tiene 3 frutas.", orderIndex: 1 },
  { id: 9, title: "Agregar elementos", description: "Usa append() para agregar elementos al final de una lista.", topic: "Listas", difficulty: "beginner", type: "predict_output", question: 'numeros = [1, 2, 3]\nnumeros.append(4)\nprint(numeros)', options: null, hint: "append() agrega al final de la lista", explanation: "El método append() agrega un elemento al final de la lista. Resultado: [1, 2, 3, 4].", orderIndex: 2 },
  { id: 10, title: "Acceder por índice", description: "Cada elemento de una lista tiene un índice numérico.", topic: "Listas", difficulty: "beginner", type: "multiple_choice", question: 'colores = ["rojo", "verde", "azul", "amarillo"]\n# ¿Qué imprime colores[2]?', options: ["rojo", "verde", "azul", "amarillo"], hint: "Los índices empiezan en 0", explanation: "Los índices empiezan en 0: colores[0]='rojo', colores[1]='verde', colores[2]='azul'.", orderIndex: 3 },

  // ── Bucles ──
  { id: 11, title: "Tu primer bucle for", description: "Los bucles for repiten código para cada elemento de una secuencia.", topic: "Bucles", difficulty: "beginner", type: "predict_output", question: 'for i in range(3):\n    print(i)', options: null, hint: "range(3) genera 0, 1, 2", explanation: "range(3) genera los números 0, 1, 2. El bucle imprime cada uno en una línea.", orderIndex: 1 },
  { id: 12, title: "Bucle while", description: "El bucle while se repite mientras una condición sea verdadera.", topic: "Bucles", difficulty: "beginner", type: "predict_output", question: 'contador = 0\nwhile contador < 3:\n    contador += 1\nprint(contador)', options: null, hint: "El bucle se repite hasta que contador ya no sea menor que 3", explanation: "El bucle incrementa contador: 0→1→2→3. Cuando llega a 3, la condición es falsa y se sale. Imprime 3.", orderIndex: 2 },
  { id: 13, title: "Iterando sobre una lista", description: "Puedes recorrer los elementos de una lista con un bucle for.", topic: "Bucles", difficulty: "beginner", type: "fill_blank", question: 'animales = ["gato", "perro", "pez"]\nfor animal ___ animales:\n    print(animal)', options: ["in", "of", "for", "to", "loop", "from"], hint: "¿Qué palabra clave se usa para iterar?", explanation: "La palabra clave 'in' se usa para iterar sobre los elementos de una secuencia en un bucle for.", orderIndex: 3 },

  // ── Funciones ──
  { id: 14, title: "Definir una función", description: "Las funciones son bloques de código reutilizables.", topic: "Funciones", difficulty: "beginner", type: "fill_blank", question: '# Define una función que salude\n___ saludar():\n    print("¡Hola!")\n\nsaludar()', options: ["def", "function", "fun", "create", "void", "let"], hint: "¿Qué palabra clave se usa para definir funciones en Python?", explanation: "La palabra clave 'def' se usa para definir funciones en Python.", orderIndex: 1 },
  { id: 15, title: "Función con retorno", description: "Las funciones pueden devolver valores con return.", topic: "Funciones", difficulty: "beginner", type: "predict_output", question: 'def doble(n):\n    return n * 2\n\nresultado = doble(5)\nprint(resultado)', options: null, hint: "La función multiplica el parámetro por 2", explanation: "doble(5) calcula 5 * 2 = 10. La función devuelve 10 con return.", orderIndex: 2 },
  { id: 16, title: "Parámetros múltiples", description: "Las funciones pueden recibir varios parámetros.", topic: "Funciones", difficulty: "beginner", type: "predict_output", question: 'def suma(a, b):\n    return a + b\n\nprint(suma(3, 7))', options: null, hint: "La función suma los dos parámetros", explanation: "suma(3, 7) calcula 3 + 7 = 10.", orderIndex: 3 },

  // ── Diccionarios ──
  { id: 17, title: "Crear un diccionario", description: "Los diccionarios almacenan pares clave-valor.", topic: "Diccionarios", difficulty: "beginner", type: "predict_output", question: 'persona = {"nombre": "Ana", "edad": 25}\nprint(persona["nombre"])', options: null, hint: "Se accede a los valores usando la clave entre corchetes", explanation: "persona['nombre'] accede al valor asociado a la clave 'nombre', que es 'Ana'.", orderIndex: 1 },
  { id: 18, title: "Agregar claves", description: "Puedes agregar nuevos pares clave-valor a un diccionario.", topic: "Diccionarios", difficulty: "beginner", type: "predict_output", question: 'datos = {"a": 1}\ndatos["b"] = 2\nprint(len(datos))', options: null, hint: "len() cuenta las claves del diccionario", explanation: "Después de agregar 'b': 2, el diccionario tiene 2 claves: 'a' y 'b'.", orderIndex: 2 },
  { id: 19, title: "Iterar un diccionario", description: "Puedes recorrer las claves y valores de un diccionario.", topic: "Diccionarios", difficulty: "beginner", type: "multiple_choice", question: 'info = {"x": 10, "y": 20}\n# ¿Qué método devuelve pares (clave, valor)?', options: [".keys()", ".values()", ".items()", ".pairs()"], hint: "Piensa en qué método devuelve tuplas (clave, valor)", explanation: "El método .items() devuelve pares (clave, valor) como tuplas.", orderIndex: 3 },

  // ── Intermedio ──
  { id: 20, title: "List comprehension", description: "Crea listas de forma compacta con list comprehensions.", topic: "Intermedio", difficulty: "intermediate", type: "predict_output", question: 'cuadrados = [x**2 for x in range(5)]\nprint(cuadrados)', options: null, hint: "range(5) genera 0,1,2,3,4 y se eleva al cuadrado cada uno", explanation: "La list comprehension crea [0, 1, 4, 9, 16] elevando al cuadrado cada número de 0 a 4.", orderIndex: 1 },
  { id: 21, title: "Función lambda", description: "Las funciones lambda son funciones anónimas de una sola línea.", topic: "Intermedio", difficulty: "intermediate", type: "predict_output", question: 'doble = lambda x: x * 2\nprint(doble(8))', options: null, hint: "Lambda funciona igual que una función normal pero en una línea", explanation: "La función lambda toma x y devuelve x*2. doble(8) = 16.", orderIndex: 2 },
  { id: 22, title: "Manejo de excepciones", description: "Try/except te permite manejar errores sin que el programa falle.", topic: "Intermedio", difficulty: "intermediate", type: "fill_blank", question: '# Completa para capturar el error\ntry:\n    resultado = 10 / 0\n___ ZeroDivisionError:\n    print("¡No puedes dividir entre cero!")', options: ["except", "catch", "error", "try", "finally", "else"], hint: "¿Qué palabra clave se usa para capturar excepciones?", explanation: "La palabra clave 'except' se usa para capturar y manejar excepciones en un bloque try/except.", orderIndex: 3 },
  { id: 23, title: "Args y kwargs", description: "Aprende sobre argumentos variables en funciones.", topic: "Intermedio", difficulty: "intermediate", type: "predict_output", question: 'def suma(*args):\n    return sum(args)\n\nprint(suma(1, 2, 3, 4))', options: null, hint: "*args recoge todos los argumentos posicionales en una tupla", explanation: "*args permite recibir un número variable de argumentos. sum((1,2,3,4)) = 10.", orderIndex: 4 },

  // ── Difícil ──
  { id: 24, title: "Decoradores", description: "Los decoradores modifican el comportamiento de funciones.", topic: "Difícil", difficulty: "advanced", type: "predict_output", question: 'def duplicar(func):\n    def wrapper(x):\n        return func(x) * 2\n    return wrapper\n\n@duplicar\ndef sumar_uno(n):\n    return n + 1\n\nprint(sumar_uno(3))', options: null, hint: "El decorador multiplica el resultado por 2", explanation: "sumar_uno(3) normalmente devuelve 4, pero el decorador duplica ese resultado: 4 * 2 = 8.", orderIndex: 1 },
  { id: 25, title: "Generadores", description: "Los generadores producen valores uno a uno con yield.", topic: "Difícil", difficulty: "advanced", type: "predict_output", question: 'def contar():\n    yield 1\n    yield 2\n    yield 3\n\nresultado = list(contar())\nprint(resultado)', options: null, hint: "yield produce un valor a la vez, list() los recoge todos", explanation: "El generador produce 1, 2, 3 con yield. list() los recoge en [1, 2, 3].", orderIndex: 2 },
  { id: 26, title: "Recursión avanzada", description: "Resuelve problemas complejos con recursión.", topic: "Difícil", difficulty: "advanced", type: "predict_output", question: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(6))', options: null, hint: "fibonacci: 0, 1, 1, 2, 3, 5, 8...", explanation: "La secuencia de Fibonacci: f(0)=0, f(1)=1, f(2)=1, f(3)=2, f(4)=3, f(5)=5, f(6)=8.", orderIndex: 3 },

  // ── Tryhard ──
  { id: 27, title: "Memoización manual", description: "Optimiza funciones recursivas con caché.", topic: "Tryhard", difficulty: "tryhard", type: "predict_output", question: 'cache = {}\ndef fib(n):\n    if n in cache:\n        return cache[n]\n    if n <= 1:\n        cache[n] = n\n    else:\n        cache[n] = fib(n-1) + fib(n-2)\n    return cache[n]\n\nprint(fib(10))', options: null, hint: "Fibonacci con memoización es más rápido pero da el mismo resultado", explanation: "El resultado es el mismo que fibonacci normal: fib(10) = 55, pero la memoización lo hace mucho más rápido.", orderIndex: 1 },
  { id: 28, title: "Clases y herencia", description: "Programación orientada a objetos avanzada.", topic: "Tryhard", difficulty: "tryhard", type: "predict_output", question: 'class Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def hablar(self):\n        return "..."\n\nclass Perro(Animal):\n    def hablar(self):\n        return f"{self.nombre} dice: ¡Guau!"\n\nmax = Perro("Max")\nprint(max.hablar())', options: null, hint: "Perro hereda de Animal pero sobreescribe el método hablar()", explanation: "La clase Perro hereda de Animal y sobreescribe hablar(). Con nombre='Max', devuelve 'Max dice: ¡Guau!'.", orderIndex: 2 },
  { id: 29, title: "Context Managers", description: "Crea tus propios context managers con __enter__ y __exit__.", topic: "Tryhard", difficulty: "tryhard", type: "predict_output", question: 'class MiContexto:\n    def __enter__(self):\n        print("Entrando")\n        return self\n    def __exit__(self, *args):\n        print("Saliendo")\n\nwith MiContexto():\n    print("Dentro")', options: null, hint: "Piensa en el orden: __enter__, cuerpo del with, __exit__", explanation: "El context manager ejecuta __enter__ → cuerpo del with → __exit__. Imprime: Entrando, Dentro, Saliendo.", orderIndex: 3 },
];

// Correct answers mapping
const correctAnswers = {
  1: "edad", 2: "float", 3: "15",
  4: "Python", 5: "lenguaje", 6: "HOLA MUNDO", 7: "PYT",
  8: "3", 9: "[1, 2, 3, 4]", 10: "azul",
  11: "0\n1\n2", 12: "3", 13: "in",
  14: "def", 15: "10", 16: "10",
  17: "Ana", 18: "2", 19: ".items()",
  20: "[0, 1, 4, 9, 16]", 21: "16", 22: "except", 23: "10",
  24: "8", 25: "[1, 2, 3]", 26: "8",
  27: "55", 28: "Max dice: ¡Guau!", 29: "Entrando\nDentro\nSaliendo",
};

// In-memory stores
const users = new Map();
const completedExercises = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]); // track completed exercise IDs
let totalAttempts = 13;
let totalCorrectAnswers = 13;
const forumPosts = [];
let forumPostIdCounter = 1;
const forumComments = new Map(); // postId -> Comment[]
let commentIdCounter = 1;
const createdExercises = [];
let createdExerciseIdCounter = 100;

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

function jsonResponse(res, data, status = 200) {
  res.writeHead(status, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function getProgress() {
  const topics = {};
  for (const ex of exercises) {
    if (!topics[ex.topic]) topics[ex.topic] = 0;
  }
  for (const exId of completedExercises) {
    const ex = exercises.find(e => e.id === exId);
    if (ex) topics[ex.topic] = (topics[ex.topic] || 0) + 1;
  }
  return {
    totalExercises: exercises.length,
    completedExercises: completedExercises.size,
    correctAnswers: totalCorrectAnswers,
    totalAttempts: totalAttempts,
    topicProgress: topics,
  };
}

// ═══════════════════════════════════════════════
// Router
// ═══════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ── Health ──
  if (path === '/api/healthz' && method === 'GET') {
    return jsonResponse(res, { status: 'ok' });
  }

  // ── Exercises ──
  if (path === '/api/exercises' && method === 'GET') {
    return jsonResponse(res, exercises.map(e => ({ ...e, options: e.options || undefined })));
  }

  const exerciseMatch = path.match(/^\/api\/exercises\/(\d+)$/);
  if (exerciseMatch && method === 'GET') {
    const id = parseInt(exerciseMatch[1]);
    const ex = exercises.find(e => e.id === id);
    if (!ex) return jsonResponse(res, { error: 'Not found' }, 404);
    return jsonResponse(res, { ...ex, options: ex.options || undefined });
  }

  const checkMatch = path.match(/^\/api\/exercises\/(\d+)\/check$/);
  if (checkMatch && method === 'POST') {
    const id = parseInt(checkMatch[1]);
    const body = await readBody(req);
    const answer = (body.answer || '').trim();
    const correctAnswer = correctAnswers[id] || '';
    
    // Normalize for comparison
    const normalize = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    const correct = normalize(answer) === normalize(correctAnswer);
    
    totalAttempts += 1;
    if (correct) {
      if (!completedExercises.has(id)) {
        completedExercises.add(id);
        totalCorrectAnswers += 1;
      }
    }

    return jsonResponse(res, {
      correct,
      feedback: correct
        ? '¡Excelente! Has respondido correctamente. ¡Sigue así!'
        : `No es correcto. La respuesta esperada era diferente. ¡Inténtalo de nuevo!`,
      correctAnswer: correctAnswer,
    });
  }

  // ── Progress ──
  if (path === '/api/progress' && method === 'GET') {
    return jsonResponse(res, getProgress());
  }

  // ── Users ──
  if (path === '/api/users' && method === 'POST') {
    const body = await readBody(req);
    const user = {
      id: body.id,
      name: body.name,
      achievements: [],
      exercisesCreated: 0,
    };
    users.set(body.id, user);
    return jsonResponse(res, user, 201);
  }

  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && method === 'GET') {
    const id = userMatch[1];
    const user = users.get(id);
    if (!user) return jsonResponse(res, { error: 'User not found' }, 404);
    return jsonResponse(res, user);
  }

  const achMatch = path.match(/^\/api\/users\/([^/]+)\/achievements$/);
  if (achMatch && method === 'POST') {
    const id = achMatch[1];
    const user = users.get(id);
    if (!user) return jsonResponse(res, { error: 'User not found' }, 404);
    const body = await readBody(req);
    const alreadyHas = user.achievements.some(a => a.key === body.key);
    if (!alreadyHas) {
      user.achievements.push({ key: body.key, unlocked_at: new Date().toISOString() });
    }
    return jsonResponse(res, { success: true });
  }

  // ── Forum ──
  if (path === '/api/forum/posts' && method === 'GET') {
    const sorted = [...forumPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return jsonResponse(res, sorted);
  }

  if (path === '/api/forum/posts' && method === 'POST') {
    const body = await readBody(req);
    const post = {
      id: forumPostIdCounter++,
      user_id: body.user_id,
      author_name: body.author_name,
      title: body.title,
      content: body.content,
      image_url: body.image_url || null,
      created_at: new Date().toISOString(),
      comment_count: 0,
    };
    forumPosts.push(post);
    forumComments.set(post.id, []);
    return jsonResponse(res, post, 201);
  }

  const postDetailMatch = path.match(/^\/api\/forum\/posts\/(\d+)$/);
  if (postDetailMatch && method === 'GET') {
    const postId = parseInt(postDetailMatch[1]);
    const post = forumPosts.find(p => p.id === postId);
    if (!post) return jsonResponse(res, { error: 'Not found' }, 404);
    const comments = forumComments.get(postId) || [];
    return jsonResponse(res, { ...post, comments });
  }

  const postCommentMatch = path.match(/^\/api\/forum\/posts\/(\d+)\/comments$/);
  if (postCommentMatch && method === 'POST') {
    const postId = parseInt(postCommentMatch[1]);
    const post = forumPosts.find(p => p.id === postId);
    if (!post) return jsonResponse(res, { error: 'Not found' }, 404);
    const body = await readBody(req);
    const comment = {
      id: commentIdCounter++,
      author_name: body.author_name,
      content: body.content,
      created_at: new Date().toISOString(),
    };
    const comments = forumComments.get(postId) || [];
    comments.push(comment);
    forumComments.set(postId, comments);
    post.comment_count = comments.length;
    return jsonResponse(res, comment, 201);
  }

  // ── Created Exercises ──
  if (path === '/api/created-exercises' && method === 'GET') {
    const userId = url.searchParams.get('user_id');
    const filtered = userId 
      ? createdExercises.filter(e => e.user_id === userId)
      : createdExercises;
    return jsonResponse(res, filtered);
  }

  if (path === '/api/created-exercises' && method === 'POST') {
    const body = await readBody(req);
    const approved = body.title && body.question && body.correct_answer && body.title.length > 3;
    const exercise = {
      id: createdExerciseIdCounter++,
      user_id: body.user_id,
      author_name: body.author_name,
      title: body.title,
      topic: body.topic,
      type: body.type,
      question: body.question,
      correct_answer: body.correct_answer,
      hint: body.hint || '',
      explanation: body.explanation || '',
      status: approved ? 'approved' : 'rejected',
      ai_feedback: approved 
        ? '¡Excelente ejercicio! El contenido es educativo, técnicamente correcto y bien estructurado.'
        : 'El ejercicio necesita más detalle. Asegúrate de que el título sea descriptivo y la pregunta sea clara.',
      created_at: new Date().toISOString(),
    };
    createdExercises.push(exercise);
    
    // Update user exercisesCreated count
    if (approved && body.user_id) {
      const user = users.get(body.user_id);
      if (user) {
        user.exercisesCreated = createdExercises.filter(e => e.user_id === body.user_id && e.status === 'approved').length;
      }
    }

    return jsonResponse(res, {
      exercise,
      validation: {
        approved,
        score: approved ? 85 : 30,
        feedback: exercise.ai_feedback,
      }
    });
  }

  // ── Root redirect to frontend ──
  if (path === '/' || path === '') {
    res.writeHead(302, { Location: 'http://localhost:5173' });
    res.end();
    return;
  }

  // ── 404 ──
  jsonResponse(res, { error: 'Not found', path }, 404);
});

server.listen(PORT, () => {
  console.log(`\n🐍 PyLearn Mock API running at http://localhost:${PORT}`);
  console.log(`   ${exercises.length} exercises loaded`);
  console.log(`   Endpoints: /api/healthz, /api/exercises, /api/progress, /api/users, /api/forum\n`);
});
