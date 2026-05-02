import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../valueObjects/auth.schema";

export const authRoutes = Router();

authRoutes.post("/register", validate({ body: registerSchema }), asyncHandler(AuthController.register));
authRoutes.post("/login", validate({ body: loginSchema }), asyncHandler(AuthController.login));
authRoutes.get("/me", authMiddleware, asyncHandler(AuthController.profile));
