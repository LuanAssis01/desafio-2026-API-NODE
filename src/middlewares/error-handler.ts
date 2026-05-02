import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { env } from "../lib/env";
import { HttpError } from "../lib/http-error";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados invalidos.",
        details: error.issues,
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    response.status(409).json({
      error: {
        code: "RESOURCE_ALREADY_EXISTS",
        message: "Ja existe um registro com os dados informados.",
      },
    });
    return;
  }

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno do servidor.",
      details: env.NODE_ENV === "development" ? String(error) : undefined,
    },
  });
};
