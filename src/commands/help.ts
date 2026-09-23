import { Context } from "telegraf";
import { logger } from "../config/pino/logger.js";

export async function commandHelp(ctx: Context){
   logger.info("Comando /help recibido");

   const message = [
      `📋 *Comandos disponibles:*`,
      ``,
      `/start - Mensaje de bienvenida`,
      `/jobs <término> - Busca empleos remotos por término`,
      `/alert <término> <salario> <Diario|Semanal|Mensual> - Crea una alerta programada`,
      `/favorites - Muestra tus vacantes favoritas`,
      `/subscribe - Suscríbete a categorías específicas`,
      `/help - Muestra esta ayuda`
   ].join("\n");

   await ctx.reply(message, { parse_mode: 'Markdown' });
}