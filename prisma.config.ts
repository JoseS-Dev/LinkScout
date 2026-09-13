import dotenv from "dotenv";
import { loadEnv } from "./src/utils/functions.js";
import { defineConfig } from "prisma/config";

dotenv.config({ path: loadEnv(process.env.NODE_ENV) });

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/dbname";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
