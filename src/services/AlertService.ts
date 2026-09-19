import { prisma } from "../config/prisma/prisma.js";
import { logger } from "../config/pino/logger.js";
import type { AlertCreate } from "../types/root.js";

export class AlertService {
    // Método para crear una alerta para un usuario
    async createAlert(alertData: AlertCreate){
        // Se verifica que exista el usuario en cuestión
        const existingUser = await prisma.user.findUnique({
            where: { id: alertData.userId }
        });
        if(!existingUser) throw new Error("El usuario no existe en la base de datos.");

        // Se crea la alerta en la base de datos
        const alert = await prisma.alert.create({
            data: {
                userId: BigInt(alertData.userId),
                terms: alertData.terms,
                minSalary: alertData.minSalary || null,
                frecuency: alertData.frecuency
            }
        });
        logger.info(`Se ha creado una nueva alerta para el usuario ${alertData.userId}: ${alertData.terms} con frecuencia ${alertData.frecuency}`);
        return alert;
    }

    // Método para obtener todas las alertas activas
    async getAlertsByActive(){
        return await prisma.alert.findMany({
            where: {isActive: true}
        });
    }

    // Método para registrar el último envío de una alerta
    async markAsSent(alertId: number){
        const updated = await prisma.alert.update({
            where: {id: alertId},
            data: {lastSentAt: new Date()}
        });
        return updated;
    }
}