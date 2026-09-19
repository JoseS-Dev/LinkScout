import cron from "node-cron";
import { Telegraf } from "telegraf";
import { config } from "../config/config.js";
import { logger } from "../config/pino/logger.js";
import { AlertService } from "../services/AlertService.js";
import { extractJobsFromRemoteok } from "../services/scraper.js";
import type { Frecuency, Filters } from "../types/root.js";

const alertService = new AlertService();

// Período esperado (en días) y antigüedad de oferta relevante según la frecuencia de la alerta
const FREQUENCY_CONFIG: Record<Frecuency, { periodMs: number; daysOfSeniority: number }> = {
    Diario: { periodMs: 24 * 60 * 60 * 1000, daysOfSeniority: 1 },
    Semanal: { periodMs: 7 * 24 * 60 * 60 * 1000, daysOfSeniority: 7 },
    Mensual: { periodMs: 30 * 24 * 60 * 60 * 1000, daysOfSeniority: 30 }
};

// Cron-Job para enviar alertas a los usuarios de Telegram según sus preferencias
export function cronAlert(bot: Telegraf){
    cron.schedule(config.cronJobAlert, async () => {
        logger.info("Iniciando el cron-job de alertas...");
        try{
            const alerts = await alertService.getAlertsByActive();
            const now = Date.now();

            for(const alert of alerts){
                const config = FREQUENCY_CONFIG[alert.frecuency];

                // Se omite si no ha pasado el período según la frecuencia de la alerta
                if(alert.lastSentAt && now - alert.lastSentAt.getTime() < config.periodMs) continue;

                // Se construyen los filtros según los parámetros de la alerta
                const filters: Filters = { term: alert.terms };
                if(alert.minSalary){
                    const minSalary = parseInt(alert.minSalary, 10);
                    if(!isNaN(minSalary)) filters.salaryMin = minSalary;
                }

                // El filtro de antigüedad limita las ofertas a las publicadas en el período de la alerta
                filters.daysOfSeniority = config.daysOfSeniority;

                // Se consulta la API de remoteOk publicadas en el espacio de la frecuencia de la alerta
                const jobs = await extractJobsFromRemoteok(filters);

                try{
                    if(jobs.length === 0) continue;

                    // Se envía un mensaje al usuario de Telegram con los empleos encontrados
                    let message = `🔔 *Alerta de Empleos*\n\nSe han encontrado ${jobs.length} empleos que coinciden con tus criterios de búsqueda:\n\n`;
                    jobs.slice(0,5).forEach((job, index) => {
                        const salaryText = job.salary ? `Salario: ${job.salary}\n` : '';
                        message += `${index + 1}. *${job.title}* en *${job.company}*\n${salaryText}Publicado: ${job.datePublished}\n[Ver Empleo](${job.link})\n\n`;
                    });

                    await bot.telegram.sendMessage(alert.userId.toString(), message, { parse_mode: "Markdown" });
                    await alertService.markAsSent(alert.id);
                    logger.info(`Se han enviado ${jobs.length} empleos al usuario ${alert.userId} según la alerta "${alert.terms}"`);
                }
                catch(error){
                    logger.error(`Error al enviar la alerta ${alert.id} al usuario ${alert.userId}: ${error}`);
                }
            }
        }
        catch(error){
            logger.error(`Error en el cron-job de alertas: ${error}`);
        }
    })
}