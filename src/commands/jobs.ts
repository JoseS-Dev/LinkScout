import { Context } from "telegraf";
import { extractJobsFromRemoteok } from "../services/scraper.js";
import { generateJobText, generatePaginationButtons } from "../utils/pagination.js";
import { logger } from "../config/pino/logger.js";
import type { Filters } from "../types/root.js";

export async function commandJobs(ctx: Context){
   if(!ctx.message || !("text" in ctx.message)) return;
   const text = ctx.message.text;
   const args = text.split(" ").slice(1);

   // Valores por defecto 
   const defaultFilters: Filters = {
      term: '',
      salaryMin: 0,
      salaryMax: 0,
      tagMatch: '',
      daysOfSeniority: 0
   }

   const wordsTerms: string[] = []

   // Parseamos argumentos como "min:800" o "dias:7"
   args.forEach(arg => {
      if(arg.startsWith("min:")){
         const minSalary = parseInt(arg.split(":")[1]!, 10);
         if(!isNaN(minSalary)) defaultFilters.salaryMin = minSalary;
      }
      else if(arg.startsWith("max:")){
         const maxSalary = parseInt(arg.split(":")[1]!, 10);
         if(!isNaN(maxSalary)) defaultFilters.salaryMax = maxSalary;
      }
      else if(arg.startsWith("tag:")){
         const tagMatch = arg.split(":")[1]!;
         defaultFilters.tagMatch = tagMatch;
      }
      else if(arg.startsWith("dias:")){
         const daysOfSeniority = parseInt(arg.split(":")[1]!, 10);
         if(!isNaN(daysOfSeniority)) defaultFilters.daysOfSeniority = daysOfSeniority;
      }
      else{
         wordsTerms.push(arg);
      }
   })

   defaultFilters.term = wordsTerms.join(" ");

   const jobs = await extractJobsFromRemoteok(defaultFilters);

   if(jobs.length === 0){
      logger.info(`No se encontraron empleos para el término de búsqueda: ${defaultFilters.term}`);
      await ctx.reply(`No se encontraron empleos relacionados con: "${defaultFilters.term}".`);
      return;
   }

   // Mostramos el primer resultado con los botones de paginación
   const firstJob = jobs[0];
   const jobText = generateJobText(firstJob!, 0, jobs.length);
   const keyboard = generatePaginationButtons(defaultFilters, 0, jobs.length);

   await ctx.reply(jobText, {
      parse_mode: 'Markdown',
      ...keyboard
   })
}