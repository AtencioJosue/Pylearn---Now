"""Compatibilidad educativa de Pygame para la pantalla web de Pylearn.

Implementa la parte de Pygame que aparece con mayor frecuencia en proyectos
introductorios: ventana, figuras, texto, imágenes, teclado, ratón, reloj,
rectángulos, vectores y sprites sencillos. No abre ventanas del sistema.
"""

import math as _math
import os as _os
import struct as _struct
import sys as _sys
import time as _time_module
import types as _types

import pylearn as _pylearn

__version__ = "2.6.0-pylearn"
ver = __version__
__path__ = []

NOEVENT = 0
QUIT = 0x100
KEYDOWN = 0x300
KEYUP = 0x301
MOUSEMOTION = 0x400
MOUSEBUTTONDOWN = 0x401
MOUSEBUTTONUP = 0x402
USEREVENT = 0x8000

K_BACKSPACE = 8
K_TAB = 9
K_RETURN = 13
K_ESCAPE = 27
K_SPACE = 32
K_DELETE = 127
K_UP = 1073741906
K_DOWN = 1073741905
K_LEFT = 1073741904
K_RIGHT = 1073741903
K_LSHIFT = 1073742049
K_RSHIFT = 1073742053
K_LCTRL = 1073742048
K_RCTRL = 1073742052

for _letter in "abcdefghijklmnopqrstuvwxyz":
    globals()["K_" + _letter] = ord(_letter)
for _digit in "0123456789":
    globals()["K_" + _digit] = ord(_digit)

KMOD_NONE = 0
KMOD_SHIFT = 1
KMOD_CTRL = 64
SRCALPHA = 0x10000
FULLSCREEN = 0x80000000
RESIZABLE = 0x10
SCALED = 0x200
BLEND_RGBA_MULT = 8

_KEY_NAMES = {
    K_UP: "ArrowUp",
    K_DOWN: "ArrowDown",
    K_LEFT: "ArrowLeft",
    K_RIGHT: "ArrowRight",
    K_ESCAPE: "Escape",
    K_RETURN: "Enter",
    K_SPACE: " ",
    K_TAB: "Tab",
    K_LSHIFT: "Shift",
    K_RSHIFT: "Shift",
    K_LCTRL: "Control",
    K_RCTRL: "Control",
}
for _letter in "abcdefghijklmnopqrstuvwxyz":
    _KEY_NAMES[ord(_letter)] = _letter
for _digit in "0123456789":
    _KEY_NAMES[ord(_digit)] = _digit

_NAMED_COLORS = {
    "black": "#000000",
    "white": "#ffffff",
    "red": "#ef4444",
    "green": "#22c55e",
    "blue": "#3b82f6",
    "yellow": "#facc15",
    "orange": "#f97316",
    "purple": "#a855f7",
    "pink": "#ec4899",
    "gray": "#64748b",
    "grey": "#64748b",
    "cyan": "#06b6d4",
    "magenta": "#d946ef",
}


def _channel(value):
    return max(0, min(255, int(value)))


class Color:
    def __init__(self, *value):
        if len(value) == 1:
            value = value[0]
        if isinstance(value, Color):
            self.r, self.g, self.b, self.a = value.r, value.g, value.b, value.a
        elif isinstance(value, str):
            text = value.strip().lower()
            text = _NAMED_COLORS.get(text, text)
            if text.startswith("#") and len(text) in (4, 7, 9):
                if len(text) == 4:
                    text = "#" + "".join(char * 2 for char in text[1:])
                self.r = int(text[1:3], 16)
                self.g = int(text[3:5], 16)
                self.b = int(text[5:7], 16)
                self.a = int(text[7:9], 16) if len(text) == 9 else 255
            else:
                self.r, self.g, self.b, self.a = 255, 255, 255, 255
        else:
            values = list(value) if hasattr(value, "__iter__") else [value]
            red = values[0] if len(values) > 0 else 0
            green = values[1] if len(values) > 1 else 0
            blue = values[2] if len(values) > 2 else 0
            self.r, self.g, self.b = map(_channel, (red, green, blue))
            self.a = _channel(values[3]) if len(values) > 3 else 255

    def __iter__(self):
        return iter((self.r, self.g, self.b, self.a))

    def __getitem__(self, index):
        return tuple(self)[index]

    def __len__(self):
        return 4

    def __repr__(self):
        return f"Color({self.r}, {self.g}, {self.b}, {self.a})"

    def __eq__(self, other):
        try:
            return tuple(self) == tuple(Color(other))
        except Exception:
            return False

    @property
    def css(self):
        if self.a >= 255:
            return f"rgb({self.r} {self.g} {self.b})"
        return f"rgb({self.r} {self.g} {self.b} / {self.a / 255:.3f})"


