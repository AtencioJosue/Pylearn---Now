import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Play, X } from "lucide-react";

interface Slide {
  title: string;
  subtitle?: string;
  content: string;
  code?: string;
  emoji: string;
}

const topicSlides: Record<string, Slide[]> = {
  Variables: [
    {
      emoji: "📦",
      title: "¿Qué es una variable?",
      subtitle: "El concepto más fundamental de la programación",
      content: "Una variable es como una caja con nombre donde guardas información. Puedes poner un número, texto, o cualquier dato dentro de ella. Cuando necesitas usar ese dato, simplemente usas el nombre de la caja.",
      code: `# Guardamos datos en cajas con nombre
edad = 17
nombre = "Ana"
altura = 1.65
estudiante = True`,
    },
    {
      emoji: "✏️",
      title: "Cómo asignar variables",
      subtitle: "El operador = en Python",
      content: "En Python, el signo = no significa 'igual' como en matemáticas. Significa 'guarda este valor en esta variable'. El valor de la derecha se guarda en el nombre de la izquierda.",
      code: `x = 10        # Guarda el número 10 en x
nombre = "Luis" # Guarda el texto en nombre
x = 20        # Ahora x vale 20 (se sobreescribe)
print(x)      # Imprime: 20`,
    },
    {
      emoji: "🏷️",
      title: "Tipos de datos básicos",
      subtitle: "int, float, str, bool",
      content: "Python tiene diferentes tipos de datos. Los enteros (int) son números sin decimales, los flotantes (float) tienen decimales, los strings (str) son texto entre comillas, y los booleanos (bool) son True o False.",
      code: `edad = 17          # int (entero)
precio = 9.99      # float (decimal)
ciudad = "Bogotá"  # str (texto)
activo = True      # bool (verdadero/falso)

print(type(edad))  # <class 'int'>`,
    },
    {
      emoji: "📏",
      title: "Reglas para nombres de variables",
      subtitle: "Convenciones de Python (PEP 8)",
      content: "Los nombres de variables deben empezar con letra o guión bajo, no pueden tener espacios ni caracteres especiales. Por convención, en Python usamos snake_case: palabras separadas por guión bajo. Las constantes van en MAYÚSCULAS.",
      code: `# ✅ Nombres válidos
nombre_completo = "María García"
_privado = 42
mi_edad = 20
MAX_INTENTOS = 3

# ❌ Nombres inválidos
# 1numero = 5    (empieza con número)
# mi nombre = 5  (tiene espacio)`,
    },
    {
      emoji: "🔄",
      title: "Operaciones con variables",
      subtitle: "Suma, resta, multiplicación y más",
      content: "Las variables numéricas se pueden operar matemáticamente. También puedes usar operadores de asignación compuesta (+=, -=, *=) que modifican el valor de la variable directamente.",
      code: `puntos = 100
puntos += 50   # puntos = puntos + 50 → 150
puntos -= 20   # puntos = puntos - 20 → 130
puntos *= 2    # puntos = puntos * 2  → 260

# Intercambio elegante
a, b = 5, 10
a, b = b, a   # Ahora a=10, b=5`,
    },
  ],

  Strings: [
    {
      emoji: "💬",
      title: "¿Qué son los Strings?",
      subtitle: "Cadenas de texto en Python",
      content: "Un string es una secuencia de caracteres (letras, números, símbolos) entre comillas. Pueden usar comillas simples ('...') o dobles (\"...\"). Python trata ambas igual. Los strings son inmutables: no puedes cambiar un carácter, pero sí crear strings nuevos.",
      code: `saludo1 = 'Hola mundo'
saludo2 = "Hola mundo"
texto_largo = """Este es un texto
que ocupa varias
líneas"""
print(len(saludo1))  # 10 caracteres`,
    },
    {
      emoji: "🔢",
      title: "Índices y Slicing",
      subtitle: "Acceder a partes del string",
      content: "Cada carácter de un string tiene una posición (índice) que empieza en 0. Puedes extraer partes del string con slicing: [inicio:fin:paso]. Los índices negativos cuentan desde el final.",
      code: `palabra = "Python"
# Índices:  P=0 y=1 t=2 h=3 o=4 n=5

print(palabra[0])    # 'P'
print(palabra[-1])   # 'n' (último)
print(palabra[0:3])  # 'Pyt'
print(palabra[::-1]) # 'nohtyP' (invertido)`,
    },
    {
      emoji: "🛠️",
      title: "Métodos de strings",
      subtitle: "upper, lower, strip, replace, split",
      content: "Los strings tienen métodos incorporados muy útiles. Un método se llama con la sintaxis string.metodo(). Los métodos NO modifican el string original (son inmutables), sino que devuelven uno nuevo.",
      code: `texto = "  Hola Mundo  "
print(texto.upper())    # "  HOLA MUNDO  "
print(texto.lower())    # "  hola mundo  "
print(texto.strip())    # "Hola Mundo"
print(texto.replace("Mundo", "Python"))
# "  Hola Python  "
partes = "a,b,c".split(",")  # ['a','b','c']`,
    },
    {
      emoji: "✨",
      title: "f-strings: strings dinámicos",
      subtitle: "La forma moderna de formatear texto",
      content: "Las f-strings (formatted strings) permiten insertar variables y expresiones directamente dentro del texto. Se definen con una f antes de las comillas. Es la forma más legible y moderna de combinar texto con variables.",
      code: `nombre = "Carlos"
edad = 19
ciudad = "Lima"

# Forma antigua (confusa)
mensaje = "Hola " + nombre + ", tienes " + str(edad)

# f-string (clara y elegante) ✅
mensaje = f"Hola {nombre}, tienes {edad} años"
print(f"2 + 2 = {2 + 2}")  # expresiones`,
    },
    {
      emoji: "🔍",
      title: "Buscar en strings",
      subtitle: "find, in, count, startswith",
      content: "Python tiene varias formas de buscar texto dentro de otros strings. El operador 'in' verifica si un substring existe. find() devuelve la posición donde empieza (o -1 si no se encuentra). count() cuenta ocurrencias.",
      code: `frase = "Python es genial y Python es potente"

print("Python" in frase)      # True
print(frase.find("es"))       # 7
print(frase.count("Python"))  # 2
print(frase.startswith("Py")) # True
print(frase.endswith("te"))   # True`,
    },
  ],

  Listas: [
    {
      emoji: "📋",
      title: "¿Qué es una Lista?",
      subtitle: "Colecciones ordenadas y mutables",
      content: "Una lista es una colección ordenada de elementos. A diferencia de los strings, las listas son mutables: puedes agregar, eliminar o modificar elementos. Pueden contener cualquier tipo de dato, incluso otras listas.",
      code: `# Listas de diferentes tipos
numeros = [1, 2, 3, 4, 5]
frutas = ["manzana", "banana", "cereza"]
mixta = [42, "hola", True, 3.14]
vacia = []

print(len(numeros))   # 5
print(frutas[0])      # "manzana"`,
    },
    {
      emoji: "🎯",
      title: "Índices y Slicing",
      subtitle: "Acceder a elementos individuales o rangos",
      content: "Los elementos se acceden por su posición (índice), empezando en 0. Los índices negativos cuentan desde el final (-1 es el último). El slicing extrae sublistas con [inicio:fin:paso].",
      code: `colores = ["rojo", "verde", "azul", "amarillo"]

print(colores[0])      # "rojo"
print(colores[-1])     # "amarillo"
print(colores[1:3])    # ["verde", "azul"]
print(colores[::-1])   # invertida

# Modificar un elemento
colores[0] = "naranja"`,
    },
    {
      emoji: "➕",
      title: "Agregar y eliminar elementos",
      subtitle: "append, insert, remove, pop",
      content: "Python tiene varios métodos para modificar listas. append() agrega al final, insert() en una posición específica. remove() elimina por valor, pop() por posición (y devuelve el elemento eliminado).",
      code: `lista = ["a", "b", "c"]
lista.append("d")       # ["a","b","c","d"]
lista.insert(0, "z")    # ["z","a","b","c","d"]
lista.remove("b")       # elimina "b"
elemento = lista.pop()  # elimina el último
print(elemento)         # "d"`,
    },
    {
      emoji: "🔧",
      title: "Métodos útiles de listas",
      subtitle: "sort, reverse, count, index",
      content: "Las listas tienen métodos para organizar y buscar datos. sort() ordena en su lugar. sorted() crea una nueva lista ordenada sin modificar la original. reverse() invierte el orden.",
      code: `numeros = [5, 2, 8, 1, 9, 3]
numeros.sort()           # [1,2,3,5,8,9]
numeros.reverse()        # [9,8,5,3,2,1]

frutas = ["banana","manzana","cereza"]
nueva = sorted(frutas)   # no modifica frutas
print(frutas.count("banana"))  # 1
print(frutas.index("cereza"))  # 2`,
    },
    {
      emoji: "🧩",
      title: "Comprensiones de lista",
      subtitle: "Crear listas de forma elegante",
      content: "Una comprensión de lista es una forma concisa de crear listas a partir de otras. Combina un bucle for y opcionalmente una condición if en una sola línea. Es más rápida y legible que un bucle tradicional.",
      code: `# Forma tradicional
cuadrados = []
for n in range(1, 6):
    cuadrados.append(n**2)

# Comprensión de lista ✅ (mejor)
cuadrados = [n**2 for n in range(1, 6)]
# [1, 4, 9, 16, 25]

pares = [n for n in range(10) if n % 2 == 0]
# [0, 2, 4, 6, 8]`,
    },
  ],

  Bucles: [
    {
      emoji: "🔁",
      title: "¿Qué son los Bucles?",
      subtitle: "Repetir código automáticamente",
      content: "Un bucle permite ejecutar un bloque de código múltiples veces sin tener que escribirlo repetido. Python tiene dos tipos principales: for (para recorrer secuencias) y while (mientras una condición sea verdadera).",
      code: `# Sin bucles (tedioso y malo)
print("Hola 1")
print("Hola 2")
print("Hola 3")

# Con bucle for (elegante ✅)
for i in range(1, 4):
    print(f"Hola {i}")`,
    },
    {
      emoji: "🔢",
      title: "El bucle for con range()",
      subtitle: "Repetir un número determinado de veces",
      content: "range() genera una secuencia de números. range(n) va de 0 a n-1. range(inicio, fin) va de inicio a fin-1. range(inicio, fin, paso) permite saltar de a varios números, incluso hacia atrás.",
      code: `# range(5) → 0, 1, 2, 3, 4
for i in range(5):
    print(i)

# range(1, 6) → 1, 2, 3, 4, 5
# range(0, 10, 2) → 0, 2, 4, 6, 8
# range(10, 0, -1) → 10, 9, 8 ... 1`,
    },
    {
      emoji: "📚",
      title: "For recorriendo colecciones",
      subtitle: "Iterar sobre listas, strings y más",
      content: "El bucle for en Python es muy poderoso: puede recorrer listas, strings, diccionarios y cualquier objeto iterable directamente, sin necesitar índices. Con enumerate() obtienes el índice y el valor a la vez.",
      code: `frutas = ["manzana", "banana", "cereza"]
for fruta in frutas:
    print(fruta)

# Con índice usando enumerate
for i, fruta in enumerate(frutas):
    print(f"{i}: {fruta}")

# Recorrer un string
for letra in "Python":
    print(letra)`,
    },
    {
      emoji: "⏳",
      title: "El bucle while",
      subtitle: "Repetir mientras se cumpla una condición",
      content: "El bucle while sigue ejecutándose mientras su condición sea True. Es útil cuando no sabes cuántas repeticiones necesitas. CUIDADO: siempre asegúrate de que la condición eventualmente sea False, o tendrás un bucle infinito.",
      code: `# while básico
contador = 0
while contador < 5:
    print(contador)
    contador += 1  # ⚠️ Siempre actualizar

# Patrón clásico: pedir input válido
respuesta = ""
while respuesta not in ["si", "no"]:
    respuesta = input("¿Continuar? (si/no): ")`,
    },
    {
      emoji: "⚡",
      title: "break y continue",
      subtitle: "Controlar el flujo del bucle",
      content: "break detiene el bucle completamente cuando se ejecuta. continue salta el resto de la iteración actual y va a la siguiente. Ambos sirven para manejar casos especiales sin complicar la estructura del bucle.",
      code: `# break: salir del bucle
for i in range(10):
    if i == 5:
        break  # Para en 5
    print(i)   # Imprime 0,1,2,3,4

# continue: saltar una iteración
for i in range(10):
    if i % 2 == 0:
        continue  # Salta los pares
    print(i)      # Imprime 1,3,5,7,9`,
    },
  ],

  Funciones: [
    {
      emoji: "📦",
      title: "¿Qué es una Función?",
      subtitle: "Código reutilizable con nombre propio",
      content: "Una función es un bloque de código que tiene un nombre y puede ser ejecutado (llamado) múltiples veces. Sirven para evitar repetir código, organizar el programa en piezas pequeñas y hacer el código más legible.",
      code: `# Definir una función
def saludar():
    print("¡Hola desde la función!")

# Llamar la función (puede ser muchas veces)
saludar()
saludar()
saludar()`,
    },
    {
      emoji: "📥",
      title: "Parámetros y argumentos",
      subtitle: "Pasar información a las funciones",
      content: "Los parámetros son variables que la función recibe al ser llamada. Puedes tener múltiples parámetros, valores por defecto, y argumentos con nombre (keyword arguments) para más flexibilidad.",
      code: `def saludar(nombre, saludo="Hola"):
    print(f"{saludo}, {nombre}!")

saludar("Ana")                # Hola, Ana!
saludar("Luis", "¡Buenos días")  # ¡Buenos días, Luis!
saludar(nombre="Eva", saludo="Hey")  # Hey, Eva!`,
    },
    {
      emoji: "📤",
      title: "El return: devolver valores",
      subtitle: "Funciones que producen resultados",
      content: "La sentencia return hace que la función entregue un resultado al código que la llamó. Sin return, la función devuelve None. Puedes retornar múltiples valores separados por comas (Python los empaqueta en una tupla).",
      code: `def sumar(a, b):
    return a + b

resultado = sumar(3, 4)  # resultado = 7
print(resultado)         # 7

# Retornar múltiples valores
def extremos(lista):
    return min(lista), max(lista)

minimo, maximo = extremos([3,1,7,2])`,
    },
    {
      emoji: "🌐",
      title: "Scope: ámbito de las variables",
      subtitle: "Local vs Global",
      content: "Las variables dentro de una función son locales: solo existen dentro de ella. Las variables fuera son globales. Si quieres modificar una variable global desde dentro de una función, debes usar la palabra clave 'global'.",
      code: `x = 10  # Variable global

def funcion():
    x = 20  # Variable LOCAL (diferente!)
    print(x)  # 20

funcion()
print(x)  # 10 (no cambió)

def modificar():
    global x  # Referencia a la global
    x = 99

modificar()
print(x)  # 99`,
    },
    {
      emoji: "🔮",
      title: "Funciones avanzadas",
      subtitle: "Lambda, *args y recursión",
      content: "Python ofrece funciones avanzadas: las lambda son funciones anónimas de una línea. *args permite recibir cualquier cantidad de argumentos. La recursión es cuando una función se llama a sí misma para resolver problemas complejos.",
      code: `# Lambda: función anónima de una línea
cuadrado = lambda x: x ** 2
print(cuadrado(5))  # 25

# *args: número variable de argumentos
def sumar(*numeros):
    return sum(numeros)

print(sumar(1, 2, 3, 4))  # 10

# Recursión
def factorial(n):
    if n <= 1: return 1
    return n * factorial(n - 1)`,
    },
  ],

  Diccionarios: [
    {
      emoji: "📖",
      title: "¿Qué es un Diccionario?",
      subtitle: "Pares clave-valor: la estructura más útil",
      content: "Un diccionario almacena datos en pares clave:valor, como un diccionario real donde buscas por la palabra para encontrar su definición. Las claves deben ser únicas e inmutables (strings o números). Los valores pueden ser cualquier cosa.",
      code: `# Crear un diccionario
persona = {
    "nombre": "Ana",
    "edad": 22,
    "ciudad": "Buenos Aires"
}

print(persona["nombre"])  # "Ana"
print(persona["edad"])    # 22`,
    },
    {
      emoji: "🔑",
      title: "Acceder y modificar datos",
      subtitle: "Lectura segura con .get()",
      content: "Puedes acceder a un valor con dict[clave]. Si la clave no existe, lanza un KeyError. Para acceso seguro, usa .get(clave, defecto) que devuelve el defecto si la clave no existe. Para agregar o modificar, simplemente asigna.",
      code: `config = {"tema": "oscuro", "idioma": "es"}

# Acceso directo (puede fallar con KeyError)
print(config["tema"])         # "oscuro"

# Acceso seguro con .get()
print(config.get("fuente", "Arial"))  # "Arial"

# Agregar o modificar
config["notificaciones"] = True
config["idioma"] = "pt"`,
    },
    {
      emoji: "🔄",
      title: "Recorrer diccionarios",
      subtitle: ".keys(), .values(), .items()",
      content: "Puedes recorrer solo las claves con .keys(), solo los valores con .values(), o ambos a la vez con .items(). Este último es el más útil y se usa constantemente en Python profesional.",
      code: `notas = {"Mate": 90, "Física": 85, "Química": 92}

# Recorrer claves
for materia in notas.keys():
    print(materia)

# Recorrer pares clave-valor ✅ (más usado)
for materia, nota in notas.items():
    print(f"{materia}: {nota}")

promedio = sum(notas.values()) / len(notas)`,
    },
    {
      emoji: "🛠️",
      title: "Métodos útiles de diccionarios",
      subtitle: "pop, update, in, setdefault",
      content: "Los diccionarios tienen métodos muy útiles. pop() elimina y devuelve un valor. update() agrega o actualiza múltiples entradas a la vez. El operador 'in' verifica si una clave existe (no el valor). setdefault() agrega solo si la clave no existe.",
      code: `inventario = {"manzanas": 5, "peras": 3}

precio = inventario.pop("peras")  # 3, elimina
inventario.update({"uvas": 8, "mangos": 2})

print("manzanas" in inventario)  # True
print(5 in inventario)           # False (busca claves)

inventario.setdefault("peras", 0)  # Agrega si no existe`,
    },
    {
      emoji: "🏗️",
      title: "Diccionarios anidados y comprensiones",
      subtitle: "Estructuras complejas de datos",
      content: "Los diccionarios pueden contener otros diccionarios como valores, creando estructuras de datos complejas. Las comprensiones de diccionario permiten crear diccionarios de forma concisa, similar a las comprensiones de lista.",
      code: `# Diccionario anidado
alumnos = {
    "Ana": {"nota": 95, "ciudad": "Lima"},
    "Luis": {"nota": 88, "ciudad": "Bogotá"},
}
print(alumnos["Ana"]["nota"])  # 95

# Comprensión de diccionario
cuadrados = {n: n**2 for n in range(1, 6)}
# {1:1, 2:4, 3:9, 4:16, 5:25}`,
    },
  ],
};

