import { config } from "../config/config.js";
import { logger } from "../config/pino/logger.js";
import type { Job, RemoteOkResponse, Filters } from "../types/root.js";
import { calculateDaysofSince } from "../utils/functions.js";

export async function extractJobsFromRemoteok(filters: Filters): Promise<Job[]> {
    
    logger.info('Iniciando extracción de empleos de RemoteOk con el término de búsqueda');
    
    try{
        const response = await fetch(`${config.apiRemoteOk}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        if(!response.ok) throw new Error('Error en la respuesta de la API de RemoteOk');
        const data: RemoteOkResponse[] = await response.json();

        const jobs = data.filter((item) => item && item.position && item.company)
        const filteredJobs = jobs.filter((job) => {
            if(filters.term){
                const t = filters.term.toLowerCase();
                const titleMatch = job.position.toLowerCase().includes(t);
                const companyMatch = job.company.toLowerCase().includes(t);
                const tagsMatch = job.tags?.some(tag => tag.toLowerCase().includes(t));
                if(!titleMatch && !companyMatch && !tagsMatch) return false;
            }

            if(filters.salaryMin && filters.salaryMin > 0){
                const salaryOffer = job.salary_max || job.salary_min || 0;
                if(salaryOffer < filters.salaryMin) return false;
            }

            if(filters.salaryMax && filters.salaryMax > 0){
                const salaryOffer = job.salary_min || job.salary_max || 0;
                if(salaryOffer > filters.salaryMax) return false;
            }

            if(filters.tagMatch){
                const tagMatchLower = filters.tagMatch.toLowerCase();
                const hasMatchingTag = job.tags?.some(tag => tag.toLowerCase().includes(tagMatchLower));
                if(!hasMatchingTag) return false;
            }

            if(filters.daysOfSeniority && filters.daysOfSeniority > 0){
                const daysSincePublished = calculateDaysofSince(job.date);
                if(daysSincePublished > filters.daysOfSeniority) return false;
            }

            return true;
        })

        return filteredJobs.map((job) => {
            const daysOfSeniority = calculateDaysofSince(job.date);
            const dateText = daysOfSeniority === 0 ? 'Hoy' : `${daysOfSeniority} día(s) atrás`;
            const salaryText = job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : (job.salary_min ? `$${job.salary_min}` : 'No especificado');
            return {
                title: job.position,
                company: job.company,
                link: job.url,
                tags: job.tags || [],
                salary: salaryText,
                datePublished: dateText
            }
        })
    }
    catch(error){
        logger.error(`Error al extraer empleos de RemoteOk: ${error}`);
        return [];
    }
}

