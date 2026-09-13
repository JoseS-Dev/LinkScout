import { Context } from "telegraf";
import { logger } from "../config/pino/logger.js";

export async function commandStart(ctx: Context){
   const firstName = ctx.from?.first_name ?? "usuario";
   logger.info("Comando /start recibido");

   await ctx.reply(
      `¡Hola, ${firstName}! 👋\n\n` +
      `Soy *LinkScout*, tu bot para encontrar empleos remotos.\n\n` +
      `📌 *Comandos principales:*\n` +
      `/jobs <término> - Busca ofertas con filtros opcionales (min:, max:, tag:, dias:)\n` +
      `/favorites - Consulta y gestiona tus vacantes favoritas\n` +
      `/help - Muestra todos los comandos`,
      { parse_mode: 'Markdown' }
   );
}