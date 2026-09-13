import path from "path";

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

