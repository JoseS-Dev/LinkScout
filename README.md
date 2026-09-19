# LinkScout 🤖

Bot de Telegram para buscar empleos remotos en la API de [RemoteOK](https://remoteok.com/). Escrito en TypeScript con Telegraf.

## Estructura

```
LinkScout/
├── src/
│   ├── app.ts                    # Punto de entrada: crea el bot y lo lanza
│   ├── commands/
│   │   ├── index.ts              # Registra todos los comandos en el bot
│   │   ├── start.ts              # /start — Bienvenida
│   │   ├── help.ts               # /help — Lista de comandos disponibles
│   │   ├── jobs.ts               # /jobs — Búsqueda de empleos
│   │   ├── handlerPagination.ts  # Callbacks de botones de paginación
│   │   └── handlerFavorite.ts    # /favorites + callback para guardar favoritos
│   ├── config/
│   │   ├── config.ts             # Objeto de configuración centralizado
│   │   ├── prisma/prisma.ts      # Cliente Prisma con adaptador Postgres
│   │   ├── pino/logger.ts        # Logger con pino (pino-pretty en desarrollo)
│   │   └── validation/env.ts     # Validación de variables de entorno con zod
│   ├── services/
│   │   ├── scraper.ts            # Consumo de la API de RemoteOK y filtrado
│   │   └── favoriteService.ts    # Persistencia de favoritos (addFavorite/getFavorites)
│   ├── types/
│   │   └── root.ts               # Interfaces compartidas (Job, Filters, RemoteOkResponse)
│   └── utils/
│       ├── functions.ts          # loadEnv + calculateDaysofSince
│       └── pagination.ts         # Texto de empleo, botones y codificación de filtros
├── prisma/
│   ├── schema.prisma             # Modelos User y Favorite
│   └── migrations/               # Migraciones de base de datos
├── prisma.config.ts              # Configuración de Prisma CLI
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Librerías utilizadas

| Librería | Uso |
|---|---|
| **telegraf** | Framework principal para interactuar con la API de Telegram |
| **@t3-oss/env-core** + **zod** | Definición y validación estricta de variables de entorno |
| **dotenv** | Carga de archivos `.env` según el entorno activo |
| **pino** + **pino-pretty** | Logging estructurado; en desarrollo se muestra coloreado y legible |
| **prisma** + **@prisma/client** + **@prisma/adapter-pg** | ORM y migraciones; persistencia de favoritos en PostgreSQL |
| **tsx** | Ejecución de TypeScript en desarrollo con hot-reload (`tsx watch`) |
| **cross-env** | Configuración cross-platform de `NODE_ENV` en scripts |
| **typescript** | Compilación y verificación de tipos estrictos |

## Comandos

| Comando | Descripción |
|---|---|
| `/start` | Mensaje de bienvenida con el nombre del usuario |
| `/help` | Lista todos los comandos disponibles |
| `/jobs <término> [filtros]` | Busca empleos en RemoteOK con navegación por botones (hasta 10 resultados). Filtros opcionales: `min:<mínimo>`, `max:<máximo>`, `tag:<tag>`, `dias:<días>`. Ej.: `/jobs react min:8000 tag:typescript dias:7` |
| `/favorites` | Muestra las vacantes guardadas como favoritas, con botón ❌ para eliminar cada una |

Cada resultado de `/jobs` incluye el botón **⭐ Guardar Favorito**, que persiste la vacante (PostgreSQL vía Prisma) y evita duplicados por usuario.

## Variables de entorno

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | — | Token del bot de Telegram (obtenido via @BotFather) |
| `NODE_ENV` | No | `development` | Entorno de ejecución (`development` o `production`) |
| `PORT` | No | `3000` | Puerto de la aplicación |
| `API_REMOTEOK` | No | `https://remoteok.com/api` | Endpoint de la API de RemoteOK |

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear archivo de entorno (copiar y rellenar token real)
cp .env.example .env.development

# 3. Arrancar en modo desarrollo (con hot-reload)
pnpm dev
```

## Notas importantes

- **Solo funciona con `pnpm`** — el repositorio usa `pnpm-workspace.yaml` y `devEngines` lo requiere (≥11.9).
- **No hay script de build ni tests** — `start:` en package.json apunta a `dist/app.js` pero no se genera (`outDir` está comentado en tsconfig). Usa `pnpm dev`.
- **Strict TypeScript** — `verbatimModuleSyntax` (requiere `import type`), `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` están activos. Los imports relativos deben incluir extensión `.js`.
- **Playwright** está listado como dependencia pero no se usa actualmente; el scraping se hace con `fetch` directo a la API JSON de RemoteOK.

## Futuras implementaciones

- [x] Botón ❌ contextual en `/jobs` (estado del favorito por vacante vía lookup en BD)
- [x] Notificaciones programadas: alertas diarias/semanales de nuevas ofertas (`/alerta`)
- [ ] Comando `/subscribe` para recibir actualizaciones automáticas por categoría
- [ ] Cache de resultados en memoria para evitar pegar a la API en cada paginación
- [ ] Implementar Playwright para scraping de páginas que no exponen API JSON
- [ ] Script de build (`tsc`) y despliegue en producción
- [ ] Tests unitarios y de integración