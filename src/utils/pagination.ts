import { Markup } from 'telegraf';
import { encodeFilters } from './functions.js';
import type { Job, Filters } from '../types/root.js';

// Función que genera el texto del empleo en una posición actual
export function generateJobText(job: Job, index: number, total: number) : string {
    const textTags = job.tags.length > 0 ? `🏷️ *Tags:* ${job.tags.slice(0, 4).join(', ')}\n` : '';
    const textSalary = job.salary !== 'No especificado' ? `💵 *Salario:* ${job.salary}\n` : ''

    return (
        `💼 *${job.title}*\n`
        + `🏢 *Empresa:* ${job.company}\n` +
        textSalary +
        textTags +
        `📅 *Publicado:* ${job.datePublished}\n` +
        `📌 *Resultado:* ${index + 1} de ${total}\n\n` +
        `🔗 [Ver más](${job.link})`
    )
}


// Función que genera los botones de navegación para la paginación de empleos
export function generatePaginationButtons(
    filters: Filters, 
    currentPage: number, 
    totalPages: number,
    isFavorite: boolean = false
) : ReturnType<typeof Markup.inlineKeyboard> {
    const buttons = [];
    const filterCode = encodeFilters(filters);

    if (currentPage > 0) {
        buttons.push(Markup.button.callback('⬅️ Anterior', `page:${filterCode}|${currentPage - 1}`));
    }

    buttons.push(Markup.button.callback(`📄 ${currentPage + 1}/${totalPages}`, 'ignore'));

    if(currentPage < totalPages - 1){
        buttons.push(Markup.button.callback('Siguiente ➡️', `page:${filterCode}|${currentPage + 1}`));
    }

    const buttonFavorite = isFavorite
        ? Markup.button.callback('❌ Quitar de favoritos', `fav:${filterCode}|${currentPage}|remove`)
        : Markup.button.callback('⭐ Agregar a favoritos', `fav:${filterCode}|${currentPage}|add`);

    return Markup.inlineKeyboard([buttons, [buttonFavorite]]);
}