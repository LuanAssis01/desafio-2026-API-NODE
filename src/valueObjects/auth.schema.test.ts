import { describe, expect, test } from "bun:test";

import { loginSchema, registerSchema } from "./auth.schema";

describe("auth schemas", () => {
  test("normaliza os dados de cadastro", () => {
    const result = registerSchema.parse({
      name: "  Luan  ",
      email: "  LUAN@example.COM  ",
      password: "12345678",
    });

    expect(result).toEqual({
      name: "Luan",
      email: "luan@example.com",
      password: "12345678",
    });
  });

  test("rejeita senha curta no cadastro", () => {
    const result = registerSchema.safeParse({
      email: "luan@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
  });

  test("normaliza email no login", () => {
    const result = loginSchema.parse({
      email: "  LUAN@example.COM  ",
      password: "12345678",
    });

    expect(result.email).toBe("luan@example.com");
  });
});