def _color(value):
    return Color(value).css


class Rect:
    def __init__(self, *args):
        if len(args) == 1:
            value = args[0]
            if isinstance(value, Rect):
                values = (value.x, value.y, value.w, value.h)
            else:
                values = tuple(value)
        elif len(args) == 2:
            values = tuple(args[0]) + tuple(args[1])
        else:
            values = args
        if len(values) != 4:
            raise TypeError("Rect necesita x, y, ancho y alto")
        self.x, self.y, self.w, self.h = (float(item) for item in values)

    width = property(lambda self: self.w, lambda self, value: setattr(self, "w", float(value)))
    height = property(lambda self: self.h, lambda self, value: setattr(self, "h", float(value)))
    left = property(lambda self: self.x, lambda self, value: setattr(self, "x", float(value)))
    top = property(lambda self: self.y, lambda self, value: setattr(self, "y", float(value)))
    right = property(
        lambda self: self.x + self.w,
        lambda self, value: setattr(self, "x", float(value) - self.w),
    )
    bottom = property(
        lambda self: self.y + self.h,
        lambda self, value: setattr(self, "y", float(value) - self.h),
    )
    centerx = property(
        lambda self: self.x + self.w / 2,
        lambda self, value: setattr(self, "x", float(value) - self.w / 2),
    )
    centery = property(
        lambda self: self.y + self.h / 2,
        lambda self, value: setattr(self, "y", float(value) - self.h / 2),
    )
    topleft = property(
        lambda self: (self.left, self.top),
        lambda self, value: (setattr(self, "left", value[0]), setattr(self, "top", value[1])),
    )
    topright = property(
        lambda self: (self.right, self.top),
        lambda self, value: (setattr(self, "right", value[0]), setattr(self, "top", value[1])),
    )
    bottomleft = property(
        lambda self: (self.left, self.bottom),
        lambda self, value: (setattr(self, "left", value[0]), setattr(self, "bottom", value[1])),
    )
    bottomright = property(
        lambda self: (self.right, self.bottom),
        lambda self, value: (setattr(self, "right", value[0]), setattr(self, "bottom", value[1])),
    )
    center = property(
        lambda self: (self.centerx, self.centery),
        lambda self, value: (setattr(self, "centerx", value[0]), setattr(self, "centery", value[1])),
    )
    midtop = property(
        lambda self: (self.centerx, self.top),
        lambda self, value: (setattr(self, "centerx", value[0]), setattr(self, "top", value[1])),
    )
    midbottom = property(
        lambda self: (self.centerx, self.bottom),
        lambda self, value: (setattr(self, "centerx", value[0]), setattr(self, "bottom", value[1])),
    )

    @property
    def size(self):
        return (self.w, self.h)

    @size.setter
    def size(self, value):
        self.w, self.h = map(float, value)

    def __iter__(self):
        return iter((self.x, self.y, self.w, self.h))

    def __getitem__(self, index):
        return tuple(self)[index]

    def __repr__(self):
        return f"<rect({int(self.x)}, {int(self.y)}, {int(self.w)}, {int(self.h)})>"

    def copy(self):
        return Rect(self)

    def move(self, x, y):
        return Rect(self.x + x, self.y + y, self.w, self.h)

    def move_ip(self, x, y):
        self.x += x
        self.y += y

    def inflate(self, x, y):
        result = self.copy()
        result.inflate_ip(x, y)
        return result

    def inflate_ip(self, x, y):
        self.x -= x / 2
        self.y -= y / 2
        self.w += x
        self.h += y

    def colliderect(self, other):
        other = Rect(other)
        return (
            self.left < other.right
            and self.right > other.left
            and self.top < other.bottom
            and self.bottom > other.top
        )

    def collidepoint(self, *point):
        if len(point) == 1:
            point = point[0]
        x, y = point
        return self.left <= x < self.right and self.top <= y < self.bottom

    def clamp_ip(self, other):
        other = Rect(other)
        if self.w >= other.w:
            self.centerx = other.centerx
        else:
            self.left = max(other.left, min(self.left, other.right - self.w))
        if self.h >= other.h:
            self.centery = other.centery
        else:
            self.top = max(other.top, min(self.top, other.bottom - self.h))

    def clamp(self, other):
        result = self.copy()
        result.clamp_ip(other)
        return result


