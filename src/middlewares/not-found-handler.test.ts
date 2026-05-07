import type { Request, Response } from "express";
import { describe, expect, mock, test } from "bun:test";

import { notFoundHandler } from "./not-found-handler";

function createResponse() {
  const response = {
    status: mock(function status(this: Response, _statusCode: number) {
      return this;
    }),
    json: mock((_body: unknown) => undefined),
  } as unknown as Response;

  return response;
}

describe("notFoundHandler", () => {
  test("retorna erro 404 padronizado", () => {
    const request = {
      method: "GET",
      originalUrl: "/rota-inexistente",
    } as Request;
    const response = createResponse();

    notFoundHandler(request, response, () => undefined);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Rota GET /rota-inexistente nao encontrada.",
      },
    });
  });
});
