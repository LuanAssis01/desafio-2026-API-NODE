import type { NextFunction, Request, Response } from "express";
import { describe, expect, mock, test } from "bun:test";
import { z } from "zod";

import { validate } from "./validate";

describe("validate middleware", () => {
  test("parseia body, params e query", () => {
    const request = {
      body: { name: "  Luan  " },
      params: { id: "123" },
      query: { page: "2" },
    } as unknown as Request;
    const next = mock(() => undefined) as NextFunction;

    validate({
      body: z.object({ name: z.string().trim() }),
      params: z.object({ id: z.string().transform(Number) }),
      query: z.object({ page: z.coerce.number() }),
    })(request, {} as Response, next);

    expect(request.body).toEqual({ name: "Luan" });
    expect(request.params as unknown).toEqual({ id: 123 });
    expect(request.query as unknown).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("propaga erro de validacao sem chamar next", () => {
    const request = {
      body: { name: "" },
    } as Request;
    const next = mock(() => undefined) as NextFunction;
    const middleware = validate({
      body: z.object({ name: z.string().min(1) }),
    });

    expect(() => middleware(request, {} as Response, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});
