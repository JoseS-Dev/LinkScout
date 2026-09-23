import cron from "node-cron";
import { Telegraf } from "telegraf";
import { config } from "../config/config.js";
import { logger } from "../config/pino/logger.js";
import { SubscriptionService } from "../services/SubscriptionService.js";
import { extractJobsFromRemoteok } from "../services/scraper.js";
import { CATEGORIES_AVAILABLE } from "../utils/constants.js";
import type { Filters } from "../types/root.js";

const subscriptionService = new SubscriptionService();

// Cron-Job para enviar notificaciones a los usuarios según la categoría a la que se suscribieron
export function cronSubscriptions(bot: Telegraf){
    cron.schedule(config.cronJobAlert, async () => {
        logger.info("Iniciando el cron-job de suscripciones por categoría...");
        try{
            for(const category of CATEGORIES_AVAILABLE){
                const subscriptions = await subscriptionService.getSubscriptionsByCategory(category.id);
                if(subscriptions.length === 0) continue; // Nadie suscrito a esta categoría

                // Se consultan las ofertas publicadas en el último día que coincidan con la categoría
                const filters: Filters = { tagMatch: category.id, daysOfSeniority: 1 };
                const jobs = await extractJobsFromRemoteok(filters);
                if(jobs.length === 0) continue; // No hay ofertas nuevas para esta categoría

                // Se construye el mensaje con los empleos encontrados para la categoría
                let message = `🔔 *${category.label}*\n\nSe encontraron ${jobs.length} empleos nuevos que coinciden con tu suscripción:\n\n`;
                jobs.slice(0,5).forEach((job, index) => {
                    const salaryText = job.salary ? `Salario: ${job.salary}\n` : '';
                    message += `${index + 1}. *${job.title}* en *${job.company}*\n${salaryText}Publicado: ${job.datePublished}\n[Ver Empleo](${job.link})\n\n`;
                });

                // Se envía la notificación a cada usuario suscrito a la categoría
                for(const subscription of subscriptions){
                    try{
                        await bot.telegram.sendMessage(subscription.userId.toString(), message, { parse_mode: "Markdown" });
                        logger.info(`Se ha enviado la suscripción de "${category.id}" al usuario ${subscription.userId}`);
                    }
                    catch(error){
                        logger.error(`Error al enviar la suscripción de "${category.id}" al usuario ${subscription.userId}: ${error}`);
                    }
                }
            }
            logger.info("Cron-job de suscripciones por categoría finalizado.");
        }
        catch(error){
            logger.error(`Error en el cron-job de suscripciones: ${error}`);
        }
    })
}