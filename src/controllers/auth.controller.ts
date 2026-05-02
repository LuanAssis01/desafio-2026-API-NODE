import type { Request, Response } from "express";

import { HttpError } from "../lib/http-error";
import { AuthService } from "../services/auth.service";
import type { LoginInput, RegisterInput } from "../valueObjects/auth.schema";

export const AuthController = {
  async register(request: Request, response: Response) {
    const result = await AuthService.register(request.body as RegisterInput);

    response.status(201).json(result);
  },

  async login(request: Request, response: Response) {
    const result = await AuthService.login(request.body as LoginInput);

    response.status(200).json(result);
  },

  async profile(request: Request, response: Response) {
    if (!request.user) {
      throw new HttpError(401, "Usuario nao autenticado.", "UNAUTHENTICATED");
    }

    const user = await AuthService.profile(request.user.id);

    response.status(200).json({ user });
  },
};
