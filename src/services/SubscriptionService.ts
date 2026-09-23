import {prisma} from '../config/prisma/prisma.js';

export class SubscriptionService {
    // Método para crear una nueva suscripción
    async createSubscription(userId: number, name: string, nameCategory: string){
        // Se verifica que exista el usuario
        const existingUser = await prisma.user.upsert({ 
            where: { id: BigInt(userId) },
            update: {name: name},
            create: { id: BigInt(userId) }
        })
        if(!existingUser) throw new Error("No se pudo crear o actualizar el usuario en la base de datos.");

        // Se crea la suscripción en la base de datos
        const createSubscription = await prisma.subscription.upsert({
            where: {
                userId_category: {
                    userId: existingUser.id,
                    category: nameCategory.toLowerCase()
                }
            },
            update: {},
            create: {
                userId: existingUser.id,
                category: nameCategory.toLowerCase()
            }
        });
        if(!createSubscription) throw new Error("No se pudo crear la suscripción en la base de datos.");
        return createSubscription;
    }

    // Método para eliminar una suscripción
    async removeSubscription(userId: number, nameCategory: string){
        // Se verifica que exista el usuario
        const existingUser = await prisma.user.findUnique({
            where: { id: BigInt(userId) }
        });
        if(!existingUser) throw new Error("El usuario no existe en la base de datos.");
        // Se elimina la suscripción de la base de datos
        const deletedSubscription = await prisma.subscription.deleteMany({
            where: {
                userId: existingUser.id,
                category: nameCategory.toLowerCase()
            }
        });
        if(deletedSubscription.count > 0){
            return true;
        }
        return false;
    }

    // Método para obtener todas las suscripciones por categoria
    async getSubscriptionsByCategory(category: string){
        const subscriptions = await prisma.subscription.findMany({
            where: {
                category: category.toLowerCase()
            }
        });
        return subscriptions;
    }
}