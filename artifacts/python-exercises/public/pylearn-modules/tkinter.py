"""Subconjunto de Tkinter adaptado al canvas web de Pylearn.

Permite ejecutar ejemplos educativos basados en Tk, especialmente los que
usan Canvas, after() y teclado. Las ventanas se muestran en la pestaña
Pantalla en lugar de abrir una aplicación del sistema.
"""

import heapq as _heapq
import sys as _sys
import time as _time
import types as _types

import pylearn as _pylearn

TkVersion = 8.6
TclVersion = 8.6
END = "end"
ALL = "all"
NW = "nw"
N = "n"
NE = "ne"
W = "w"
CENTER = "center"
E = "e"
SW = "sw"
S = "s"
SE = "se"
LEFT = "left"
RIGHT = "right"
TOP = "top"
BOTTOM = "bottom"
BOTH = "both"
X = "x"
Y = "y"
NORMAL = "normal"
DISABLED = "disabled"
HIDDEN = "hidden"


class TclError(RuntimeError):
    pass


class Event:
    def __init__(self, **values):
        self.__dict__.update(values)


def _key_name(sequence):
    text = str(sequence).strip("<>")
    text = text.replace("KeyPress-", "").replace("KeyRelease-", "")
    aliases = {
        "Up": "ArrowUp",
        "Down": "ArrowDown",
        "Left": "ArrowLeft",
        "Right": "ArrowRight",
        "space": " ",
        "Return": "Enter",
        "Escape": "Escape",
    }
    return aliases.get(text, text.lower() if len(text) == 1 else text)


class Tk:
    def __init__(self, *args, **kwargs):
        self._width = 720
        self._height = 420
        self._title = "Tkinter en Pylearn"
        self._background = "#f8fafc"
        self._running = True
        self._timers = []
        self._timer_id = 0
        self._widgets = []
        self._bindings = {}
        self._previous_keys = {}
        self._previous_mouse = False
        self._opened = False

    def _open(self):
        if not self._opened:
            _pylearn.pantalla(self._width, self._height, self._title, self._background)
            self._opened = True

    def title(self, value):
        self._title = str(value)
        self._opened = False

    wm_title = title

    def geometry(self, value):
        try:
            size = str(value).split("+")[0]
            width, height = size.lower().split("x", 1)
            self._width = max(240, min(1280, int(width)))
            self._height = max(160, min(720, int(height)))
            self._opened = False
        except Exception:
            pass

    def configure(self, **kwargs):
        self._background = kwargs.get("bg", kwargs.get("background", self._background))

    config = configure

    def resizable(self, *args, **kwargs):
        return None

    def minsize(self, *args, **kwargs):
        return None

    def maxsize(self, *args, **kwargs):
        return None

    def protocol(self, *args, **kwargs):
        return None

    def bind(self, sequence, callback, add=None):
        self._bindings[str(sequence)] = callback

    def unbind(self, sequence):
        self._bindings.pop(str(sequence), None)

    def after(self, milliseconds, callback=None, *args):
        self._timer_id += 1
        if callback is not None:
            _heapq.heappush(
                self._timers,
                (_time.monotonic() + max(0, milliseconds) / 1000, self._timer_id, callback, args),
            )
        return f"after#{self._timer_id}"

    def after_cancel(self, timer_id):
        try:
            number = int(str(timer_id).split("#")[-1])
            self._timers = [item for item in self._timers if item[1] != number]
            _heapq.heapify(self._timers)
        except Exception:
            pass

    def _events(self):
        for sequence, callback in list(self._bindings.items()):
            if "Key" not in sequence:
                continue
            key = _key_name(sequence)
            pressed = _pylearn.tecla(key)
            previous = self._previous_keys.get(key, False)
            release = "Release" in sequence
            if (pressed and not previous and not release) or (previous and not pressed and release):
                callback(Event(keysym=key, char=key if len(key) == 1 else ""))
            self._previous_keys[key] = pressed

        mouse_pressed = _pylearn.raton(1)
        mouse_position = _pylearn.raton_posicion()
        if mouse_pressed != self._previous_mouse:
            sequence = "<Button-1>" if mouse_pressed else "<ButtonRelease-1>"
            for widget in self._widgets:
                callback = widget._bindings.get(sequence)
                if callback:
                    callback(Event(x=mouse_position[0], y=mouse_position[1], num=1))
                widget._handle_pointer(mouse_position, mouse_pressed, self._previous_mouse)
        self._previous_mouse = mouse_pressed

    def _render(self):
        self._open()
        _pylearn.limpiar(self._background)
        for widget in self._widgets:
            widget._render()
        _pylearn._presentar()

    def update(self):
        self._events()
        self._render()

    update_idletasks = update

    def mainloop(self, n=0):
        self._running = True
        self._render()
        interactive = bool(self._timers or self._bindings or any(widget._interactive for widget in self._widgets))
        if not interactive:
            return
        while self._running and not _pylearn.tecla("Escape"):
            now = _time.monotonic()
            while self._timers and self._timers[0][0] <= now:
                _, _, callback, args = _heapq.heappop(self._timers)
                callback(*args)
            self.update()
            _time.sleep(1 / 60)

    def destroy(self):
        self._running = False

    quit = destroy

    def withdraw(self):
        return None