FRect = Rect


class Surface:
    def __init__(self, size=(0, 0), flags=0, depth=0, *, _screen=False, _path=None, _text=None):
        self._width, self._height = (max(0, int(value)) for value in size)
        self._screen = _screen
        self._path = _path
        self._text = _text
        self._text_color = "#ffffff"
        self._text_background = None
        self._font_size = max(1, self._height)
        self._alpha = 255
        self._fill = "rgba(0,0,0,0)"

    def fill(self, color, rect=None, special_flags=0):
        css = _color(color)
        if self._screen and rect is None:
            _pylearn.limpiar(css)
            return Rect(0, 0, self._width, self._height)
        target = Rect(rect or (0, 0, self._width, self._height))
        if self._screen:
            _pylearn.rectangulo(*target, css)
        self._fill = css
        return target

    def blit(self, source, dest, area=None, special_flags=0):
        target = Rect(dest, source.get_size()) if len(tuple(dest)) == 2 else Rect(dest)
        if getattr(source, "_text", None) is not None:
            if source._text_background:
                _pylearn.rectangulo(target.x, target.y, source._width, source._height, source._text_background)
            _pylearn.texto(
                source._text,
                target.x,
                target.y + source._height / 2,
                source._font_size,
                source._text_color,
            )
        elif getattr(source, "_path", None):
            _pylearn.imagen(source._path, target.x, target.y, source._width, source._height)
        return Rect(target.x, target.y, source._width, source._height)

    def blits(self, blit_sequence, doreturn=1):
        results = [self.blit(*item) for item in blit_sequence]
        return results if doreturn else None

    def get_rect(self, **kwargs):
        result = Rect(0, 0, self._width, self._height)
        for name, value in kwargs.items():
            if hasattr(type(result), name):
                setattr(result, name, value)
        return result

    def get_width(self):
        return self._width

    def get_height(self):
        return self._height

    def get_size(self):
        return (self._width, self._height)

    def convert(self, *args, **kwargs):
        return self

    def convert_alpha(self, *args, **kwargs):
        return self

    def set_alpha(self, value, flags=0):
        self._alpha = 255 if value is None else _channel(value)

    def get_alpha(self):
        return self._alpha

    def set_colorkey(self, *args, **kwargs):
        return None

    def copy(self):
        result = Surface(
            self.get_size(),
            _screen=self._screen,
            _path=self._path,
            _text=self._text,
        )
        result.__dict__.update(self.__dict__)
        return result


_screen = None
_caption = "Juego de Pygame"
_initialized = False


def _set_mode(size=(0, 0), flags=0, depth=0, display=0, vsync=0):
    global _screen
    width, height = size
    width = width or 720
    height = height or 420
    _pylearn.pantalla(width, height, _caption)
    _screen = Surface((width, height), flags, depth, _screen=True)
    return _screen


