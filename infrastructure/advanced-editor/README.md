# Entorno avanzado de Pylearn (prueba local)

Este módulo prepara code-server 4.137.0 con CPython, pip, Git, la extensión Python,
debugpy y basedpyright. La imagen instala las versiones indicadas en Dockerfile.
Es un prototipo local por espacio de trabajo; no es un servicio público multiusuario.

## Iniciar en Windows

1. Instalar WSL 2 y Docker Desktop siguiendo sus instrucciones oficiales.
   Windows puede requerir reinicio. Abrir Docker Desktop y esperar al motor.
2. Desde la raíz del repositorio:

   ```powershell
   powershell -ExecutionPolicy Bypass -File infrastructure/advanced-editor/Start-Editor.ps1
   ```

3. Abrir http://127.0.0.1:8080. La contraseña aleatoria se guarda en
   `.local/advanced-editor/local/password`; no se imprime en registros.
4. Para mostrar el enlace en Pylearn, añadir
   `VITE_ADVANCED_EDITOR_URL=http://127.0.0.1:8080` a
   `artifacts/python-exercises/.env.local` y reiniciar Vite.
5. Instalar bibliotecas desde la terminal: `python -m pip install flask numpy`.
   El intérprete predeterminado usa `/home/coder/.venv/bin/python`.

Cada instancia usa volúmenes separados para proyectos, entorno Python y editor.
Para otra instancia: `-WorkspaceId alumno-demo -Port 8081`.
No se monta el repositorio de Pylearn, archivos personales ni el socket Docker.
La escucha se restringe a loopback; no se publica en la red local.
Los límites iniciales son 2 CPU, 2 GB de RAM y 256 procesos por instancia.

## Transferir proyectos

En el navegador, **Exportar proyecto** descarga un archivo .pylearn.json.
Arrastrarlo al explorador de code-server y ejecutar en su terminal:

```sh
pylearn-project import MiProyecto.pylearn.json mi-proyecto
cd mi-proyecto
python main.py
```

El destino debe ser una carpeta nueva; el importador rechaza rutas fuera del proyecto.
Para devolver el trabajo al navegador:

```sh
pylearn-project export mi-proyecto mi-proyecto.pylearn.json
```

Descargar ese JSON e importarlo desde Pylearn. Se importa como una copia.
Los paquetes del entorno virtual no se empaquetan: registrar dependencias con
`python -m pip freeze > requirements.txt`. La biblioteca puede no existir para
Pyodide aunque funcione en CPython.

## Aplicaciones web y depuración

Para Flask: `flask --app app run --host 0.0.0.0 --port 5000`.
Abrir `http://127.0.0.1:8080/proxy/5000/` en la misma sesión autenticada.
Frameworks que generan URLs absolutas pueden necesitar configurar su prefijo.
No se publican puertos adicionales del contenedor.

Abrir un archivo .py, colocar un breakpoint y elegir **Run and Debug > Python Debugger**.
El formateador y las dependencias de cada proyecto se instalan en el entorno virtual.

## Antes de ofrecerlo a alumnos por Internet

Falta un servicio de sesiones que verifique la identidad del usuario en el servidor,
asigne su entorno y aplique autorización por proyecto. No se debe confiar en un
user_id recibido del navegador. También requiere TLS, proxy de WebSockets,
dominio separado del sitio, aislamiento adecuado para código no confiable,
políticas de red, cuotas de disco, suspensión de entornos inactivos, copias de seguridad
y medición de capacidad. Los contenedores de esta prueba no constituyen por sí solos
una frontera suficiente para ejecutar código hostil en un servidor compartido.

No sustituir esta configuración por ejecución de código de alumnos en el API principal.
No exponer el puerto 8080 públicamente para evitar el trabajo de autenticación.

## Editor en el navegador

Se guarda en IndexedDB por usuario y origen. No sincroniza dispositivos.
La entrada interactiva usa SharedArrayBuffer con estas cabeceras (ya configuradas en Vite):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

El hosting de producción debe enviar esas cabeceras en el documento principal.
Probar recursos externos y flujos de autenticación con ventanas antes de desplegar.
Sin aislamiento entre orígenes, el editor permite respuestas preparadas en **Entradas**.
El botón Detener termina el worker; conserva archivos guardados antes de la ejecución,
pero no recupera archivos que el programa estuviera modificando al interrumpirlo.
La salida se limita a 1 MB por ejecución para no saturar la página.

Fuentes: https://coder.com/docs/code-server/install,
https://learn.microsoft.com/windows/wsl/install,
https://docs.docker.com/desktop/setup/install/windows-install/,
https://pyodide.org/en/0.27.5/usage/streams.html.