_default_root = None


def _root(master=None):
    global _default_root
    if master is not None:
        return master
    if _default_root is None:
        _default_root = Tk()
    return _default_root


class Widget:
    _interactive = False

    def __init__(self, master=None, **kwargs):
        self.master = _root(master)
        self.options = dict(kwargs)
        self._bindings = {}
        self._layout = {"x": 16, "y": 16, "width": kwargs.get("width", 160), "height": kwargs.get("height", 38)}
        self._visible = False
        self.master._widgets.append(self)

    def configure(self, **kwargs):
        self.options.update(kwargs)

    config = configure

    def cget(self, key):
        return self.options.get(key)

    def pack(self, **kwargs):
        self._visible = True
        visible = [widget for widget in self.master._widgets if widget._visible and widget is not self]
        self._layout["y"] = 16 + sum(widget._layout["height"] + 8 for widget in visible)
        if kwargs.get("fill") in (X, BOTH):
            self._layout["width"] = self.master._width - 32
        return self

    def grid(self, row=0, column=0, padx=6, pady=6, **kwargs):
        self._visible = True
        self._layout["x"] = 16 + column * 180 + int(padx or 0)
        self._layout["y"] = 16 + row * 50 + int(pady or 0)
        return self

    def place(self, x=0, y=0, width=None, height=None, **kwargs):
        self._visible = True
        self._layout.update(x=x, y=y)
        if width is not None:
            self._layout["width"] = width
        if height is not None:
            self._layout["height"] = height
        return self

    def bind(self, sequence, callback, add=None):
        self._bindings[str(sequence)] = callback

    def destroy(self):
        if self in self.master._widgets:
            self.master._widgets.remove(self)

    def _render(self):
        return None

    def _handle_pointer(self, position, pressed, previous):
        return None


class Canvas(Widget):
    def __init__(self, master=None, **kwargs):
        super().__init__(master, **kwargs)
        self._layout.update(x=0, y=0, width=int(kwargs.get("width", 720)), height=int(kwargs.get("height", 420)))
        self.master._width = max(240, min(1280, self._layout["width"]))
        self.master._height = max(160, min(720, self._layout["height"]))
        self._background = kwargs.get("bg", kwargs.get("background", "white"))
        self._items = {}
        self._next_item = 1

    def pack(self, **kwargs):
        self._visible = True
        return self

    grid = pack

    def _create(self, kind, coords, **options):
        item = self._next_item
        self._next_item += 1
        self._items[item] = {"kind": kind, "coords": list(coords), "options": dict(options)}
        return item

    def create_rectangle(self, *coords, **options):
        return self._create("rectangle", coords, **options)

    def create_oval(self, *coords, **options):
        return self._create("oval", coords, **options)

    def create_line(self, *coords, **options):
        return self._create("line", coords, **options)

    def create_polygon(self, *coords, **options):
        return self._create("polygon", coords, **options)

    def create_text(self, *coords, **options):
        return self._create("text", coords, **options)

    def create_image(self, *coords, **options):
        return self._create("image", coords, **options)

    def create_arc(self, *coords, **options):
        return self._create("oval", coords, **options)

    def coords(self, item, *new_coords):
        if item not in self._items:
            return []
        if new_coords:
            self._items[item]["coords"] = list(new_coords)
        return list(self._items[item]["coords"])

    def move(self, item, dx, dy):
        if item not in self._items:
            return
        coords = self._items[item]["coords"]
        for index in range(0, len(coords), 2):
            coords[index] += dx
            coords[index + 1] += dy

    def itemconfigure(self, item, **options):
        if item in self._items:
            self._items[item]["options"].update(options)

    itemconfig = itemconfigure

    def itemcget(self, item, option):
        return self._items.get(item, {}).get("options", {}).get(option, "")

    def delete(self, *items):
        if ALL in items or "all" in items:
            self._items.clear()
        else:
            for item in items:
                self._items.pop(item, None)

    def bbox(self, item=ALL):
        values = list(self._items.values()) if item in (ALL, "all") else [self._items.get(item)]
        coords = [number for value in values if value for number in value["coords"]]
        if len(coords) < 2:
            return None
        xs, ys = coords[::2], coords[1::2]
        return (min(xs), min(ys), max(xs), max(ys))

    def tag_bind(self, *args, **kwargs):
        return None

    def focus_set(self):
        return None

    def _render(self):
        if not self._visible:
            return
        _pylearn.limpiar(self._background)
        for value in self._items.values():
            kind, coords, options = value["kind"], value["coords"], value["options"]
            fill = options.get("fill", options.get("outline", "#334155"))
            width = int(options.get("width", 0) or 0)
            if kind == "rectangle" and len(coords) >= 4:
                x1, y1, x2, y2 = coords[:4]
                _pylearn.rectangulo(x1, y1, x2 - x1, y2 - y1, fill)
            elif kind == "oval" and len(coords) >= 4:
                x1, y1, x2, y2 = coords[:4]
                _pylearn.elipse(x1, y1, x2 - x1, y2 - y1, fill, width)
            elif kind == "line" and len(coords) >= 4:
                for index in range(0, len(coords) - 2, 2):
                    _pylearn.linea(coords[index], coords[index + 1], coords[index + 2], coords[index + 3], fill, max(1, width))
            elif kind == "polygon" and len(coords) >= 6:
                _pylearn.poligono(list(zip(coords[::2], coords[1::2])), fill, width)
            elif kind == "text" and len(coords) >= 2:
                font = options.get("font", ("Arial", 18))
                size = font[1] if isinstance(font, (list, tuple)) and len(font) > 1 else 18
                _pylearn.texto(options.get("text", ""), coords[0], coords[1], size, fill, "centro")
            elif kind == "image" and len(coords) >= 2:
                image = options.get("image")
                if image and image.file:
                    _pylearn.imagen(image.file, coords[0], coords[1], image.width(), image.height())


