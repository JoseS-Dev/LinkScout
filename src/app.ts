import { Telegraf } from "telegraf";
import { config } from "./config/config.js";
import { logger } from "./config/pino/logger.js";
import { cronAlert } from "./cron/AlertCron.js";
import { registerCommands } from "./commands/index.js";

if(!config.botTelegramToken){
    logger.error("El token del bot de Telegram no está definido. Por favor, verifica tu archivo .env.");
    process.exit(1);
}

const bot = new Telegraf(config.botTelegramToken);

registerCommands(bot);

cronAlert(bot);

bot.launch()
logger.info("Bot de Telegram iniciado correctamente.");

logger.info("Esperando señales de terminación...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

