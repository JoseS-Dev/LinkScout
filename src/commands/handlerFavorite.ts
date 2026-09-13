import { Context, Markup } from 'telegraf';
import { logger } from '../config/pino/logger.js';
import { extractJobsFromRemoteok } from '../services/scraper.js';
import { decodeFilters } from '../utils/functions.js';
import { FavoriteService } from '../services/favoriteService.js';

const favoriteService = new FavoriteService();

// Función unificada para manejar acciones de favoritos (agregar/eliminar)
// Formatos de callback data soportados:
//   - fav:del:<favId>               → eliminar por ID de la base de datos
//   - fav:<filtros>|<índice>|<add>  → agregar desde resultados de búsqueda
//   - fav:<filtros>|<índice>|<remove> → eliminar desde resultados de búsqueda
export async function handleFavorite(ctx: Context){
    if(!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    const callbackData = ctx.callbackQuery.data;

    const parts = callbackData.split(':');
    if(parts[0] !== 'fav') return;

    // Eliminar por ID del favorito en la base de datos: fav:del:<favId>
    if(parts[1] === 'del'){
        const favId = parseInt(parts[2] ?? '0', 10);
        if(!ctx.from || isNaN(favId)) return;

        try{
            const removed = await favoriteService.removeFavoriteById(ctx.from.id, favId);
            await ctx.answerCbQuery(
                removed ? 'Vacante eliminada de tus favoritos ❌' : 'No se encontró el favorito.',
                { show_alert: true }
            );
        }
        catch(error){
            logger.error(`Error al eliminar favorito: ${error}`);
            await ctx.answerCbQuery('Ocurrió un error al eliminar el favorito.', { show_alert: true });
        }
        return;
    }

    // Agregar/Eliminar desde resultados de búsqueda: fav:<filtros>|<índice>|<acción>
    const filterParts = (parts[1] ?? '').split('|');
    if(filterParts.length < 7) return;

    const filterCode = filterParts.slice(0, 5).join('|');
    const page = parseInt(filterParts[5] ?? '0', 10);
    const action = filterParts[6];

    const filters = decodeFilters(filterCode);
    const results = await extractJobsFromRemoteok(filters);
    const selectedJob = results[page];

    if(!selectedJob){
        logger.warn(`No se pudo encontrar el empleo seleccionado. Índice: ${page}`);
        await ctx.answerCbQuery('No se pudo encontrar el empleo seleccionado.', { show_alert: true });
        return;
    }

    if(!ctx.from) return;

    try{
        if(action === 'remove'){
            const removed = await favoriteService.removeFavorite(ctx.from.id, selectedJob.id);
            await ctx.answerCbQuery(
                removed ? 'Vacante eliminada de tus favoritos ❌' : 'Esta vacante no estaba en tus favoritos.',
                { show_alert: true }
            );
        }
        else{
            const result = await favoriteService.addFavorite(ctx.from.id, ctx.from.first_name, selectedJob);
            await ctx.answerCbQuery(
                result ? 'Vacante guardada en tus favoritos ⭐' : 'Esta vacante ya está en tus favoritos.',
                { show_alert: true }
            );
        }
    }
    catch(error){
        logger.error(`Error al procesar favorito: ${error}`);
        await ctx.answerCbQuery('Ocurrió un error al procesar el favorito.', { show_alert: true });
    }
}

// Comando para ver los favoritos de un usuario, con botón ❌ para eliminar cada uno
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
    });

    const buttons = favorites.map((fav) => [
        Markup.button.callback(`❌ ${fav.title} @ ${fav.company}`, `fav:del:${fav.id}`)
    ]);

    await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    });
}