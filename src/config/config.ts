import { envSchema } from "./validation/env.js";

export const config = {
    port: envSchema.PORT,
    botTelegramToken: envSchema.TELEGRAM_BOT_TOKEN,
    nodeEnv: envSchema.NODE_ENV,
    apiRemoteOk: envSchema.API_REMOTEOK
}