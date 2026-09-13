import { Context } from 'telegraf';
import { FavoriteService } from '../services/favoriteService.js';
import { extractJobsFromRemoteok } from '../services/scraper.js';
import { generateJobText, generatePaginationButtons } from '../utils/pagination.js';
import { parsePaginationData } from '../utils/functions.js';
import { logger } from '../config/pino/logger.js';

const favoriteService = new FavoriteService();

// Función para manejar los botones de paginación con los empleos
export async function handlePagination(ctx: Context){
    if(!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    const callbackData = ctx.callbackQuery.data;

    // Se ignora el bóton central
    if(callbackData === 'ignore') {
        return ctx.answerCbQuery();
    }

    const data = parsePaginationData(callbackData);
    if(!data) return;

    const { filters, page } = data;

    logger.info(`Botón de paginación presionado para la página: ${page}`);

    await ctx.answerCbQuery(); // Responde a la acción del botón para evitar el "loading" en el cliente

    const results = await extractJobsFromRemoteok(filters);

    if(results.length === 0 || !results[page]) return;

    const actuallyJob = results[page];

    // Se verifica si el empleo actual está en favoritos del usuario
    const isFavorite = ctx.from ? await favoriteService.isFavorite(ctx.from.id, actuallyJob.id) : false;

    const jobText = generateJobText(actuallyJob, page, results.length);
    const keyboard = generatePaginationButtons(filters, page, results.length, isFavorite);

    try{
        await ctx.editMessageText(jobText, {
            parse_mode: 'Markdown',
            ...keyboard
        })
    }
    catch(error){
        logger.warn('[Paginación] No se pudo editar el mensaje, probablemente porque no ha cambiado el contenido. Error: ');
    }
}