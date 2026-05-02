import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/http-error";
import { verifyJwt } from "../lib/jwt";

export function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    throw new HttpError(401, "Token de autenticacao nao informado.", "MISSING_TOKEN");
  }

  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer" || !token) {
    throw new HttpError(401, "Formato de token invalido.", "INVALID_TOKEN_FORMAT");
  }

  const payload = verifyJwt(token);

  request.user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
}
