"""Turtle compatible con la pantalla web de Pylearn."""

import heapq as _heapq
import math as _math
import time as _time

import pylearn as _pylearn

_width = 720
_height = 420
_background = "white"
_title = "Turtle en Pylearn"
_opened = False
_running = True
_timers = []
_timer_sequence = 0
_key_down = {}
_key_up = {}
_previous_keys = {}


def _open():
    global _opened
    if not _opened:
        _pylearn.pantalla(_width, _height, _title, _background)
        _pylearn.limpiar(_background)
        _opened = True


def _screen_point(x, y):
    return (_width / 2 + x, _height / 2 - y)


class _Screen:
    def setup(self, width=720, height=420, startx=None, starty=None):
        global _width, _height, _opened
        if 0 < width <= 1:
            width = int(720 * width)
        if 0 < height <= 1:
            height = int(420 * height)
        _width = max(240, min(1280, int(width)))
        _height = max(160, min(720, int(height)))
        _opened = False
        _open()
        return self

    def title(self, value):
        global _title, _opened
        _title = str(value)
        _opened = False
        _open()

    def bgcolor(self, value=None):
        global _background
        if value is None:
            return _background
        _background = str(value)
        _open()
        _pylearn.limpiar(_background)

    def clearscreen(self):
        _open()
        _pylearn.limpiar(_background)

    clear = clearscreen
    reset = clearscreen

    def tracer(self, *args, **kwargs):
        return None

    def update(self):
        _open()
        _pylearn._presentar()

    def listen(self, *args, **kwargs):
        return None

    def onkey(self, fun, key):
        _key_down[str(key)] = fun

    onkeypress = onkey

    def onkeyrelease(self, fun, key):
        _key_up[str(key)] = fun

    def ontimer(self, fun, t=0):
        global _timer_sequence
        _timer_sequence += 1
        _heapq.heappush(
            _timers,
            (_time.monotonic() + max(0, t) / 1000, _timer_sequence, fun),
        )

    def mainloop(self):
        global _running
        _open()
        _running = True
        if not _timers and not _key_down and not _key_up:
            _pylearn._presentar()
            return
        watched = set(_key_down) | set(_key_up) | {"Escape"}
        while _running:
            now = _time.monotonic()
            while _timers and _timers[0][0] <= now:
                _, _, callback = _heapq.heappop(_timers)
                callback()
            for key in watched:
                pressed = _pylearn.tecla(key)
                previous = _previous_keys.get(key, False)
                if pressed and not previous and key in _key_down:
                    _key_down[key]()
                if previous and not pressed and key in _key_up:
                    _key_up[key]()
                _previous_keys[key] = pressed
            if _pylearn.tecla("Escape"):
                break
            _pylearn._presentar()
            _time.sleep(1 / 60)

    def bye(self):
        global _running
        _running = False

    def exitonclick(self):
        _pylearn._presentar()

    def window_width(self):
        return _width

    def window_height(self):
        return _height

    def colormode(self, value=None):
        return 255 if value is None else None


_screen = _Screen()


