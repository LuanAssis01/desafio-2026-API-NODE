import { Router } from "express";

import { authRoutes } from "./auth.routes";
import { speciesRoutes } from "./species.routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/species", speciesRoutes);
