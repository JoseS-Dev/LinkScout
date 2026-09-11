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
│   │   └── jobs.ts               # /jobs — Búsqueda de empleos
│   ├── config/
│   │   ├── config.ts             # Objeto de configuración centralizado
│   │   ├── pino/logger.ts        # Logger con pino (pino-pretty en desarrollo)
│   │   └── validation/env.ts     # Validación de variables de entorno con zod
│   ├── services/
│   │   └── scraper.ts            # Consumo de la API de RemoteOK y filtrado
│   ├── types/
│   │   └── root.ts               # Interfaces compartidas (Job, RemoteOkResponse)
│   └── utils/
│       └── functions.ts          # Función loadEnv: resuelve el .env según entorno
├── .env.development              # Variables del entorno de desarrollo (no trackeado)
├── .env.production               # Variables del entorno de producción (no trackeado)
├── .env.example                  # Ejemplo de variables requeridas
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
| **tsx** | Ejecución de TypeScript en desarrollo con hot-reload (`tsx watch`) |
| **cross-env** | Configuración cross-platform de `NODE_ENV` en scripts |
| **typescript** | Compilación y verificación de tipos estrictos |

## Comandos

| Comando | Descripción |
|---|---|
| `/start` | Mensaje de bienvenida con el nombre del usuario |
| `/help` | Lista todos los comandos disponibles |
| `/jobs <término>` | Busca empleos en RemoteOK que coincidan con el término dado (empresa, puesto o tags); devuelve hasta 10 resultados con título, empresa, tags, salario y enlace |

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

- [ ] Paginación o botones interactivos (InlineKeyboard) para navegar entre resultados
- [ ] Filtros avanzados (rango salarial, tags específicos, fecha de publicación)
- [ ] Base de datos para guardar búsquedas o empleos favoritos
- [ ] Notificaciones programadas: alertas diarias/semanales de nuevas ofertas
- [ ] Comando `/subscribe` para recibir actualizaciones automáticas por categoría
- [ ] Implementar Playwright para scraping de páginas que no exponen API JSON
- [ ] Script de build (`tsc`) y despliegue en producción
- [ ] Tests unitarios y de integración