import { Context } from 'telegraf';
import { AlertService } from '../../services/AlertService.js';
import type { Frecuency } from '../../types/root.js';

const alertService = new AlertService();

export async function handleAlert(ctx: Context): Promise<void>{
    if(!ctx.message || !('text' in ctx.message)) return;

    const args = ctx.message.text.split(' ').slice(1);
    if(args.length === 0){
        await ctx.reply(
            'Por favor, proporciona los términos de búsqueda para la alerta. Ejemplo: /alerta "desarrollador" 50000 Diario'
        );
        return;
    }

    if(!ctx.from){
        await ctx.reply('No se pudo identificar tu usuario.');
        return;
    }

    let minSalary = 0;
    const termsWords: string[] = [];

    args.forEach(arg => {
        if(!isNaN(Number(arg))){
            minSalary = Number(arg);
        }
        else{
            termsWords.push(arg);
        }
    });

    // Se parsea la frecuencia proporcionada (Diario por defecto)
    const frecuencyWord = args.find(arg =>
        arg.toLowerCase() === 'diario' || arg.toLowerCase() === 'semanal' || arg.toLowerCase() === 'mensual'
    )?.toLowerCase();
    const frecuency: Frecuency = frecuencyWord === 'semanal' ? 'Semanal' : frecuencyWord === 'mensual' ? 'Mensual' : 'Diario';

    const terms = termsWords.join(' ');

    // Se construyen los datos de la alerta condicionalmente (exactOptionalPropertyTypes)
    const alertData = minSalary > 0
        ? { userId: BigInt(ctx.from.id), terms, minSalary: minSalary.toString(), frecuency }
        : { userId: BigInt(ctx.from.id), terms, frecuency };

    await alertService.createAlert(alertData);

    await ctx.reply(
        `Se ha creado una nueva alerta con los términos: "${terms}"` +
        (minSalary > 0 ? ` y un salario mínimo de ${minSalary}` : '') +
        `. La frecuencia de la alerta es: ${frecuency}.`
    );
}