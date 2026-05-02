import { Router } from "express";

import { SpeciesController } from "../controllers/species.controller";
import { asyncHandler } from "../middlewares/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  createSpeciesSchema,
  listSpeciesQuerySchema,
  speciesIdParamSchema,
  updateSpeciesSchema,
} from "../valueObjects/species.schema";

export const speciesRoutes = Router();

speciesRoutes.get("/", validate({ query: listSpeciesQuerySchema }), asyncHandler(SpeciesController.index));
speciesRoutes.get("/stats", asyncHandler(SpeciesController.stats));
speciesRoutes.get("/:id", validate({ params: speciesIdParamSchema }), asyncHandler(SpeciesController.show));
speciesRoutes.post(
  "/",
  authMiddleware,
  validate({ body: createSpeciesSchema }),
  asyncHandler(SpeciesController.create),
);
speciesRoutes.put(
  "/:id",
  authMiddleware,
  validate({ params: speciesIdParamSchema, body: updateSpeciesSchema }),
  asyncHandler(SpeciesController.update),
);
speciesRoutes.delete(
  "/:id",
  authMiddleware,
  validate({ params: speciesIdParamSchema }),
  asyncHandler(SpeciesController.delete),
);
