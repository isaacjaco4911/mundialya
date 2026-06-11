# MundialYa ⚽ — El hub social del Mundial 2026

Web app mobile-first para vivir el Mundial 2026 (48 selecciones, sedes USA/Canadá/México) pensada para Colombia: calendario con hora de Bogotá, polla social gratis entre amigos, votaciones en vivo y directorio de sitios para ver los partidos.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel.

## 🚀 Arranque rápido (modo demo, sin configurar nada)

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin Supabase configurado la app corre en **modo demo**: todos los datos (48 selecciones, partidos, sitios, polla) viven en memoria. Todo funciona, pero no persiste entre reinicios.

> Requiere Node ≥ 18.17.

## 🗄️ Setup con Supabase (datos reales)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta en orden:
   - `supabase/migrations/001_schema.sql` (tablas, RLS, triggers de puntuación y ratings, funciones de contadores)
   - `supabase/migrations/002_seed.sql` (48 selecciones, 12 partidos de ejemplo, 6 sitios, liga global)
3. Copia `.env.example` a `.env.local` y completa:
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (la clave *service_role* — solo servidor)
   - `ADMIN_PASSWORD` (clave del panel `/admin`)
   - `IP_HASH_SALT` (string aleatorio para anonimizar IPs de votos)
   - `NEXT_PUBLIC_SITE_URL` (tu dominio en producción)
4. `npm run dev` — la app detecta Supabase automáticamente.

**Seguridad:** lectura pública vía RLS; todas las escrituras pasan por API routes con el service role. El marcador final de un partido dispara un **trigger SQL** que recalcula los puntos de todas las predicciones y los totales de cada liga.

## ▲ Deploy en Vercel

1. Sube el repo a GitHub y conéctalo en [vercel.com](https://vercel.com) (framework: Next.js, sin config extra).
2. Agrega las mismas variables de entorno del `.env.local` en **Settings → Environment Variables**.
3. Pon `NEXT_PUBLIC_SITE_URL` con tu dominio final (para OG images, sitemap y compartir).

## 🧭 Mapa del sitio

| Ruta | Qué hay |
|---|---|
| `/` | Próximos partidos con cuenta regresiva, partidos de hoy, CTA polla, líderes, banners y popup |
| `/calendario` | Todos los partidos por fecha y fase, filtros por selección/grupo/fecha |
| `/partido/[id]` | Marcador en vivo, votación ¿quién gana?, predicción, dónde verlo, OG image dinámica |
| `/polla` | Crea/únete a ligas con código, predice marcadores, tabla de posiciones, retos por WhatsApp |
| `/grupos` | Tablas de los 12 grupos (auto-calculadas) + bracket de eliminatorias |
| `/equipo/[slug]` | Perfil de selección con partidos y encuesta de fans |
| `/donde-ver` | Directorio de sitios (verificados/destacados primero), filtros, registro gratis |
| `/sitio/[id]` | Detalle del sitio: promos, reseñas moderadas, reserva por WhatsApp |
| `/metricas` | Métricas públicas para vender publicidad |
| `/admin` | Panel completo (partidos, equipos, sitios, banners, popups, encuestas, ligas, estadísticas) |

## 📝 Completar el calendario real

El seed incluye la jornada 1 (12 partidos) como ejemplo. Para cargar los 104 partidos del torneo (11 jun – 19 jul 2026):

- **Opción A:** desde `/admin` → Partidos → "+ Nuevo" (kickoff en ISO UTC; Bogotá = UTC−5, ej. 19:00 Bogotá = `2026-06-12T00:00:00Z` del día siguiente).
- **Opción B:** agrega INSERTs en `002_seed.sql` siguiendo el patrón existente.
- Los 6 cupos de repechaje (marzo 2026) se actualizan desde `/admin` → Selecciones (nombre + URL de bandera de flagcdn.com).
- Los cruces de eliminatorias se crean cuando termine la fase de grupos (avanzan los 2 primeros de cada grupo + los 8 mejores terceros).

## ⚖️ Nota legal (Colombia)

La polla es **100% gratuita**: sin pozo de dinero, sin comisiones, sin apuestas — es un juego de predicciones, no un juego de azar. Los premios, si existen, los aporta un patrocinador.

## 💰 Ganchos de monetización incluidos

- **Sitios destacados** (pago): salen primero con distintivo ⭐ y vencimiento configurable.
- **Banners y popups** por ubicación, fecha y prioridad, administrables.
- **Ligas patrocinadas** y página `/metricas` con alcance real para anunciantes.
- Estructura lista para integrar pagos (Wompi / Mercado Pago / PSE) más adelante.
