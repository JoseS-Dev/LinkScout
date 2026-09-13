import { Markup } from 'telegraf';
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

// Función que codifica los filtros en una cadena segura para el callback data
function encodeFilters(filters: Filters): string {
    return [
        encodeURIComponent(filters.term ?? ''),
        filters.salaryMin ?? 0,
        filters.salaryMax ?? 0,
        encodeURIComponent(filters.tagMatch ?? ''),
        filters.daysOfSeniority ?? 0
    ].join('|');
}

// Función que genera los botones de navegación para la paginación de empleos
export function generatePaginationButtons(filters: Filters, currentPage: number, totalPages: number) : ReturnType<typeof Markup.inlineKeyboard> {
    const buttons = [];
    const filterCode = encodeFilters(filters);

    if (currentPage > 0) {
        buttons.push(Markup.button.callback('⬅️ Anterior', `page:${filterCode}|${currentPage - 1}`));
    }

    buttons.push(Markup.button.callback(`📄 ${currentPage + 1}/${totalPages}`, 'ignore'));

    if(currentPage < totalPages - 1){
        buttons.push(Markup.button.callback('Siguiente ➡️', `page:${filterCode}|${currentPage + 1}`));
    }

    return Markup.inlineKeyboard([buttons])
}