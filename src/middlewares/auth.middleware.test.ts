import type { NextFunction, Request, Response } from "express";
import { describe, expect, mock, test } from "bun:test";

import { HttpError } from "../lib/http-error";
import { signJwt } from "../lib/jwt";
import { authMiddleware } from "./auth.middleware";

describe("authMiddleware", () => {
  test("popula request.user quando token e valido", () => {
    const token = signJwt({
      sub: "user-id",
      email: "luan@example.com",
    });
    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;
    const next = mock(() => undefined) as NextFunction;

    authMiddleware(request, {} as Response, next);

    expect(request.user).toEqual({
      id: "user-id",
      email: "luan@example.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("rejeita requisicao sem token", () => {
    const request = {
      headers: {},
    } as Request;
    const next = mock(() => undefined) as NextFunction;

    expect(() => authMiddleware(request, {} as Response, next)).toThrow(HttpError);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejeita formato invalido de token", () => {
    const request = {
      headers: {
        authorization: "Token abc",
      },
    } as Request;
    const next = mock(() => undefined) as NextFunction;

    expect(() => authMiddleware(request, {} as Response, next)).toThrow("Formato de token invalido.");
    expect(next).not.toHaveBeenCalled();
  });
});
