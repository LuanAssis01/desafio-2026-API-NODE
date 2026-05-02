import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { ExternalDataService } from "./external-data.service";
import type {
  CreateSpeciesInput,
  ListSpeciesQuery,
  UpdateSpeciesInput,
} from "../valueObjects/species.schema";

function buildSpeciesWhere(filters: Pick<ListSpeciesQuery, "category" | "q">): Prisma.SpeciesWhereInput {
  const where: Prisma.SpeciesWhereInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.q) {
    where.OR = [
      { commonName: { contains: filters.q, mode: "insensitive" } },
      { scientificName: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export const SpeciesService = {
  async create(input: CreateSpeciesInput, userId: string) {
    const externalData = await ExternalDataService.getSpeciesData(input);

    return prisma.species.create({
      data: {
        ...input,
        externalData: externalData ?? undefined,
        createdById: userId,
      },
    });
  },

  async list(filters: ListSpeciesQuery) {
    const where = buildSpeciesWhere(filters);
    const skip = (filters.page - 1) * filters.perPage;

    const [items, total] = await prisma.$transaction([
      prisma.species.findMany({
        where,
        orderBy: { recordedAt: "desc" },
        skip,
        take: filters.perPage,
      }),
      prisma.species.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: filters.page,
        perPage: filters.perPage,
        total,
        totalPages: Math.ceil(total / filters.perPage),
      },
    };
  },

  async findById(id: string) {
    const species = await prisma.species.findUnique({
      where: { id },
    });

    if (!species) {
      throw new HttpError(404, "Especie nao encontrada.", "SPECIES_NOT_FOUND");
    }

    return species;
  },

  async update(id: string, input: UpdateSpeciesInput) {
    await this.findById(id);

    return prisma.species.update({
      where: { id },
      data: input,
    });
  },

  async delete(id: string) {
    await this.findById(id);

    await prisma.species.delete({
      where: { id },
    });
  },

  async statsByCategory() {
    const stats = await prisma.species.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    return stats.map((item) => ({
      category: item.category,
      total: item._count._all,
    }));
  },
};
