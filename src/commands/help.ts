import { Context } from "telegraf";
import { logger } from "../config/pino/logger.js";

export async function commandHelp(ctx: Context){
   logger.info("Comando /help recibido");

   const message = [
      `📋 *Comandos disponibles:*`,
      ``,
      `/start - Mensaje de bienvenida`,
      `/jobs <término> - Busca empleos remotos por término`,
      `/help - Muestra esta ayuda`
   ].join("\n");

   await ctx.reply(message, { parse_mode: 'Markdown' });
}