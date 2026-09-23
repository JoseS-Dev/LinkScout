import { Context, Markup } from 'telegraf';
import { CATEGORIES_AVAILABLE } from '../../utils/constants.js';
import { SubscriptionService } from '../../services/SubscriptionService.js';

const subscriptionService = new SubscriptionService();

// Función para manejar la suscripción a categorías
export async function handleSubscribe(ctx: Context){
    if(!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const buttons = CATEGORIES_AVAILABLE.map(category => {
        return Markup.button.callback(category.label, `subscribe:${category.id}`);
    });

    await ctx.reply(
    '🔔 *Suscripción por Categorías*\n\nSelecciona la categoría de la cual deseas recibir alertas automáticas:',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    }
  );
}

// Función para capturar la selección de la categoría y crear la suscripción
export async function handleCategorySelection(ctx: Context){
    if(!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    if(!ctx.from) return;
    const callbackData = ctx.callbackQuery.data;

    const categoriesId = callbackData.replace('subscribe:', '');

    // Se valida que la categoría exista entre las disponibles
    const category = CATEGORIES_AVAILABLE.find(cat => cat.id === categoriesId);
    if(!category){
        await ctx.answerCbQuery('La categoría seleccionada no es válida.', { show_alert: true });
        return;
    }

    await subscriptionService.createSubscription(ctx.from.id, ctx.from.first_name, category.id);

    await ctx.answerCbQuery(`¡Te has suscrito a la categoría: ${category.label}!`);
    await ctx.editMessageText(`✅ Has sido suscrito a la categoría: *${category.label}*`, { parse_mode: 'Markdown' });
}