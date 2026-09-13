import { envSchema } from "./validation/env.js";

export const config = {
    port: envSchema.PORT,
    databaseUrl: envSchema.DATABASE_URL,
    botTelegramToken: envSchema.TELEGRAM_BOT_TOKEN,
    nodeEnv: envSchema.NODE_ENV,
    apiRemoteOk: envSchema.API_REMOTEOK
}