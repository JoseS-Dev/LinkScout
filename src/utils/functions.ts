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

