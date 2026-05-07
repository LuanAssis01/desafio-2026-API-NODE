import { createHmac } from "node:crypto";
import { describe, expect, test } from "bun:test";

import { HttpError } from "./http-error";
import { signJwt, verifyJwt } from "./jwt";

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signTestToken(payload: unknown) {
  const encodedHeader = encodeBase64Url({ alg: "HS256", typ: "JWT" });
  const encodedPayload = encodeBase64Url(payload);
  const content = `${encodedHeader}.${encodedPayload}`;
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-me-with-at-least-32-characters";
  const signature = createHmac("sha256", secret).update(content).digest("base64url");

  return `${content}.${signature}`;
}

describe("jwt", () => {
  test("assina e valida um token", () => {
    const token = signJwt({
      sub: "user-id",
      email: "luan@example.com",
    });

    const payload = verifyJwt(token);

    expect(payload.sub).toBe("user-id");
    expect(payload.email).toBe("luan@example.com");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test("rejeita token mal formatado", () => {
    expect(() => verifyJwt("token-invalido")).toThrow(HttpError);
  });

  test("rejeita token com assinatura alterada", () => {
    const token = signJwt({
      sub: "user-id",
      email: "luan@example.com",
    });
    const tamperedToken = `${token.slice(0, -1)}x`;

    expect(() => verifyJwt(tamperedToken)).toThrow("Token invalido.");
  });

  test("rejeita token expirado", () => {
    const token = signTestToken({
      sub: "user-id",
      email: "luan@example.com",
      iat: 1,
      exp: 2,
    });

    expect(() => verifyJwt(token)).toThrow("Token expirado.");
  });
});
