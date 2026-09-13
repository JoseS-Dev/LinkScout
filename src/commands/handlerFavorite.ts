import { Context } from 'telegraf';
import { logger } from '../config/pino/logger.js';
import { extractJobsFromRemoteok } from '../services/scraper.js';
import { decodeFilters } from '../utils/functions.js';
import { FavoriteService } from '../services/favoriteService.js';

const favoriteService = new FavoriteService();

// Función para guardar un empleo como favorito para un usuario
export async function handleFavorite(ctx: Context){
    if(!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    const callbackData = ctx.callbackQuery.data;

    const parts = callbackData.split(':');
    if(parts[0] !== 'fav') return;

    // El callback data es: fav:<filtros codificados>:<índice del empleo>
    const filterCode = parts[1] ?? '';
    const index = parseInt(parts[2] ?? '0', 10);

    // Se obtiene la vacante seleccionada reaplicando los mismos filtros de la búsqueda
    const filters = decodeFilters(filterCode);
    const jobs = await extractJobsFromRemoteok(filters);
    const selectedJob = jobs[index];

    if(!selectedJob){
        logger.warn(`No se pudo encontrar el empleo seleccionado para guardar como favorito. Índice: ${index}`);
        await ctx.answerCbQuery('No se pudo encontrar el empleo seleccionado.', { show_alert: true });
        return;
    }

    if(!ctx.from) return;

    // Se guarda el empleo como favorito en la base de datos
    try{
        const result = await favoriteService.addFavorite(ctx.from.id, ctx.from.first_name, selectedJob);

        if(!result){
            return ctx.answerCbQuery('Esta vacante ya está en tus favoritos.', { show_alert: true });
        }

        await ctx.answerCbQuery('Vacante guardada en tus favoritos ⭐', { show_alert: true });
    }
    catch(error){
        logger.error(`Error al guardar el empleo como favorito: ${error}`);
        await ctx.answerCbQuery('Ocurrió un error al guardar el favorito.', { show_alert: true });
    }
}

// Comando para ver los favoritos de un usuario
export async function commandFavorites(ctx: Context){
    if(!ctx.from) return;

    const favorites = await favoriteService.getFavorites(ctx.from.id);

    if(favorites.length === 0){
        await ctx.reply('No tienes vacantes guardadas como favoritas.');
        return;
    }

    let message = '⭐ Tus vacantes favoritas:\n\n';
    favorites.forEach((fav, index) => {
        message += `${index + 1}. *${fav.title}* en *${fav.company}*\n🔗 [Ver más](${fav.link})\n\n`;
    })
    await ctx.reply(message, { parse_mode: 'Markdown' });
}