import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, X } from "lucide-react";

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
      title: "La caja mágica: Variables",
      subtitle: "Guarda cosas para usarlas después",
      content: "Imagina que tienes una caja de cartón en tu cuarto y le pones una etiqueta con un marcador negro que dice 'ropa'. ¡Eso es una variable en Python! Es una caja donde guardas un dato y le pones un nombre para no perderlo.",
      code: `# Metiendo cosas a las cajas
edad = 17
nombre = "Ana Campeona"
nivel = 9999`,
    },
    {
      emoji: "🤪",
      title: "Cambiando de opinión",
      subtitle: "Reasignando valores",
      content: "Lo genial de las cajas (variables) es que puedes sacar lo que tienen y meter algo nuevo. Python no se enoja. ¡Puedes cambiar un número las veces que quieras!",
      code: `dinero = 100
# Oh oh, compramos algo caro...
dinero = 2
print(dinero) # Imprime: 2 (¡Pobre!)`,
    },
    {
      emoji: "👮",
      title: "La policía del código",
      subtitle: "Reglas de nombres",
      content: "No puedes nombrar a tu perro '@*#1'. ¡En Python tampoco! Los nombres deben empezar con letras, sin espacios. Usamos el guión bajo para separar palabras (snake_case).",
      code: `mi_nivel_poder = 9000  # ✅ ¡Excelente!
_top_secret = 42       # ✅ Cool

# 1_jugador = "Juan"   # ❌ (Empieza con número)
# mi poder = 9000      # ❌ (Tiene espacios)`,
    },
  ],

  Strings: [
    {
      emoji: "🗣️",
      title: "Strings: Python hablando",
      subtitle: "El arte del Texto",
      content: "Un String (cadena) es básicamente TEXTO. Si no lo pones entre comillas, Python pensará que estás invocando un hechizo mágico o una variable que no existe y entrará en pánico.",
      code: `saludo = "¡Hola mundo loco!"
pensamiento = 'Las comillas simples también valen'

print(saludo)`,
    },
    {
      emoji: "🔪",
      title: "Slicing: Cortando palabras",
      subtitle: "Como un ninja",
      content: "¡Puedes rebanar palabras! Con `[inicio:fin]` puedes robarte pedazos de un texto. Empieza a contar desde 0.",
      code: `palabra = "PYTHON"
# P=0 Y=1 T=2 H=3 O=4 N=5

print(palabra[0:2]) # Imprime: PY
print(palabra[-1])  # Imprime: N (El último)`,
    },
    {
      emoji: "✨",
      title: "La Magia de f-strings",
      subtitle: "La forma cool de mezclar texto",
      content: "A nadie le gusta usar el signo + para pegar palabras. Usa las `f-strings`. Solo pon una 'f' al principio y mete tus variables en {llavecitas}. Es súper fácil e intuitivo.",
      code: `juego = "Zelda"
horas = 350
# La forma PRO:
mensaje = f"He jugado {juego} por {horas} horas"
print(mensaje)`,
    },
  ],

  Listas: [
    {
      emoji: "🎒",
      title: "Tu Mochila: La Lista",
      subtitle: "Mete todo lo que quieras",
      content: "¿Por qué tener 10 variables si puedes tener una sola lista con 10 cosas? Una lista es como tu mochila del colegio, le cabe de todo: libros, comida, ¡y hasta cosas repetidas!",
      code: `mochila = ["Libro", "Laptop", "Sándwich"]
numeros = [10, 99, 42]
locura = ["Texto", 42, True, [1, 2]]

print(mochila[0]) # Imprime: Libro`,
    },
    {
      emoji: "💥",
      title: "Métodos destructivos",
      subtitle: "append y remove",
      content: "¿Se te olvidó el lápiz? Usa `append()` y lo pones al final. ¿Te comiste el sándwich? Usa `remove()` y desaparece de la lista. ¡Magia!",
      code: `bolsa = ["Poción"]

bolsa.append("Espada") # ["Poción", "Espada"]
bolsa.remove("Poción") # ["Espada"] (Usamos poción)`,
    },
  ],

  Bucles: [
    {
      emoji: "🐹",
      title: "La rueda del Hámster",
      subtitle: "Bucles For",
      content: "¿Te gusta escribir lo mismo 100 veces? ¡A nosotros tampoco! El bucle `for` hace tareas repetitivas por ti mientras tú te tomas un café. Piensa en él como un robot trabajador.",
      code: `# El robot dice Hola 3 veces
for i in range(3):
    print("Hola, jefe")`,
    },
    {
      emoji: "♾️",
      title: "El Agujero Negro",
      subtitle: "Bucles While",
      content: "El bucle `while` se repite mientras algo siga siendo verdad (`True`). ¡Cuidado! Si la condición nunca cambia, el programa correrá hasta que tu computadora explote (bucle infinito).",
      code: `energia = 3
while energia > 0:
    print(f"Me muevo. Energía: {energia}")
    energia -= 1 # ⚠️ ¡Super importante restar!
print("¡A dormir!")`,
    },
  ],

  Funciones: [
    {
      emoji: "🏭",
      title: "Fábricas de Código",
      subtitle: "¿Qué es una función?",
      content: "Una función es como un hechizo personalizado o una máquina de fábrica. Tú la programas una vez, y luego solo dices la palabra mágica para que trabaje las veces que quieras.",
      code: `def hechizo_fuego():
    print("🔥 ¡FIREBALL! 🔥")

hechizo_fuego()
hechizo_fuego() # Doble daño jaja`,
    },
    {
      emoji: "🚚",
      title: "Recibiendo ingredientes",
      subtitle: "Parámetros",
      content: "Tu máquina puede recibir ingredientes para trabajar distinto. Si la máquina hace jugos, y le pasas naranja, sale jugo de naranja. A los ingredientes les llamamos 'parámetros'.",
      code: `def saludar(nombre):
    print(f"¡Hola {nombre}, bienvenido!")

saludar("Carlos") # Usa "Carlos" como ingrediente`,
    },
  ],

  Diccionarios: [
    {
      emoji: "📖",
      title: "Diccionarios Reales",
      subtitle: "Palabra y Significado",
      content: "Un diccionario en Python es igual que uno de verdad. Tienes una palabra (Clave) y su significado (Valor). Es la forma más rápida de buscar información del universo.",
      code: `jugador = {
    "nombre": "Link",
    "vidas": 3,
    "arma": "Espada Maestra"
}

print(jugador["arma"]) # "Espada Maestra"`,
    },
  ]
};