interface IntroSlidesProps {
  topic: string;
  onClose: () => void;
  onStart: () => void;
}

export function IntroSlides({ topic, onClose, onStart }: IntroSlidesProps) {
  const slides = topicSlides[topic] ?? [];
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  if (!slide) return null;

  const isLast = current === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-primary/90 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-2xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : i < current ? "w-2 bg-white/60" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-5xl mb-4 text-center">{slide.emoji}</div>
            <h2 className="text-2xl font-display font-bold text-center mb-1">{slide.title}</h2>
            {slide.subtitle && (
              <p className="text-sm text-primary font-bold text-center uppercase tracking-wider mb-4">{slide.subtitle}</p>
            )}
            <p className="text-muted-foreground leading-relaxed mb-6 text-center">{slide.content}</p>

            {slide.code && (
              <div className="bg-slate-900 rounded-2xl p-4 mb-6 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono leading-relaxed whitespace-pre-wrap">{slide.code}</pre>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="text-sm text-muted-foreground font-medium">
                {current + 1} / {slides.length}
              </span>

              {isLast ? (
                <button
                  onClick={onStart}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  ¡Comenzar!
                </button>
              ) : (
                <button
                  onClick={() => setCurrent(c => Math.min(slides.length - 1, c + 1))}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-white/50 text-sm mt-4">
          Teoría de {topic} · {slides.length} diapositivas
        </p>
      </div>
    </div>
  );
}
