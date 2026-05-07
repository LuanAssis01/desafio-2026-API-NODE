import type { NextFunction, Request, Response } from "express";
import { describe, expect, mock, test } from "bun:test";

import { asyncHandler } from "./async-handler";

describe("asyncHandler", () => {
  test("chama next quando handler async rejeita", async () => {
    const error = new Error("falhou");
    const next = mock(() => undefined) as NextFunction;
    const handler = asyncHandler(async () => {
      throw error;
    });

    handler({} as Request, {} as Response, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(error);
  });
});
