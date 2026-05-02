import type { Request, Response } from "express";

import { HttpError } from "../lib/http-error";
import { SpeciesService } from "../services/species.service";
import type {
  CreateSpeciesInput,
  ListSpeciesQuery,
  SpeciesIdParam,
  UpdateSpeciesInput,
} from "../valueObjects/species.schema";

export const SpeciesController = {
  async create(request: Request, response: Response) {
    if (!request.user) {
      throw new HttpError(401, "Usuario nao autenticado.", "UNAUTHENTICATED");
    }

    const species = await SpeciesService.create(request.body as CreateSpeciesInput, request.user.id);

    response.status(201).json({ species });
  },

  async index(request: Request, response: Response) {
    const result = await SpeciesService.list(request.query as unknown as ListSpeciesQuery);

    response.status(200).json(result);
  },

  async show(request: Request, response: Response) {
    const { id } = request.params as SpeciesIdParam;
    const species = await SpeciesService.findById(id);

    response.status(200).json({ species });
  },

  async update(request: Request, response: Response) {
    const { id } = request.params as SpeciesIdParam;
    const species = await SpeciesService.update(id, request.body as UpdateSpeciesInput);

    response.status(200).json({ species });
  },

  async delete(request: Request, response: Response) {
    const { id } = request.params as SpeciesIdParam;

    await SpeciesService.delete(id);

    response.status(204).send();
  },

  async stats(_request: Request, response: Response) {
    const stats = await SpeciesService.statsByCategory();

    response.status(200).json({ stats });
  },
};
