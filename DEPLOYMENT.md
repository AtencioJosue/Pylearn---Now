# Pylearn: producción segura

## Servicios

- GitHub privado: código y revisiones.
- Vercel: frontend, API y despliegues Preview/Production.
- PostgreSQL administrado desde Vercel Marketplace: usuarios, progreso, foro y ejercicios.
- Vercel Blob: avatares e imágenes persistentes.
- SMTP transaccional, por ejemplo Resend: verificación de correo y recuperación de contraseña.

## Variables de Vercel

Configura estas variables en Production y Preview según corresponda:

```text
DATABASE_URL
RESEND_API_KEY
EMAIL_FROM
BLOB_READ_WRITE_TOKEN
OPENAI_API_KEY
ADMIN_USER_IDS
```

Las claves deben estar en Environment Variables de Vercel y nunca en GitHub. Marca las claves como `Sensitive` cuando Vercel lo permita.

## Base de datos inicial

1. Provisiona PostgreSQL desde el Marketplace de Vercel.
2. Añade `DATABASE_URL` a Production.
3. Descarga esa variable en local usando `vercel env pull`.
4. Ejecuta el esquema de Drizzle:

```bash
pnpm --filter @workspace/db push
```

El backend crea de forma aditiva las tablas de sesiones y códigos de autenticación al arrancar. No uses `push-force` en producción.

## Correos

- Verifica un dominio de envío en el proveedor SMTP.
- Usa un `EMAIL_FROM` de ese dominio.
- Verifica el flujo de registro, código expirado, reenvío limitado y recuperación.
- No envíes ni guardes contraseñas en correos.

## Flujo de cambios

1. Crea una rama.
2. Abre una pull request.
3. Prueba la URL Preview.
4. Fusiona en `main`.
5. Vercel publica Production.

La base de datos no forma parte del artefacto de Vercel, por lo que desplegar una nueva versión no borra los datos de usuarios. Las migraciones deben ser compatibles hacia atrás y contar con copia de seguridad antes de cambios estructurales.
