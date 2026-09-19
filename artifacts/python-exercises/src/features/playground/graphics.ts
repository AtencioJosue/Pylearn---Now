export const GAME_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "w",
  "a",
  "s",
  "d",
  "b",
  "c",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "t",
  "u",
  "v",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  " ",
  "Enter",
  "Escape",
  "Shift",
  "Control",
  "Tab",
] as const;

export const POINTER_CONTROL_OFFSET = GAME_KEYS.length;
export const CONTROL_SLOTS = POINTER_CONTROL_OFFSET + 5;

export type GraphicsCommand =
  | { t: "clear"; color: string }
  | {
      t: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      radius: number;
    }
  | {
      t: "circle";
      x: number;
      y: number;
      radius: number;
      color: string;
      width: number;
    }
  | {
      t: "ellipse";
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      width: number;
    }
  | {
      t: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
      width: number;
    }
  | {
      t: "text";
      text: string;
      x: number;
      y: number;
      size: number;
      color: string;
      align: "left" | "center" | "right";
    }
  | {
      t: "polygon";
      points: Array<[number, number]>;
      color: string;
      width: number;
    }
  | {
      t: "image";
      path: string;
      x: number;
      y: number;
      w?: number;
      h?: number;
    };

interface GraphicsBase {
  session: number;
  revision: number;
  title: string;
}

export interface CanvasGraphicsOutput extends GraphicsBase {
  kind: "canvas";
  width: number;
  height: number;
  background: string;
  commands: GraphicsCommand[];
}

export interface ImageGraphicsOutput extends GraphicsBase {
  kind: "image";
  dataUrl: string;
}

export type GraphicsOutput = CanvasGraphicsOutput | ImageGraphicsOutput;

const finite = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  Math.min(max, Math.max(min, finite(value, fallback)));

const shortText = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.slice(0, 500) : fallback;

const color = (value: unknown, fallback = "#0f172a") =>
  shortText(value, fallback).slice(0, 64) || fallback;

function sanitizeCommand(value: unknown): GraphicsCommand | null {
  if (!value || typeof value !== "object") return null;
  const command = value as Record<string, unknown>;
  if (command.t === "clear") {
    return { t: "clear", color: color(command.color) };
  }
  if (command.t === "rect") {
    return {
      t: "rect",
      x: finite(command.x),
      y: finite(command.y),
      w: clamp(command.w, 0, 5000, 0),
      h: clamp(command.h, 0, 5000, 0),
      color: color(command.color, "#38bdf8"),
      radius: clamp(command.radius, 0, 500, 0),
    };
  }
  if (command.t === "circle") {
    return {
      t: "circle",
      x: finite(command.x),
      y: finite(command.y),
      radius: clamp(command.radius, 0, 2500, 0),
      color: color(command.color, "#38bdf8"),
      width: clamp(command.width, 0, 100, 0),
    };
  }
  if (command.t === "ellipse") {
    return {
      t: "ellipse",
      x: finite(command.x),
      y: finite(command.y),
      w: clamp(command.w, 0, 5000, 0),
      h: clamp(command.h, 0, 5000, 0),
      color: color(command.color, "#38bdf8"),
      width: clamp(command.width, 0, 100, 0),
    };
  }
  if (command.t === "line") {
    return {
      t: "line",
      x1: finite(command.x1),
      y1: finite(command.y1),
      x2: finite(command.x2),
      y2: finite(command.y2),
      color: color(command.color, "#e2e8f0"),
      width: clamp(command.width, 1, 100, 2),
    };
  }
  if (command.t === "text") {
    const align = ["left", "center", "right"].includes(String(command.align))
      ? (command.align as "left" | "center" | "right")
      : "left";
    return {
      t: "text",
      text: shortText(command.text),
      x: finite(command.x),
      y: finite(command.y),
      size: clamp(command.size, 6, 180, 24),
      color: color(command.color, "#f8fafc"),
      align,
    };
  }
  if (command.t === "polygon" && Array.isArray(command.points)) {
    const points = command.points
      .slice(0, 500)
      .filter((point) => Array.isArray(point) && point.length >= 2)
      .map((point) => [finite(point[0]), finite(point[1])] as [number, number]);
    if (points.length < 3) return null;
    return {
      t: "polygon",
      points,
      color: color(command.color, "#38bdf8"),
      width: clamp(command.width, 0, 100, 0),
    };
  }
  if (command.t === "image") {
    const path = shortText(command.path).replaceAll("\\", "/");
    if (!path || path.startsWith("/") || path.includes("..")) return null;
    const w = command.w == null ? undefined : clamp(command.w, 1, 5000, 1);
    const h = command.h == null ? undefined : clamp(command.h, 1, 5000, 1);
    return {
      t: "image",
      path,
      x: finite(command.x),
      y: finite(command.y),
      ...(w == null ? {} : { w }),
      ...(h == null ? {} : { h }),
    };
  }
  return null;
}

