# Verificación local — 15 de septiembre de 2026

## Editor del navegador

- TypeScript: sin errores.
- Compilación Vite: correcta. Advertencia de sourcemap en el componente Sheet preexistente.
- Pruebas del modelo: 6 correctas.
- Pruebas del importador/exportador Python: 3 correctas.
- Verificación real en Chrome: Ctrl+Enter usa el texto actual; los print anteriores
  a un error se conservan; input interactivo acepta Unicode; importaciones entre
  módulos locales; archivos generados recuperados; interrupción de un bucle infinito;
  recuperación del motor; guardado tras recargar y cambiar de ruta; NumPy;
  Matplotlib con imagen PNG visible; importación de JSON válida e inválida;
  escritorio, móvil y temas claro/oscuro sin desbordamiento horizontal.
- Capturas de revisión: .local/playground-review/.

## Entorno avanzado

- WSL 2.7.13.0 instalado.
- Docker Desktop instalado; CLI Docker 29.8.0 disponible.
- VirtualMachinePlatform habilitado. DISM confirmó «Reboot required=yes»
  y «Restart suppressed by /NoRestart».
- Compose validado con docker compose config --quiet.
- Imagen ghcr.io/coder/code-server:4.137.0 verificada en el registro.
- Versiones de extensiones verificadas en Open VSX.
- Importador/exportador validado con CPython local, incluyendo archivos binarios,
  carpetas vacías, rutas inválidas y rechazo de destinos ya existentes.

**Pendiente tras reiniciar Windows:** iniciar Docker Desktop, construir la imagen,
arrancar code-server y probar terminal, pip, depuración y vista previa de Flask.
Todavía no se ha ejecutado ni validado el contenedor. No hay despliegue público
ni autenticación multiusuario de entornos; son trabajos posteriores a esta prueba local.

## Comandos de verificación

Desde la raíz:

```powershell
pnpm --filter @workspace/python-exercises typecheck
pnpm --filter @workspace/python-exercises build
node --test artifacts/python-exercises/src/features/playground/model.test.ts
```

Desde infrastructure/advanced-editor:

```powershell
python -B -m unittest -v test_transfer.py
```
