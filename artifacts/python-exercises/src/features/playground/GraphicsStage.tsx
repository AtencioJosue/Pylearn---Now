import { useEffect, useMemo, useRef, useState } from "react";
import { Gamepad2, Keyboard, Maximize2 } from "lucide-react";
import type { ProjectFile } from "./model";
import {
  gameKeyIndex,
  type CanvasGraphicsOutput,
  type GraphicsCommand,
  type GraphicsOutput,
} from "./graphics";

interface GraphicsStageProps {
  output: GraphicsOutput;
  files: ProjectFile[];
  running: boolean;
  keyboardAvailable: boolean;
  onKeyChange: (key: string, pressed: boolean) => void;
  onPointerMove: (x: number, y: number) => void;
  onPointerButton: (button: number, pressed: boolean) => void;
  onClearKeys: () => void;
}

function imageMime(path: string) {
  if (/\.png$/i.test(path)) return "image/png";
  if (/\.jpe?g$/i.test(path)) return "image/jpeg";
  if (/\.webp$/i.test(path)) return "image/webp";
  if (/\.gif$/i.test(path)) return "image/gif";
  return "";
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(
    Math.abs(width) / 2,
    Math.abs(height) / 2,
    radius,
  );
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
  context.fill();
}

function drawCommand(
  context: CanvasRenderingContext2D,
  command: GraphicsCommand,
  files: Map<string, ProjectFile>,
  images: Map<string, HTMLImageElement>,
  redraw: () => void,
) {
  if (command.t === "clear") {
    context.fillStyle = command.color;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    return;
  }
  if (command.t === "rect") {
    context.fillStyle = command.color;
    roundedRect(
      context,
      command.x,
      command.y,
      command.w,
      command.h,
      command.radius,
    );
    return;
  }
  if (command.t === "circle") {
    context.beginPath();
    context.arc(command.x, command.y, command.radius, 0, Math.PI * 2);
    if (command.width) {
      context.strokeStyle = command.color;
      context.lineWidth = command.width;
      context.stroke();
    } else {
      context.fillStyle = command.color;
      context.fill();
    }
    return;
  }
  if (command.t === "ellipse") {
    context.beginPath();
    context.ellipse(
      command.x + command.w / 2,
      command.y + command.h / 2,
      command.w / 2,
      command.h / 2,
      0,
      0,
      Math.PI * 2,
    );
    if (command.width) {
      context.strokeStyle = command.color;
      context.lineWidth = command.width;
      context.stroke();
    } else {
      context.fillStyle = command.color;
      context.fill();
    }
    return;
  }
  if (command.t === "line") {
    context.beginPath();
    context.moveTo(command.x1, command.y1);
    context.lineTo(command.x2, command.y2);
    context.strokeStyle = command.color;
    context.lineWidth = command.width;
    context.lineCap = "round";
    context.stroke();
    return;
  }
  if (command.t === "text") {
    context.fillStyle = command.color;
    context.font = `700 ${command.size}px system-ui, sans-serif`;
    context.textAlign = command.align;
    context.textBaseline = "middle";
    context.fillText(command.text, command.x, command.y);
    return;
  }
  if (command.t === "polygon") {
    context.beginPath();
    context.moveTo(command.points[0][0], command.points[0][1]);
    for (const [x, y] of command.points.slice(1)) context.lineTo(x, y);
    context.closePath();
    if (command.width) {
      context.strokeStyle = command.color;
      context.lineWidth = command.width;
      context.lineJoin = "round";
      context.stroke();
    } else {
      context.fillStyle = command.color;
      context.fill();
    }
    return;
  }
  const file = files.get(command.path);
  const mime = file ? imageMime(file.path) : "";
  if (!file || file.encoding !== "base64" || !mime) return;
  let image = images.get(command.path);
  if (!image) {
    image = new Image();
    image.onload = redraw;
    image.src = `data:${mime};base64,${file.content}`;
    images.set(command.path, image);
  }
  if (!image.complete || !image.naturalWidth) return;
  context.drawImage(
    image,
    command.x,
    command.y,
    command.w ?? image.naturalWidth,
    command.h ?? image.naturalHeight,
  );
}