class Turtle:
    def __init__(self, shape="classic", visible=True):
        _open()
        self._x = 0.0
        self._y = 0.0
        self._heading = 0.0
        self._pen_down = True
        self._pen_color = "black"
        self._fill_color = "black"
        self._pen_size = 2
        self._visible = visible
        self._shape = shape
        self._filling = False
        self._fill_points = []

    def _move_to(self, x, y):
        if self._pen_down:
            start = _screen_point(self._x, self._y)
            end = _screen_point(x, y)
            _pylearn.linea(*start, *end, self._pen_color, self._pen_size)
        self._x, self._y = float(x), float(y)
        if self._filling:
            self._fill_points.append(_screen_point(self._x, self._y))

    def forward(self, distance):
        angle = _math.radians(self._heading)
        self._move_to(
            self._x + _math.cos(angle) * distance,
            self._y + _math.sin(angle) * distance,
        )

    fd = forward

    def backward(self, distance):
        self.forward(-distance)

    back = backward
    bk = backward

    def right(self, angle):
        self._heading = (self._heading - angle) % 360

    rt = right

    def left(self, angle):
        self._heading = (self._heading + angle) % 360

    lt = left

    def goto(self, x, y=None):
        if y is None:
            x, y = x
        self._move_to(x, y)

    setpos = goto
    setposition = goto

    def setx(self, x):
        self._move_to(x, self._y)

    def sety(self, y):
        self._move_to(self._x, y)

    def home(self):
        self.goto(0, 0)
        self._heading = 0

    def position(self):
        return (self._x, self._y)

    pos = position

    def xcor(self):
        return self._x

    def ycor(self):
        return self._y

    def heading(self):
        return self._heading

    def setheading(self, angle):
        self._heading = float(angle) % 360

    seth = setheading

    def towards(self, x, y=None):
        if y is None:
            x, y = x
        return _math.degrees(_math.atan2(y - self._y, x - self._x)) % 360

    def distance(self, x, y=None):
        if y is None:
            x, y = x
        return _math.hypot(x - self._x, y - self._y)

    def circle(self, radius, extent=None, steps=None):
        extent = 360 if extent is None else extent
        steps = steps or max(8, int(abs(extent) / 8))
        step_angle = extent / steps
        step_length = 2 * _math.pi * abs(radius) * abs(extent) / 360 / steps
        turn = step_angle if radius >= 0 else -step_angle
        for _ in range(steps):
            self.left(turn / 2)
            self.forward(step_length)
            self.left(turn / 2)

    def dot(self, size=None, *color):
        size = self._pen_size + 4 if size is None else size
        css = color[0] if len(color) == 1 else color or self._pen_color
        _pylearn.circulo(*_screen_point(self._x, self._y), size / 2, css)

    def write(self, arg, move=False, align="left", font=("Arial", 16, "normal")):
        size = font[1] if len(font) > 1 else 16
        alignment = {"left": "izquierda", "center": "centro", "right": "derecha"}.get(align, "izquierda")
        _pylearn.texto(str(arg), *_screen_point(self._x, self._y), size, self._pen_color, alignment)

    def penup(self):
        self._pen_down = False

    pu = penup
    up = penup

    def pendown(self):
        self._pen_down = True

    pd = pendown
    down = pendown

    def isdown(self):
        return self._pen_down

    def pensize(self, width=None):
        if width is None:
            return self._pen_size
        self._pen_size = max(1, float(width))

    width = pensize

    def pencolor(self, *args):
        if not args:
            return self._pen_color
        self._pen_color = args[0] if len(args) == 1 else args

    def fillcolor(self, *args):
        if not args:
            return self._fill_color
        self._fill_color = args[0] if len(args) == 1 else args

    def color(self, *args):
        if not args:
            return (self._pen_color, self._fill_color)
        self.pencolor(args[0])
        self.fillcolor(args[-1])

    def begin_fill(self):
        self._filling = True
        self._fill_points = [_screen_point(self._x, self._y)]

    def end_fill(self):
        if len(self._fill_points) >= 3:
            _pylearn.poligono(self._fill_points, self._fill_color)
        self._filling = False
        self._fill_points = []

    def clear(self):
        _screen.clearscreen()

    def reset(self):
        self.clear()
        self.__init__(self._shape, self._visible)

    def speed(self, value=None):
        return 0

    def hideturtle(self):
        self._visible = False

    ht = hideturtle

    def showturtle(self):
        self._visible = True

    st = showturtle

    def shape(self, value=None):
        if value is None:
            return self._shape
        self._shape = value

    def stamp(self):
        x, y = _screen_point(self._x, self._y)
        _pylearn.circulo(x, y, 5, self._fill_color)
        return 1

    def onclick(self, fun, btn=1, add=None):
        return None

    def ondrag(self, fun, btn=1, add=None):
        return None


RawTurtle = Turtle
Pen = Turtle
_default = None


def _pen():
    global _default
    if _default is None:
        _default = Turtle()
    return _default


def Screen():
    _open()
    return _screen


def setup(*args, **kwargs):
    return _screen.setup(*args, **kwargs)


def title(value):
    return _screen.title(value)


def bgcolor(value=None):
    return _screen.bgcolor(value)


def done():
    return _screen.mainloop()


mainloop = done
exitonclick = _screen.exitonclick
bye = _screen.bye
update = _screen.update
tracer = _screen.tracer
listen = _screen.listen
onkey = _screen.onkey
onkeypress = _screen.onkeypress
onkeyrelease = _screen.onkeyrelease
ontimer = _screen.ontimer

forward = lambda distance: _pen().forward(distance)
fd = forward
backward = lambda distance: _pen().backward(distance)
back = backward
bk = backward
right = lambda angle: _pen().right(angle)
rt = right
left = lambda angle: _pen().left(angle)
lt = left
goto = lambda x, y=None: _pen().goto(x, y)
setpos = goto
setposition = goto
setx = lambda x: _pen().setx(x)
sety = lambda y: _pen().sety(y)
home = lambda: _pen().home()
circle = lambda radius, extent=None, steps=None: _pen().circle(radius, extent, steps)
dot = lambda size=None, *color: _pen().dot(size, *color)
write = lambda arg, move=False, align="left", font=("Arial", 16, "normal"): _pen().write(arg, move, align, font)
penup = lambda: _pen().penup()
pu = penup
up = penup
pendown = lambda: _pen().pendown()
pd = pendown
down = pendown
isdown = lambda: _pen().isdown()
pensize = lambda width=None: _pen().pensize(width)
width = pensize
pencolor = lambda *args: _pen().pencolor(*args)
fillcolor = lambda *args: _pen().fillcolor(*args)
color = lambda *args: _pen().color(*args)
begin_fill = lambda: _pen().begin_fill()
end_fill = lambda: _pen().end_fill()
speed = lambda value=None: _pen().speed(value)
hideturtle = lambda: _pen().hideturtle()
ht = hideturtle
showturtle = lambda: _pen().showturtle()
st = showturtle
shape = lambda value=None: _pen().shape(value)
stamp = lambda: _pen().stamp()
position = lambda: _pen().position()
pos = position
xcor = lambda: _pen().xcor()
ycor = lambda: _pen().ycor()
heading = lambda: _pen().heading()
setheading = lambda angle: _pen().setheading(angle)
seth = setheading
clear = lambda: _pen().clear()
reset = lambda: _pen().reset()