def _set_caption(title, icontitle=None):
    global _caption
    _caption = str(title)
    if _screen is not None:
        _pylearn.pantalla(_screen._width, _screen._height, _caption)


def _display_update(*args, **kwargs):
    _pylearn._presentar()


def _display_info():
    return _types.SimpleNamespace(
        current_w=_screen._width if _screen else 720,
        current_h=_screen._height if _screen else 420,
    )


def _as_rect(value):
    return value if isinstance(value, Rect) else Rect(value)


def _draw_rect(surface, color, rect, width=0, border_radius=0, **kwargs):
    rect = _as_rect(rect)
    css = _color(color)
    if width:
        _pylearn.linea(rect.left, rect.top, rect.right, rect.top, css, width)
        _pylearn.linea(rect.right, rect.top, rect.right, rect.bottom, css, width)
        _pylearn.linea(rect.right, rect.bottom, rect.left, rect.bottom, css, width)
        _pylearn.linea(rect.left, rect.bottom, rect.left, rect.top, css, width)
    else:
        _pylearn.rectangulo(rect.x, rect.y, rect.w, rect.h, css, border_radius)
    return rect


def _draw_circle(surface, color, center, radius, width=0, **kwargs):
    _pylearn.circulo(center[0], center[1], radius, _color(color), width)
    return Rect(center[0] - radius, center[1] - radius, radius * 2, radius * 2)


def _draw_line(surface, color, start_pos, end_pos, width=1):
    _pylearn.linea(*start_pos, *end_pos, _color(color), width)
    left = min(start_pos[0], end_pos[0])
    top = min(start_pos[1], end_pos[1])
    return Rect(left, top, abs(end_pos[0] - start_pos[0]) or width, abs(end_pos[1] - start_pos[1]) or width)


def _draw_lines(surface, color, closed, points, width=1):
    points = list(points)
    for start, end in zip(points, points[1:]):
        _draw_line(surface, color, start, end, width)
    if closed and len(points) > 2:
        _draw_line(surface, color, points[-1], points[0], width)
    return _points_rect(points)


def _points_rect(points):
    points = list(points)
    if not points:
        return Rect(0, 0, 0, 0)
    xs, ys = zip(*points)
    return Rect(min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys))


def _draw_polygon(surface, color, points, width=0):
    points = list(points)
    _pylearn.poligono(points, _color(color), width)
    return _points_rect(points)


def _draw_ellipse(surface, color, rect, width=0):
    rect = _as_rect(rect)
    _pylearn.elipse(rect.x, rect.y, rect.w, rect.h, _color(color), width)
    return rect


def _draw_arc(surface, color, rect, start_angle, stop_angle, width=1):
    rect = _as_rect(rect)
    steps = max(4, int(abs(stop_angle - start_angle) * 16))
    points = []
    for index in range(steps + 1):
        angle = start_angle + (stop_angle - start_angle) * index / steps
        points.append((
            rect.centerx + _math.cos(angle) * rect.w / 2,
            rect.centery - _math.sin(angle) * rect.h / 2,
        ))
    return _draw_lines(surface, color, False, points, width)


class Font:
    def __init__(self, file=None, size=24):
        self.size_value = max(1, int(size))
        self.bold = False
        self.italic = False

    def render(self, text, antialias, color, background=None, wraplength=0):
        text = str(text)
        width = max(1, int(len(text) * self.size_value * 0.62))
        result = Surface((width, int(self.size_value * 1.35)), _text=text)
        result._font_size = self.size_value
        result._text_color = _color(color)
        result._text_background = None if background is None else _color(background)
        return result

    def size(self, text):
        return (max(1, int(len(str(text)) * self.size_value * 0.62)), int(self.size_value * 1.35))

    def get_height(self):
        return int(self.size_value * 1.35)

    def set_bold(self, value):
        self.bold = bool(value)

    def set_italic(self, value):
        self.italic = bool(value)


