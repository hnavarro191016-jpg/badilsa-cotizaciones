# Despliegue Badilsa Cotizaciones

Esta guia deja el proyecto listo para publicar en Vercel usando Supabase como base de datos PostgreSQL.

## 1. Comprar dominio

Compra el dominio en GoDaddy:

```text
badilsa-cotizaciones.com
```

## 2. Crear base en Supabase

1. Entra a Supabase y crea un proyecto nuevo.
2. Guarda la contrasena de la base de datos.
3. Ve a `Project Settings > Database`.
4. Copia estas cadenas:
   - `Connection string` modo pooled/session para `DATABASE_URL`.
   - `Connection string` directa para `DIRECT_URL`.

En Vercel y en tu `.env` local se usaran:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="clave-larga-y-segura"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="contrasena-segura"
```

## 3. Migrar tablas a Supabase

Cuando ya tengas las variables en un archivo `.env`, ejecuta:

```bash
npm run db:migrate
npm run db:seed
```

`db:migrate` crea las tablas en Supabase.

`db:seed` crea el usuario administrador inicial.

## 4. Subir proyecto a GitHub

1. Crea un repositorio privado en GitHub.
2. Sube este proyecto.
3. No subas `.env`, `.next`, `node_modules`, `prisma/dev.db` ni `backups`.

El archivo `.gitignore` ya esta preparado para eso.

## 5. Crear proyecto en Vercel

1. Entra a Vercel.
2. Importa el repositorio desde GitHub.
3. Framework: `Next.js`.
4. Build command: `npm run build`.
5. Agrega variables de entorno:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
6. Haz deploy.

## 6. Aplicar migraciones en produccion

Despues de agregar variables en Vercel, ejecuta la migracion una vez.

Opcion local:

```bash
npm run db:migrate
npm run db:seed
```

Esto funciona si tu `.env` local apunta a Supabase.

## 7. Conectar dominio GoDaddy con Vercel

1. En Vercel abre el proyecto.
2. Ve a `Settings > Domains`.
3. Agrega:
   - `badilsa-cotizaciones.com`
   - `www.badilsa-cotizaciones.com`
4. Vercel mostrara los DNS necesarios.
5. En GoDaddy ve a tu dominio y abre `DNS`.
6. Normalmente queda asi:

```text
Tipo A
Nombre: @
Valor: 76.76.21.21

Tipo CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

Usa siempre el valor exacto que Vercel te muestre.

## 8. Validar

Abre:

```text
https://badilsa-cotizaciones.com
```

Luego prueba:

1. Login con el usuario administrador.
2. Crear una cotizacion.
3. Ver historial.
4. Modificar cotizacion.
5. Eliminar cotizacion.
6. Crear un usuario cotizador.

## Nota sobre la base anterior

La base local anterior era SQLite:

```text
prisma/dev.db
```

El proyecto ahora esta preparado para PostgreSQL/Supabase. El respaldo completo quedo en:

```text
backups/
```
