import { prisma } from "../config/prisma/prisma.js";
import { logger } from "../config/pino/logger.js";
import type { Job } from "../types/root.js";

// Servicio para manejar los favoritos de los usuarios
export class FavoriteService {
    // Método para agregar un empleo a los favoritos de un usuario
    async addFavorite(userId: number, name: string, job: Job) {
        // Se crea o se actualiza el usuario de la base de datos
        const user = await prisma.user.upsert({
            where: { id: BigInt(userId) },
            update: {name: name},
            create: {id: BigInt(userId), name: name}
        });
        if(!user) throw new Error("No se pudo crear o actualizar el usuario en la base de datos.");

        // Se crea el favorito en la base de datos
        try {
            const favorite = await prisma.favorite.create({
                data: {
                    userId: BigInt(user.id),
                    jobId: job.id,
                    title: job.title,
                    company: job.company,
                    link: job.link,
                }
            })
            logger.info(`Se ha agregado un nuevo favorito para el usuario ${userId}: ${job.title} en ${job.company}`);
            return favorite;
        }
        catch(error){
            // La restricción @@unique([userId, jobId]) lanza P2002 si el empleo ya está guardado
            if(error instanceof Error && (error as { code?: string }).code === 'P2002'){
                logger.warn(`El empleo "${job.title}" ya está en favoritos del usuario ${userId}`);
                return null;
            }
            throw error;
        }
    }

    // Método para obtener los favoritos de un usuario
    async getFavorites(userId: number){
        return await prisma.favorite.findMany({
            where: { userId: BigInt(userId) },
            orderBy: { createdAt: 'desc' }
        });
    }
}