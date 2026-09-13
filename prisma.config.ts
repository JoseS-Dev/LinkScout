import dotenv from "dotenv";
import { loadEnv } from "./src/utils/functions.js";
import { defineConfig } from "prisma/config";

dotenv.config({ path: loadEnv(process.env.NODE_ENV) });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