def _image_dimensions(path):
    try:
        with open(path, "rb") as source:
            head = source.read(32)
            if head.startswith(b"\x89PNG\r\n\x1a\n"):
                return _struct.unpack(">II", head[16:24])
            if head[:6] in (b"GIF87a", b"GIF89a"):
                return _struct.unpack("<HH", head[6:10])
    except Exception:
        pass
    return (64, 64)


def _load_image(filename, namehint=""):
    path = _os.path.realpath(_os.fspath(filename))
    relative = _os.path.relpath(path, "/workspace").replace("\\", "/")
    if relative.startswith("../"):
        raise FileNotFoundError("La imagen debe estar dentro del proyecto de Pylearn")
    return Surface(_image_dimensions(path), _path=relative)


def _save_image(surface, filename, namehint=""):
    raise RuntimeError("Para guardar la pantalla usa una imagen de Pillow o Matplotlib en Pylearn")


def _scale(surface, size, dest_surface=None):
    result = surface.copy()
    result._width, result._height = map(int, size)
    return result


def _rotate(surface, angle):
    return surface.copy()


class _Pressed:
    def __getitem__(self, key_value):
        name = _KEY_NAMES.get(key_value)
        return bool(name and _pylearn.tecla(name))


class Event:
    def __init__(self, event_type, attributes=None, **kwargs):
        self.type = event_type
        values = dict(attributes or {})
        values.update(kwargs)
        self.__dict__.update(values)

    def __repr__(self):
        return f"<Event({self.type}, {self.__dict__})>"


_event_queue = []
_previous_keys = {value: False for value in _KEY_NAMES}
_previous_mouse = (False, False, False)
_previous_position = (0, 0)


def _event_get(*args, **kwargs):
    global _previous_mouse, _previous_position
    result = list(_event_queue)
    _event_queue.clear()
    for code, name in _KEY_NAMES.items():
        pressed = bool(_pylearn.tecla(name))
        previous = _previous_keys.get(code, False)
        if pressed != previous:
            result.append(Event(KEYDOWN if pressed else KEYUP, key=code, unicode=name if len(name) == 1 else ""))
            if code == K_ESCAPE and pressed:
                result.append(Event(QUIT))
        _previous_keys[code] = pressed
    position = _pylearn.raton_posicion()
    buttons = tuple(_pylearn.raton(index + 1) for index in range(3))
    if position != _previous_position:
        result.append(Event(MOUSEMOTION, pos=position, rel=(position[0] - _previous_position[0], position[1] - _previous_position[1]), buttons=buttons))
    for index, (pressed, previous) in enumerate(zip(buttons, _previous_mouse), 1):
        if pressed != previous:
            result.append(Event(MOUSEBUTTONDOWN if pressed else MOUSEBUTTONUP, button=index, pos=position))
    _previous_position = position
    _previous_mouse = buttons
    return result


class Clock:
    def __init__(self):
        self._last = _time_module.monotonic()
        self._elapsed = 0.0

    def tick(self, framerate=0):
        _pylearn._presentar()
        now = _time_module.monotonic()
        if framerate:
            target = 1.0 / max(1.0, min(60.0, float(framerate)))
            remaining = target - (now - self._last)
            if remaining > 0:
                _time_module.sleep(remaining)
                now = _time_module.monotonic()
        self._elapsed = now - self._last
        self._last = now
        return int(self._elapsed * 1000)

    tick_busy_loop = tick

    def get_time(self):
        return int(self._elapsed * 1000)

    def get_fps(self):
        return 1.0 / self._elapsed if self._elapsed else 0.0


_started_at = _time_module.monotonic()