export function applyGraphicsMessage(
  previous: GraphicsOutput | null,
  value: unknown,
  session: number,
): GraphicsOutput | null {
  if (!value || typeof value !== "object") return previous;
  const message = value as Record<string, unknown>;
  const revision = (previous?.revision ?? 0) + 1;
  if (message.action === "open") {
    return {
      kind: "canvas",
      session,
      revision,
      width: Math.round(clamp(message.width, 240, 1280, 720)),
      height: Math.round(clamp(message.height, 160, 720, 420)),
      title: shortText(message.title, "Mi juego") || "Mi juego",
      background: color(message.background),
      commands: [],
    };
  }
  if (message.action === "frame") {
    const current =
      previous?.kind === "canvas" && previous.session === session
        ? previous
        : {
            kind: "canvas" as const,
            session,
            revision: 0,
            width: 720,
            height: 420,
            title: "Mi juego",
            background: "#0f172a",
            commands: [],
          };
    const commands = Array.isArray(message.commands)
      ? message.commands
          .slice(0, 2000)
          .map(sanitizeCommand)
          .filter((command): command is GraphicsCommand => command !== null)
      : [];
    return { ...current, revision, commands };
  }
  if (message.action === "image") {
    const data = typeof message.data === "string" ? message.data : "";
    if (!data || data.length > 12 * 1024 * 1024) return previous;
    return {
      kind: "image",
      session,
      revision,
      title:
        shortText(message.title, "Gráfico de Python") || "Gráfico de Python",
      dataUrl: `data:image/png;base64,${data}`,
    };
  }
  return previous;
}

export function gameKeyIndex(key: string) {
  const normalized = key.length === 1 && key !== " " ? key.toLowerCase() : key;
  return GAME_KEYS.indexOf(normalized as (typeof GAME_KEYS)[number]);
}

export const GAME_TEMPLATE = `from pylearn import (
    pantalla, limpiar, rectangulo, circulo,
    texto, tecla, actualizar
)

ANCHO, ALTO = 720, 420
pantalla(ANCHO, ALTO, "Mi primer juego")

x, y = 80, 310
pelota_x, pelota_y = 360, 170
vel_x, vel_y = 4, 3

while not tecla("escape"):
    if tecla("izquierda"):
        x -= 6
    if tecla("derecha"):
        x += 6
    if tecla("arriba"):
        y -= 6
    if tecla("abajo"):
        y += 6

    x = max(0, min(ANCHO - 70, x))
    y = max(45, min(ALTO - 40, y))

    pelota_x += vel_x
    pelota_y += vel_y
    if pelota_x < 16 or pelota_x > ANCHO - 16:
        vel_x *= -1
    if pelota_y < 60 or pelota_y > ALTO - 16:
        vel_y *= -1

    limpiar("#081426")
    texto("Flechas para moverte · Esc para salir", 20, 30, 18, "#bae6fd")
    rectangulo(x, y, 70, 28, "#38bdf8", radio=8)
    circulo(pelota_x, pelota_y, 15, "#facc15")
    actualizar(60)

print("Juego terminado")
`;

export const PYGAME_TEMPLATE = `import pygame

pygame.init()
ANCHO, ALTO = 720, 420
pantalla = pygame.display.set_mode((ANCHO, ALTO))
pygame.display.set_caption("Mi juego con Pygame")
reloj = pygame.time.Clock()
fuente = pygame.font.Font(None, 28)

jugador = pygame.Rect(70, 310, 72, 30)
pelota = pygame.Vector2(360, 170)
velocidad = pygame.Vector2(4, 3)
activo = True

while activo:
    for evento in pygame.event.get():
        if evento.type == pygame.QUIT:
            activo = False

    teclas = pygame.key.get_pressed()
    if teclas[pygame.K_LEFT]:
        jugador.x -= 6
    if teclas[pygame.K_RIGHT]:
        jugador.x += 6
    if teclas[pygame.K_UP]:
        jugador.y -= 6
    if teclas[pygame.K_DOWN]:
        jugador.y += 6
    jugador.clamp_ip(pantalla.get_rect())

    pelota += velocidad
    if pelota.x < 16 or pelota.x > ANCHO - 16:
        velocidad.x *= -1
    if pelota.y < 60 or pelota.y > ALTO - 16:
        velocidad.y *= -1

    pantalla.fill((8, 20, 38))
    pygame.draw.rect(pantalla, (56, 189, 248), jugador, border_radius=8)
    pygame.draw.circle(pantalla, (250, 204, 21), pelota, 15)
    ayuda = fuente.render("Flechas para moverte · Esc para salir", True, "white")
    pantalla.blit(ayuda, (20, 18))
    pygame.display.flip()
    reloj.tick(60)

pygame.quit()
print("Juego terminado")
`;

export const CHART_TEMPLATE = `import matplotlib.pyplot as plt

dias = ["Lun", "Mar", "Mié", "Jue", "Vie"]
puntos = [12, 18, 15, 27, 34]

plt.figure(figsize=(8, 4))
plt.plot(dias, puntos, marker="o", linewidth=3, color="#38bdf8")
plt.fill_between(dias, puntos, alpha=0.2, color="#38bdf8")
plt.title("Mi progreso semanal")
plt.xlabel("Día")
plt.ylabel("Puntos")
plt.grid(alpha=0.25)
plt.tight_layout()
plt.show()
`;
