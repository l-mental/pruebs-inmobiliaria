# Cómo Subir el Sistema a Vercel + Supabase (Súper Sencillo)

Este sistema funciona **de forma inmediata** en Vercel sin necesidad de configuraciones complejas, y además te permite conectarlo a **Supabase** en 2 minutos si deseas base de datos en la nube compartida entre varios dispositivos.

---

## Opción 1: Subir a Vercel Directo (Sin configurar nada)

1. Sube este proyecto a **GitHub** (o impórtalo en **Vercel**).
2. Haz clic en **Deploy**.
   - Si Vercel no te pide variables obligatorias, se desplegará automáticamente en ~1 minuto.
   - Ya incluye el login (`admin` / `admin123` y `empleado` / `empleado123`) y guarda usuarios, ventas, terrenos, propiedades, clientes y pagos.

---

## Opción 2: Conectar a Supabase (Base de Datos en la Nube)

### 1. Crear las tablas en Supabase (1 solo paso)
1. Entra a [https://supabase.com](https://supabase.com) y abre tu proyecto.
2. En el menú izquierdo entra a **SQL Editor** → **New query**.
3. Copia todo el contenido del archivo **`supabase/schema.sql`**, pégalo ahí y haz clic en **Run**.

### 2. Copiar tus 2 datos de conexión de Supabase
En tu proyecto de Supabase, ve al menú izquierdo **Project Settings** (ícono de engranaje ⚙️):
- **URL**: En **Data API** (o **API**), copia el campo **Project URL** (ejemplo: `https://xyzabc.supabase.co`).
  → Ese valor va en **`VITE_SUPABASE_URL`**.
- **Clave pública**: En **API Keys** (o **API**), copia la clave **`anon` / `public`** (empieza con `eyJ...` o `sb_publishable_...`).
  → Ese valor va en **`VITE_SUPABASE_ANON_KEY`**.

### 3. Pegarlos en Vercel
1. En tu proyecto de Vercel ve a **Settings** → **Environment Variables**.
2. Agrega las 2 variables:
   - Name: `VITE_SUPABASE_URL` | Value: *(tu Project URL)*
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: *(tu clave anon public)*
3. Ve a **Deployments** → **Redeploy** y listo: toda la información se sincronizará en tu base de datos Supabase.
