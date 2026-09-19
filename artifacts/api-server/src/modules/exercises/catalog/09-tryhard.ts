import type { ExerciseData } from "../types";

export const topicExercises: ExerciseData[] = [
  {
    "id": 25,
    "title": "Proyecto: Juego del Ahorcado",
    "description": "Completa el juego del ahorcado. El jugador tiene 6 vidas para adivinar una palabra letra por letra. Cuando falla, debe perder una vida. Identifica la línea crítica que falta para que el juego funcione correctamente.",
    "topic": "Tryhard",
    "difficulty": "tryhard",
    "type": "fill_blank",
    "question": "import random\n\nPALABRAS = [\"python\", \"programacion\", \"computadora\", \"algoritmo\"]\n\ndef mostrar_estado(palabra, letras_usadas, vidas):\n    oculta = \" \".join([l if l in letras_usadas else \"_\" for l in palabra])\n    print(f\"Palabra: {oculta}\")\n    print(f\"Letras usadas: {', '.join(sorted(letras_usadas)) or '-'}\")\n    print(f\"Vidas: {'❤️ ' * vidas}\")\n\ndef jugar():\n    palabra = random.choice(PALABRAS)\n    letras_usadas = set()\n    vidas = 6\n\n    while vidas > 0:\n        mostrar_estado(palabra, letras_usadas, vidas)\n        if all(l in letras_usadas for l in palabra):\n            print(\"¡Ganaste!\")\n            return\n\n        letra = input(\"Ingresa una letra: \").lower().strip()\n        if not letra.isalpha() or len(letra) != 1:\n            print(\"Solo una letra a la vez.\")\n            continue\n        if letra in letras_usadas:\n            print(\"Ya usaste esa letra.\")\n            continue\n\n        letras_usadas.add(letra)\n        if letra in palabra:\n            print(\"✅ ¡Correcto!\")\n        else:\n            ___  # Resta una vida cuando la letra no está en la palabra\n            print(\"❌ ¡Incorrecto!\")\n\n    print(f\"Perdiste. La palabra era: {palabra}\")\n\njugar()",
    "options": [
      "vidas -= 1",
      "vidas += 1",
      "vidas = 0",
      "vidas = vidas - 2",
      "break",
      "pass"
    ],
    "hint": "Necesitas modificar la variable `vidas` usando el operador de asignación compuesta para restar 1.",
    "explanation": "La línea `vidas -= 1` es el corazón del sistema de vidas. Sin ella, el jugador nunca pierde vidas aunque falle, haciendo el juego imposible de perder. El operador -= es equivalente a escribir `vidas = vidas - 1`.",
    "correctAnswer": "vidas -= 1",
    "orderIndex": 25
  },
  {
    "id": 26,
    "title": "Proyecto: Detector de Rostros con Cámara",
    "description": "Este programa usa OpenCV para capturar video de la cámara y detectar rostros en tiempo real usando clasificadores Haar pre-entrenados. Identifica el método correcto de la API de OpenCV que realiza la detección. (Requiere: pip install opencv-python y una cámara conectada)",
    "topic": "Tryhard",
    "difficulty": "tryhard",
    "type": "fill_blank",
    "question": "import cv2\n\n# Clasificador pre-entrenado para detectar rostros frontales\ndetector = cv2.CascadeClassifier(\n    cv2.data.haarcascades + \"haarcascade_frontalface_default.xml\"\n)\n\ncamara = cv2.VideoCapture(0)  # 0 = cámara principal del dispositivo\nprint(\"Presiona 'q' para salir\")\n\nwhile True:\n    ret, frame = camara.read()\n    if not ret:\n        break\n\n    # El detector necesita la imagen en escala de grises\n    gris = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n\n    # Detectar rostros: scaleFactor reduce la imagen en cada paso,\n    # minNeighbors evita falsos positivos\n    rostros = detector.___(\n        gris,\n        scaleFactor=1.1,\n        minNeighbors=5,\n        minSize=(30, 30)\n    )\n\n    # Dibujar un rectángulo verde alrededor de cada rostro\n    for (x, y, w, h) in rostros:\n        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)\n        cv2.putText(frame, \"Rostro\", (x, y - 10),\n                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)\n\n    cv2.putText(frame, f\"Rostros detectados: {len(rostros)}\",\n                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)\n    cv2.imshow(\"Detector de Rostros - Pylearn\", frame)\n\n    if cv2.waitKey(1) & 0xFF == ord(\"q\"):\n        break\n\ncamara.release()\ncv2.destroyAllWindows()",
    "options": [
      "detectMultiScale",
      "findObjects",
      "detectFaces",
      "scanMultiScale",
      "getCascade",
      "matchTemplate"
    ],
    "hint": "El método de los CascadeClassifiers que 'escanea' la imagen a múltiples escalas para encontrar objetos se llama 'detectar a múltiples escalas' en inglés.",
    "explanation": "detectMultiScale() es el método central de OpenCV para detección de objetos. Analiza la imagen a diferentes tamaños (escalas) para encontrar rostros sin importar qué tan lejos o cerca estén de la cámara. Devuelve una lista de rectángulos (x, y, w, h) para cada rostro encontrado.",
    "correctAnswer": "detectMultiScale",
    "orderIndex": 26
  },
  {
    "id": 27,
    "title": "Proyecto: Red Neuronal desde Cero con NumPy",
    "description": "Implementa una red neuronal de dos capas desde cero usando solo NumPy para resolver el problema XOR (que no se puede resolver con regresión lineal). El reto está en el algoritmo de retropropagación (backpropagation), que propaga el error hacia atrás para ajustar los pesos. Identifica la variable que falta en el cálculo del error de la capa oculta. (Requiere: pip install numpy)",
    "topic": "Tryhard",
    "difficulty": "tryhard",
    "type": "fill_blank",
    "question": "import numpy as np\n\ndef sigmoide(x):\n    return 1 / (1 + np.exp(-x))\n\ndef sigmoide_prima(x):\n    return x * (1 - x)\n\nclass RedNeuronal:\n    def __init__(self, entradas, ocultas, salidas):\n        np.random.seed(42)\n        self.pesos1 = np.random.randn(entradas, ocultas) * 0.1  # capa oculta\n        self.pesos2 = np.random.randn(ocultas, salidas) * 0.1   # capa salida\n\n    def adelante(self, X):\n        self.capa1 = sigmoide(np.dot(X, self.pesos1))\n        self.salida = sigmoide(np.dot(self.capa1, self.pesos2))\n        return self.salida\n\n    def retropropagar(self, X, y, tasa=0.5):\n        # 1. Error en la capa de salida\n        error_salida = y - self.salida\n        delta_salida = error_salida * sigmoide_prima(self.salida)\n\n        # 2. Propagar el error hacia atrás a la capa oculta\n        #    El error oculto depende de los pesos que conectan\n        #    la capa oculta con la capa de salida\n        error_oculto = np.dot(delta_salida, ___.T)\n        delta_oculto = error_oculto * sigmoide_prima(self.capa1)\n\n        # 3. Actualizar pesos con gradiente descendente\n        self.pesos2 += tasa * np.dot(self.capa1.T, delta_salida)\n        self.pesos1 += tasa * np.dot(X.T, delta_oculto)\n\n# Problema XOR: salida = 1 solo cuando exactamente una entrada es 1\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])\ny = np.array([[0],    [1],    [1],    [0]])\n\nred = RedNeuronal(entradas=2, ocultas=4, salidas=1)\n\nfor epoca in range(10000):\n    salida = red.adelante(X)\n    red.retropropagar(X, y)\n    if epoca % 2500 == 0:\n        error = np.mean(np.abs(y - salida))\n        print(f\"Época {epoca:5d}: Error = {error:.4f}\")\n\nprint(\"\\nPredicciones XOR finales:\")\nfor entrada, objetivo in zip(X, y):\n    pred = red.adelante(entrada.reshape(1, -1))\n    print(f\"  {entrada} → {pred[0][0]:.3f}  (esperado: {objetivo[0]})\")",
    "options": [
      "self.pesos2",
      "self.pesos1",
      "self.capa1",
      "delta_salida",
      "y",
      "X"
    ],
    "hint": "En la retropropagación, el error de la capa oculta se calcula multiplicando el delta de salida por la TRANSPUESTA de los pesos que conectan la capa oculta con la salida.",
    "explanation": "La línea usa `self.pesos2` porque esos son los pesos que conectan la capa oculta con la capa de salida. Al multiplicar `delta_salida` por la transpuesta de `self.pesos2`, distribuimos el error de salida hacia cada neurona oculta proporcionalmente a cuánto contribuyó. Este es el núcleo del algoritmo backpropagation inventado en los años 80.",
    "correctAnswer": "self.pesos2",
    "orderIndex": 27
  }
];

