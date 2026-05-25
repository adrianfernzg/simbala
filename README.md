# Simbala Arcade

E-commerce de máquinas recreativas artesanales. Fabricación bajo pedido, configurador de extras en tiempo real y gestión completa desde panel de administración.

**[simbala.es](https://simbala.es)**

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS / Admin | Payload CMS 3 |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 5 |
| Autenticación | NextAuth v5 |
| Pagos | Stripe Checkout |
| Email | Resend |
| Imágenes | Cloudinary |
| Internacionalización | next-intl (ES / EN) |
| Validación | Zod |
| Rate limiting | Upstash Redis |
| Estilos | Tailwind CSS 4 |
| Hosting | Railway |
| Contenedores | Docker (multi-stage) |
| Lenguaje | TypeScript strict |

---

## Características

- **Catálogo de productos** con galería de imágenes, descripción rich text y ficha de producto
- **Configurador de extras** — el cliente elige opciones (vinilo, accesorios, texto personalizado) y el precio se actualiza en tiempo real, calculado siempre en el servidor
- **Carrito persistente** con localStorage
- **Checkout con Stripe** — sesión de pago segura, verificación de firma en webhook
- **Email de confirmación** con factura proforma al completar el pago
- **Panel de administración** (Payload CMS) para gestionar productos, pedidos, blog y medios
- **Historial de pedidos** con estado actualizable desde el panel (Pendiente → En proceso → Enviado → Entregado)
- **Blog** con artículos, categorías y SEO configurable
- **Formulario de contacto** para usuarios registrados
- **Autenticación** por credenciales (email + contraseña)
- **Bilingüe** — español e inglés con URLs localizadas (`/es/`, `/en/`)
- **SEO** — metaetiquetas dinámicas, Open Graph, sitemap y robots.txt automáticos
- **Rate limiting** en endpoints de auth y checkout

---

## Arquitectura

```
┌─────────────────────────────────────────┐
│            simbala.es (Railway)          │
│                                         │
│  ┌─────────────┐    ┌─────────────────┐ │
│  │  Next.js 15 │    │  Payload CMS 3  │ │
│  │  App Router │    │     /admin      │ │
│  └──────┬──────┘    └────────┬────────┘ │
│         │                   │           │
│         └─────────┬─────────┘           │
│                   │                     │
│          ┌────────▼────────┐            │
│          │  PostgreSQL 16  │            │
│          └─────────────────┘            │
└─────────────────────────────────────────┘
         │              │
    ┌────▼────┐    ┌────▼──────┐
    │ Stripe  │    │ Cloudinary│
    └─────────┘    └───────────┘
```

El webhook de Stripe (`/api/stripe/webhook`) crea el pedido en Payload y envía el email de confirmación vía Resend.

---

## Desarrollo local

### Requisitos

- Node.js 20+
- Docker y Docker Compose

### Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/adrianfernzg/simbala.git
cd simbala

# 2. Variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves

# 3. Levantar la base de datos
docker compose up -d db

# 4. Instalar dependencias y ejecutar migraciones
npm install
npm run prisma:migrate

# 5. Arrancar en desarrollo
npm run dev
```

App disponible en `http://localhost:3000` · Panel admin en `http://localhost:3000/admin`

### Variables de entorno requeridas

```env
DATABASE_URL=
AUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
PAYLOAD_SECRET=
NEXT_PUBLIC_APP_URL=
```

Ver `.env.example` para la lista completa.

### Webhook de Stripe en local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Despliegue

El despliegue es automático vía Railway al hacer push a `main`. Railway detecta el `Dockerfile` y ejecuta las migraciones de Payload al arrancar el contenedor.

```
git push origin main  →  Railway build  →  Migraciones  →  Online
```

---

## Estructura del proyecto

```
├── app/
│   ├── (frontend)/[locale]/(shop)/   # Tienda pública
│   ├── (payload)/                    # Panel Payload CMS
│   ├── actions/                      # Server Actions
│   └── api/stripe/webhook/           # Webhook de pagos
├── components/
│   ├── shop/                         # Componentes de tienda
│   └── ui/                           # Componentes genéricos
├── lib/                              # Stripe, auth, email, Prisma
├── payload/
│   ├── collections/                  # Products, Orders, Blog...
│   └── migrations/                   # Migraciones de producción
├── prisma/                           # Schema y migraciones NextAuth
└── messages/                         # Traducciones ES / EN
```

---

## Flujo de compra

```
Catálogo → Ficha de producto → Configurar extras
        → Carrito → Checkout → Stripe → Webhook
        → Pedido en Payload → Email de confirmación
        → Panel admin → Actualizar estado → Cliente
```

---

## Licencia

Proyecto privado — todos los derechos reservados.
