import { z } from "zod";

const emailSchema = z.string().trim().email().toLowerCase();

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: emailSchema,
  password: z.string().min(8).max(120),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(120),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
