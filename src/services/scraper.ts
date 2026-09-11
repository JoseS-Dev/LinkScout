import { chromium } from "playwright";
import { config } from "../config/config.js";
import { logger } from "../config/pino/logger.js";
import type { Job, RemoteOkResponse } from "../types/root.js";

export async function extractJobsFromRemoteok(searchTerm: string): Promise<Job[]> {
    
    logger.info(`Iniciando extracción de empleos de RemoteOk con el término de búsqueda: ${searchTerm}`);
    
    try{
        const response = await fetch(`${config.apiRemoteOk}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        if(!response.ok) throw new Error('Error en la respuesta de la API de RemoteOk');
        const data: RemoteOkResponse[] = await response.json();

        const jobs = data.filter((item) => item && item.position && item.company)
        const term = searchTerm.toLowerCase();

        const filteredJobs = jobs.filter((job) => {
            const titleMatch = job.position.toLowerCase().includes(term);
            const companyMatch = job.company.toLowerCase().includes(term);
            const tagsMatch = job.tags?.some(tag => tag.toLowerCase().includes(term)) ?? false;
            return titleMatch || companyMatch || tagsMatch;
        })

        return filteredJobs.slice(0, 10).map((job) => ({
            title: job.position,
            company: job.company,
            link: job.url,
            tags: job.tags || [],
            salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : "Not specified"
        }));
    }
    catch(error){
        logger.error(`Error al extraer empleos de RemoteOk: ${error}`);
        return [];
    }
}