class Vector2:
    def __init__(self, x=0.0, y=0.0):
        if hasattr(x, "__iter__"):
            x, y = x
        self.x, self.y = float(x), float(y)

    def __iter__(self):
        return iter((self.x, self.y))

    def __getitem__(self, index):
        return (self.x, self.y)[index]

    def __repr__(self):
        return f"[{self.x}, {self.y}]"

    def __add__(self, other):
        other = Vector2(other)
        return Vector2(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        other = Vector2(other)
        return Vector2(self.x - other.x, self.y - other.y)

    def __mul__(self, value):
        return Vector2(self.x * value, self.y * value)

    __rmul__ = __mul__

    def __truediv__(self, value):
        return Vector2(self.x / value, self.y / value)

    def __iadd__(self, other):
        other = Vector2(other)
        self.x += other.x
        self.y += other.y
        return self

    def __isub__(self, other):
        other = Vector2(other)
        self.x -= other.x
        self.y -= other.y
        return self

    def __imul__(self, value):
        self.x *= value
        self.y *= value
        return self

    def length(self):
        return _math.hypot(self.x, self.y)

    def normalize(self):
        length = self.length()
        return self / length if length else Vector2()

    def normalize_ip(self):
        length = self.length()
        if length:
            self.x /= length
            self.y /= length

    def rotate(self, angle):
        radians = _math.radians(angle)
        return Vector2(self.x * _math.cos(radians) - self.y * _math.sin(radians), self.x * _math.sin(radians) + self.y * _math.cos(radians))

    def distance_to(self, other):
        return (self - other).length()


class Sprite:
    def __init__(self, *groups):
        self.image = Surface((0, 0))
        self.rect = Rect(0, 0, 0, 0)
        self._groups = set()
        for group in groups:
            group.add(self)

    def add(self, *groups):
        for group in groups:
            group.add(self)

    def remove(self, *groups):
        for group in groups:
            group.remove(self)

    def kill(self):
        for group in list(self._groups):
            group.remove(self)

    def update(self, *args, **kwargs):
        return None


class Group:
    def __init__(self, *sprites):
        self._sprites = []
        self.add(*sprites)

    def add(self, *sprites):
        for item in sprites:
            values = item if isinstance(item, (list, tuple, set, Group)) else [item]
            for sprite_item in values:
                if sprite_item not in self._sprites:
                    self._sprites.append(sprite_item)
                    sprite_item._groups.add(self)

    def remove(self, *sprites):
        for item in sprites:
            if item in self._sprites:
                self._sprites.remove(item)
                item._groups.discard(self)

    def update(self, *args, **kwargs):
        for item in list(self._sprites):
            item.update(*args, **kwargs)

    def draw(self, surface):
        return [surface.blit(item.image, item.rect) for item in self._sprites]

    def sprites(self):
        return list(self._sprites)

    def empty(self):
        self.remove(*list(self._sprites))

    def __iter__(self):
        return iter(self._sprites)

    def __len__(self):
        return len(self._sprites)

    def __contains__(self, item):
        return item in self._sprites


GroupSingle = Group


def _spritecollide(sprite_item, group, dokill, collided=None):
    test = collided or (lambda left, right: left.rect.colliderect(right.rect))
    matches = [other for other in group if test(sprite_item, other)]
    if dokill:
        for other in matches:
            other.kill()
    return matches


class _Sound:
    def __init__(self, *args, **kwargs):
        pass

    def play(self, *args, **kwargs):
        return _types.SimpleNamespace(stop=lambda: None)

    def stop(self):
        return None

    def set_volume(self, value):
        return None


class _Music:
    def load(self, *args, **kwargs):
        return None

    def play(self, *args, **kwargs):
        return None

    def stop(self):
        return None

    def set_volume(self, value):
        return None


def _module(module_name, **members):
    result = _types.ModuleType(f"pygame.{module_name}")
    result.__dict__.update(members)
    _sys.modules[result.__name__] = result
    globals()[module_name] = result
    return result


display = _module(
    "display",
    set_mode=_set_mode,
    get_surface=lambda: _screen,
    set_caption=_set_caption,
    get_caption=lambda: (_caption, _caption),
    flip=_display_update,
    update=_display_update,
    set_icon=lambda *args, **kwargs: None,
    Info=_display_info,
    get_init=lambda: _initialized,
    init=lambda: None,
    quit=lambda: None,
)
draw = _module(
    "draw",
    rect=_draw_rect,
    circle=_draw_circle,
    line=_draw_line,
    aaline=_draw_line,
    lines=_draw_lines,
    aalines=_draw_lines,
    polygon=_draw_polygon,
    ellipse=_draw_ellipse,
    arc=_draw_arc,
)
font = _module(
    "font",
    Font=Font,
    SysFont=lambda name, size, bold=False, italic=False: Font(name, size),
    get_default_font=lambda: "Pylearn Sans",
    get_fonts=lambda: ["sans", "monospace"],
    match_font=lambda *args, **kwargs: None,
    init=lambda: None,
    quit=lambda: None,
    get_init=lambda: True,
)
image = _module("image", load=_load_image, save=_save_image)
transform = _module(
    "transform",
    scale=_scale,
    smoothscale=_scale,
    scale_by=lambda surface, factor: _scale(surface, (surface.get_width() * factor, surface.get_height() * factor)),
    rotate=_rotate,
    rotozoom=lambda surface, angle, scale: _scale(_rotate(surface, angle), (surface.get_width() * scale, surface.get_height() * scale)),
    flip=lambda surface, xbool, ybool: surface.copy(),
)
key = _module(
    "key",
    get_pressed=lambda: _Pressed(),
    get_mods=lambda: (KMOD_SHIFT if _pylearn.tecla("Shift") else 0) | (KMOD_CTRL if _pylearn.tecla("Control") else 0),
    name=lambda code: _KEY_NAMES.get(code, "unknown"),
    key_code=lambda name: next((code for code, value in _KEY_NAMES.items() if value.lower() == str(name).lower()), 0),
    set_repeat=lambda *args, **kwargs: None,
)
event = _module(
    "event",
    Event=Event,
    get=_event_get,
    poll=lambda: (_event_get() or [Event(NOEVENT)])[0],
    wait=lambda: (_event_get() or [Event(NOEVENT)])[0],
    post=lambda item: _event_queue.append(item) or True,
    clear=lambda *args, **kwargs: _event_queue.clear(),
    pump=lambda: None,
    set_allowed=lambda *args, **kwargs: None,
    set_blocked=lambda *args, **kwargs: None,
)
mouse = _module(
    "mouse",
    get_pos=_pylearn.raton_posicion,
    get_pressed=lambda num_buttons=3: tuple(_pylearn.raton(index + 1) for index in range(num_buttons)),
    set_visible=lambda value: True,
    get_visible=lambda: True,
    set_pos=lambda *args, **kwargs: None,
)
time = _module(
    "time",
    Clock=Clock,
    get_ticks=lambda: int((_time_module.monotonic() - _started_at) * 1000),
    delay=lambda milliseconds: _time_module.sleep(max(0, milliseconds) / 1000),
    wait=lambda milliseconds: _time_module.sleep(max(0, milliseconds) / 1000),
    set_timer=lambda *args, **kwargs: None,
)
math = _module("math", Vector2=Vector2, Vector3=Vector2)
sprite = _module(
    "sprite",
    Sprite=Sprite,
    Group=Group,
    GroupSingle=GroupSingle,
    spritecollide=_spritecollide,
    collide_rect=lambda left, right: left.rect.colliderect(right.rect),
)
mixer = _module(
    "mixer",
    Sound=_Sound,
    music=_Music(),
    init=lambda *args, **kwargs: None,
    quit=lambda: None,
    get_init=lambda: None,
)

locals = _module("locals")
for _name, _value in list(globals().items()):
    if _name.isupper() or _name in ("Rect", "FRect", "Color", "Surface"):
        setattr(locals, _name, _value)
locals.__all__ = [name for name in locals.__dict__ if not name.startswith("_")]


def init():
    global _initialized
    _initialized = True
    return (5, 0)


def quit():
    global _initialized
    _initialized = False


def get_init():
    return _initialized


def get_sdl_version():
    return (2, 28, 4)


class error(RuntimeError):
    pass
