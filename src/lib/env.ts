import { z } from "zod";

const fallbackJwtSecret = "dev-secret-change-me-with-at-least-32-characters";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32).default(fallbackJwtSecret),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24),
  GBIF_API_BASE_URL: z.string().url().default("https://api.gbif.org/v1"),
  GBIF_USER_AGENT: z.string().trim().min(1).default("desafio-2026-api-node/1.0"),
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === "production" && parsedEnv.JWT_SECRET === fallbackJwtSecret) {
  throw new Error("JWT_SECRET must be configured in production.");
}

export const env = parsedEnv;
