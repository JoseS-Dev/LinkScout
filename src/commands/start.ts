import { Context } from "telegraf";
import { logger } from "../config/pino/logger.js";

export async function commandStart(ctx: Context){
   const firstName = ctx.from?.first_name ?? "usuario";
   logger.info("Comando /start recibido");

   await ctx.reply(
      `¡Hola, ${firstName}! 👋\n\nSoy *LinkScout*, tu bot para encontrar empleos remotos.\n` +
      `Usa /jobs <término> para buscar ofertas o /help para ver todos los comandos.`,
      { parse_mode: 'Markdown' }
   );
}