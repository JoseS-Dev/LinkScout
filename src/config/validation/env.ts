import z from "zod";
import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { loadEnv } from "../../utils/functions.js";

dotenv.config({ path: loadEnv(process.env.NODE_ENV) });

export const envSchema = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production"]).default("development"),
        TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
        PORT: z.coerce.number().default(3000),
        DATABASE_URL: z.string().url().default("postgresql://user:password@localhost:5432/dbname"),
        API_REMOTEOK: z.string().url().default("https://prueba.com/api"),
        CRON_JOB_ALERT: z.string().default("0 9 * * *")
    },
    client: {},
    clientPrefix: 'VITE_',
    runtimeEnv: process.env,
    onValidationError: (error) => {
        console.error("Error de validación de variables de entorno:", error);
        process.exit(1); // Salir del proceso con un código de error
    }
})

