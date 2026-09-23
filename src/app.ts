import http from "http";
import { Telegraf } from "telegraf";
import { config } from "./config/config.js";
import { logger } from "./config/pino/logger.js";
import { cronAlert } from "./cron/AlertCron.js";
import { cronSubscriptions } from "./cron/SubscriptionCron.js";
import { registerCommands } from "./commands/index.js";

if(!config.botTelegramToken){
    logger.error("El token del bot de Telegram no está definido. Por favor, verifica tu archivo .env.");
    process.exit(1);
}

const bot = new Telegraf(config.botTelegramToken);

registerCommands(bot);

cronAlert(bot);
cronSubscriptions(bot);

bot.launch()

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("El bot de Telegram está en funcionamiento.\n");
});

server.listen(config.port, () => {
    logger.info(`Servidor HTTP escuchando en el puerto ${config.port}`);
    logger.info(`Bot de Telegram iniciado en modo ${config.nodeEnv}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

