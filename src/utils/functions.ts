import path from "path";
import type { Filters } from "../types/root.js";

// Función para colocar el .env correcto dependiendo del entorno de ejecución
export function loadEnv(env: string = process.env.NODE_ENV || "development"){
    const envFile: Record<string, string> = {
        development: ".env.development",
        production: ".env.production"
    }
    const fileName = envFile[env] || ".env.development";
    return path.join(process.cwd(), fileName);
}

// Función que convierte una fecha ISO en dias transcurridos
export function calculateDaysofSince(dateInfo?: string) : number {
    if(!dateInfo) return 0;
    const datePublished = new Date(dateInfo).getTime();
    const now = Date.now();
    const diffInMs = now - datePublished;
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

// Función que codifica los filtros en una cadena segura para el callback data
export function encodeFilters(filters: Filters): string {
    return [
        encodeURIComponent(filters.term ?? ''),
        filters.salaryMin ?? 0,
        filters.salaryMax ?? 0,
        encodeURIComponent(filters.tagMatch ?? ''),
        filters.daysOfSeniority ?? 0
    ].join('|');
}

// Función que decodifica la cadena codificada y reconstruye los filtros de búsqueda
export function decodeFilters(filterCode: string): Filters {
    const fields = filterCode.split('|');
    return {
        term: decodeURIComponent(fields[0] ?? ''),
        salaryMin: parseInt(fields[1] ?? '0', 10) || 0,
        salaryMax: parseInt(fields[2] ?? '0', 10) || 0,
        tagMatch: decodeURIComponent(fields[3] ?? ''),
        daysOfSeniority: parseInt(fields[4] ?? '0', 10) || 0
    };
}

// Función que decodifica el callback data y reconstruye los filtros de búsqueda
export function parsePaginationData(callbackData: string): { filters: Filters, page: number } | null {
    const parts = callbackData.split(':');
    if(parts[0] !== 'page') return null;

    const fields = (parts[1] ?? '').split('|');

    return {
        filters: decodeFilters(fields.slice(0, 5).join('|')),
        page: parseInt(fields[5] ?? '0', 10)
    }
}

