import { z } from "zod";

const fallbackJwtSecret = "dev-secret-change-me-with-at-least-32-characters";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  JWT_SECRET: z.string().min(32).default(fallbackJwtSecret),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24),
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === "production" && parsedEnv.JWT_SECRET === fallbackJwtSecret) {
  throw new Error("JWT_SECRET must be configured in production.");
}

export const env = parsedEnv;
