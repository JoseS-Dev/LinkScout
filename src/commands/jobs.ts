import { Context } from "telegraf";
import { extractJobsFromRemoteok } from "../services/scraper.js";
import { logger } from "../config/pino/logger.js";

export async function commandJobs(ctx: Context){
   if(!ctx.message || !("text" in ctx.message)) return;
   const searchTerm = ctx.message.text.split(" ").slice(1).join(" ");
   
   logger.info(`Comando /jobs recibido con el término de búsqueda: ${searchTerm}`);
   await ctx.reply(`Buscando empleos relacionados con: "${searchTerm}"...`);

   const jobs = await extractJobsFromRemoteok(searchTerm);

   if(jobs.length === 0){
      logger.info(`No se encontraron empleos para el término de búsqueda: ${searchTerm}`);
      await ctx.reply(`No se encontraron empleos relacionados con: "${searchTerm}".`);
   }

   for(const job of jobs){
    const tagsText = job.tags.length > 0 ? `🏷️ *Tags:* ${job.tags.slice(0, 4).join(', ')}\n` : '';
    const salaryText = job.salary !== 'No especificado' ? `💵 *Salario:* ${job.salary}\n` : '';

    const message = `*${job.title}*\n🏢 *Empresa:* ${job.company}\n${tagsText}${salaryText}🔗 [Ver más](${job.link})`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
   }
}