class Label(Widget):
    def _render(self):
        if self._visible:
            _pylearn.texto(self.options.get("text", ""), self._layout["x"], self._layout["y"] + 18, 18, self.options.get("fg", "#0f172a"))


class Button(Widget):
    _interactive = True

    def _render(self):
        if not self._visible:
            return
        box = self._layout
        _pylearn.rectangulo(box["x"], box["y"], box["width"], box["height"], self.options.get("bg", "#2563eb"), 7)
        _pylearn.texto(self.options.get("text", "Botón"), box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, 16, self.options.get("fg", "white"), "centro")

    def _handle_pointer(self, position, pressed, previous):
        box = self._layout
        inside = box["x"] <= position[0] <= box["x"] + box["width"] and box["y"] <= position[1] <= box["y"] + box["height"]
        if inside and not pressed and previous and callable(self.options.get("command")):
            self.options["command"]()

    def invoke(self):
        if callable(self.options.get("command")):
            return self.options["command"]()


class Entry(Widget):
    _interactive = True

    def __init__(self, master=None, **kwargs):
        super().__init__(master, **kwargs)
        self._value = ""

    def get(self):
        return self._value

    def insert(self, index, text):
        index = len(self._value) if index == END else int(index)
        self._value = self._value[:index] + str(text) + self._value[index:]

    def delete(self, first, last=None):
        if first == 0 and last in (None, END):
            self._value = ""

    def _render(self):
        if self._visible:
            box = self._layout
            _pylearn.rectangulo(box["x"], box["y"], box["width"], box["height"], "white", 5)
            _pylearn.texto(self._value or self.options.get("placeholder", ""), box["x"] + 8, box["y"] + box["height"] / 2, 16, "#0f172a")


class Frame(Widget):
    pass


class PhotoImage:
    def __init__(self, file=None, width=64, height=64, **kwargs):
        self.file = str(file).replace("\\", "/") if file else ""
        self._width = int(width)
        self._height = int(height)

    def width(self):
        return self._width

    def height(self):
        return self._height


StringVar = lambda value="", **kwargs: _Variable(value)
IntVar = lambda value=0, **kwargs: _Variable(value)
DoubleVar = lambda value=0.0, **kwargs: _Variable(value)
BooleanVar = lambda value=False, **kwargs: _Variable(value)


class _Variable:
    def __init__(self, value=None):
        self._value = value

    def get(self):
        return self._value

    def set(self, value):
        self._value = value


def mainloop(n=0):
    return _root().mainloop(n)


def _submodule(name, **members):
    module = _types.ModuleType(f"tkinter.{name}")
    module.__dict__.update(members)
    _sys.modules[module.__name__] = module
    globals()[name] = module
    return module


messagebox = _submodule(
    "messagebox",
    showinfo=lambda title, message, **kwargs: print(f"{title}: {message}"),
    showwarning=lambda title, message, **kwargs: print(f"{title}: {message}"),
    showerror=lambda title, message, **kwargs: print(f"{title}: {message}"),
    askyesno=lambda *args, **kwargs: True,
)
filedialog = _submodule(
    "filedialog",
    askopenfilename=lambda *args, **kwargs: "",
    asksaveasfilename=lambda *args, **kwargs: "",
)
ttk = _submodule(
    "ttk",
    Frame=Frame,
    Label=Label,
    Button=Button,
    Entry=Entry,
)