export function GraphicsStage({
  output,
  files,
  running,
  keyboardAvailable,
  onKeyChange,
  onPointerMove,
  onPointerButton,
  onClearKeys,
}: GraphicsStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef(new Map<string, HTMLImageElement>());
  const latestRef = useRef(output);
  const clearKeysRef = useRef(onClearKeys);
  const [focused, setFocused] = useState(false);
  latestRef.current = output;
  clearKeysRef.current = onClearKeys;
  const filesByPath = useMemo(
    () => new Map(files.map((file) => [file.path, file])),
    [files],
  );

  useEffect(() => {
    if (output.kind !== "canvas") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = output.width;
    canvas.height = output.height;
    const draw = (screen: CanvasGraphicsOutput) => {
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = screen.background;
      context.fillRect(0, 0, screen.width, screen.height);
      for (const command of screen.commands) {
        drawCommand(context, command, filesByPath, imagesRef.current, () => {
          const latest = latestRef.current;
          if (latest.kind === "canvas" && latest.revision === screen.revision)
            draw(latest);
        });
      }
    };
    draw(output);
  }, [filesByPath, output]);

  useEffect(
    () => () => {
      clearKeysRef.current();
    },
    [output.session],
  );

  const handleKey = (key: string, pressed: boolean) => {
    if (gameKeyIndex(key) < 0) return;
    onKeyChange(key, pressed);
  };

  const updatePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    onPointerMove(
      ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    );
  };

  return (
    <div className="wb-graphics-panel">
      <div className="wb-graphics-heading">
        <div>
          {output.kind === "canvas" ? (
            <Gamepad2 size={17} aria-hidden="true" />
          ) : (
            <span aria-hidden="true">📊</span>
          )}
          <strong>{output.title}</strong>
          {output.kind === "canvas" && (
            <small>
              {output.width} × {output.height}
            </small>
          )}
        </div>
        <div>
          {output.kind === "canvas" && (
            <span className={focused ? "is-focused" : ""}>
              <Keyboard size={13} />
              {keyboardAvailable
                ? focused
                  ? "Teclado activo"
                  : "Haz clic para jugar"
                : "Teclado no disponible"}
            </span>
          )}
          <button
            type="button"
            onClick={() => void containerRef.current?.requestFullscreen()}
            title="Pantalla completa"
            aria-label="Abrir pantalla gráfica a pantalla completa"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="wb-graphics-viewport"
        data-running={running || undefined}
      >
        {output.kind === "canvas" ? (
          <canvas
            ref={canvasRef}
            tabIndex={0}
            aria-label={`${output.title}. Pantalla interactiva del juego`}
            style={{ aspectRatio: `${output.width} / ${output.height}` }}
            onPointerMove={updatePointer}
            onPointerDown={(event) => {
              event.currentTarget.focus();
              event.currentTarget.setPointerCapture(event.pointerId);
              updatePointer(event);
              onPointerButton(event.button, true);
            }}
            onPointerUp={(event) => {
              updatePointer(event);
              onPointerButton(event.button, false);
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={(event) => {
              onPointerButton(event.button, false);
            }}
            onContextMenu={(event) => event.preventDefault()}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onClearKeys();
            }}
            onKeyDown={(event) => {
              if (gameKeyIndex(event.key) < 0) return;
              event.preventDefault();
              event.stopPropagation();
              handleKey(event.key, true);
            }}
            onKeyUp={(event) => {
              if (gameKeyIndex(event.key) < 0) return;
              event.preventDefault();
              event.stopPropagation();
              handleKey(event.key, false);
            }}
          />
        ) : (
          <img src={output.dataUrl} alt={output.title} />
        )}
      </div>
    </div>
  );
}