interface IntroSlidesProps {
  topic: string;
  onClose: () => void;
  onStart: () => void;
}

export function IntroSlides({ topic, onClose, onStart }: IntroSlidesProps) {
  // Si no tenemos el tema en el diccionario, inventamos una slide genérica divertida.
  const genericSlides: Slide[] = [{
      emoji: "🐍", title: `Desafío: ${topic}`, subtitle: "Estás listo para esto",
      content: "Repasa mentalmente lo que sabes sobre este tema. Tu misión es aplastar este desafío. ¡Los errores son parte de aprender, así que no tengas miedo de intentar!",
  }];
  
  const slides = topicSlides[topic] ?? genericSlides;
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  if (!slide) return null;

  const isLast = current === slides.length - 1;

  const goNext = () => {
    if (isLast) onStart();
    else setCurrent(c => c + 1);
  };

  const percent = ((current + 1) / slides.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col pt-4 overflow-hidden">
      {/* ── Barra superior Header ── */}
      <div className="w-full max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden w-full">
             <div 
                className="h-full bg-[#58CC02] rounded-full transition-all duration-500 relative"
                style={{ width: `${percent}%` }}
             >
                <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
             </div>
          </div>
        </div>
      </div>

      {/* ── Contenido Principal de Diapositiva ── */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-5xl mx-auto w-full px-6 gap-8 md:gap-16 pb-24">
        
        {/* Mascota y Emoji (Lado izquierdo) */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
             <AnimatePresence mode="wait">
                <motion.div
                  key={slide.emoji}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-8xl md:text-9xl relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] mb-4"
                >
                  {slide.emoji}
                </motion.div>
             </AnimatePresence>
             <div className="relative w-32 md:w-48 animate-bounce-slow mt-4 hidden md:block">
                 <img src={`${import.meta.env.BASE_URL}images/python-mascot.png`} alt="Asistente Python" className="w-full drop-shadow-xl" />
             </div>
        </div>

        {/* Textos y Código (Lado derecho) */}
        <div className="flex-1 max-w-xl">
             <AnimatePresence mode="wait">
                 <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                 >
                    {slide.subtitle && (
                      <h4 className="text-primary font-extrabold uppercase tracking-widest text-sm mb-2">{slide.subtitle}</h4>
                    )}
                    <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 mb-6 leading-tight">
                        {slide.title}
                    </h2>
                    
                    <div className="relative mb-8">
                        <p className="text-lg text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl border-2 border-slate-200">
                          {slide.content}
                        </p>
                        {/* Triangle arrow for chat bubble */}
                        <div className="absolute top-1/2 -left-4 w-4 h-4 bg-slate-50 border-b-2 border-l-2 border-slate-200 transform -translate-y-1/2 rotate-45 hidden md:block" />
                    </div>

                    {slide.code && (
                    <div className="bg-[#1f2937] rounded-3xl p-6 border-b-[6px] border-[#111827] shadow-xl overflow-x-auto relative">
                        <div className="absolute top-3 left-4 flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <pre className="text-[15px] text-[#58CC02] font-mono leading-loose whitespace-pre-wrap mt-4 font-bold">
                            {slide.code}
                        </pre>
                    </div>
                    )}
                 </motion.div>
             </AnimatePresence>
        </div>
      </div>

      {/* ── Footer de botones (Bottom dock) ── */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 h-32 flex items-center justify-between">
              {current > 0 ? (
                  <button
                    onClick={() => setCurrent(c => c - 1)}
                    className="btn-bouncy btn-outline-gray px-8 py-3.5 font-extrabold text-lg uppercase tracking-wide"
                  >
                    Retroceder
                  </button>
              ) : <div />}
              
              <button
                onClick={goNext}
                className="btn-bouncy btn-green px-12 py-4 font-extrabold text-xl uppercase tracking-widest flex items-center gap-2"
              >
                {isLast ? "¡PRACTICAR!" : "CONTINUAR"}
                {!isLast && <ChevronRight className="w-6 h-6 stroke-[3]" />}
              </button>
          </div>
      </div>
    </div>
  );
}
