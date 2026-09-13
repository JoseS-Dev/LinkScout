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

    // Método para eliminar un favorito de un usuario
    async removeFavorite(userId: number, jobId: string) {
        // Se verifica que exista el usuario en cuestión
        const existingUser = await prisma.user.findUnique({
            where: { id: BigInt(userId) }
        });
        if(!existingUser) throw new Error("El usuario no existe en la base de datos.");
        // Se elimina el favorito de la base de datos
        const deletedFavorite = await prisma.favorite.deleteMany({
            where: {
                userId: BigInt(userId),
                jobId: jobId
            }
        });
        if(deletedFavorite.count > 0){
            logger.info(`Se ha eliminado el favorito con jobId ${jobId} para el usuario ${userId}`);
            return true;
        }
        return false;
    }

    // Método para verificar si un empleo está en los favoritos de un usuario
    async isFavorite(userId: number, jobId: string) {
        const favorite = await prisma.favorite.findFirst({
            where: {
                userId: BigInt(userId),
                jobId: jobId
            },
            select: { id: true }
        });
        return Boolean(favorite);
    }

    // Método para eliminar un favorito por su ID de la base de datos
    async removeFavoriteById(userId: number, favId: number) {
        const deletedFavorite = await prisma.favorite.deleteMany({
            where: {
                id: favId,
                userId: BigInt(userId)
            }
        });
        if(deletedFavorite.count > 0){
            logger.info(`Se ha eliminado el favorito con id ${favId} para el usuario ${userId}`);
            return true;
        }
        return false;
    }

    // Método para obtener los favoritos de un usuario
    async getFavorites(userId: number){
        return await prisma.favorite.findMany({
            where: { userId: BigInt(userId) },
            orderBy: { createdAt: 'desc' }
        });
    }
}