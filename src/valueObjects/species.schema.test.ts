import { describe, expect, test } from "bun:test";

import {
  createSpeciesSchema,
  listSpeciesQuerySchema,
  speciesIdParamSchema,
  updateSpeciesSchema,
} from "./species.schema";

describe("species schemas", () => {
  test("normaliza e converte dados de criacao", () => {
    const result = createSpeciesSchema.parse({
      commonName: "  Tilapia  ",
      scientificName: "  Oreochromis niloticus  ",
      category: "  PEIXE  ",
      latitude: "-3.7319",
      longitude: "-38.5267",
      recordedAt: "2026-05-02T20:00:00.000Z",
    });

    expect(result.commonName).toBe("Tilapia");
    expect(result.scientificName).toBe("Oreochromis niloticus");
    expect(result.category).toBe("peixe");
    expect(result.latitude).toBe(-3.7319);
    expect(result.longitude).toBe(-38.5267);
    expect(result.recordedAt).toEqual(new Date("2026-05-02T20:00:00.000Z"));
  });

  test("rejeita coordenadas fora do intervalo permitido", () => {
    const result = createSpeciesSchema.safeParse({
      commonName: "Tilapia",
      scientificName: "Oreochromis niloticus",
      category: "peixe",
      latitude: -91,
      longitude: -38.5267,
      recordedAt: "2026-05-02T20:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  test("aceita atualizacao parcial", () => {
    const result = updateSpeciesSchema.parse({
      category: "  AVE  ",
    });

    expect(result).toEqual({ category: "ave" });
  });

  test("aplica defaults e coercion na listagem", () => {
    const result = listSpeciesQuerySchema.parse({
      page: "2",
      perPage: "10",
      category: "  PEIXE  ",
    });

    expect(result).toEqual({
      page: 2,
      perPage: 10,
      category: "peixe",
    });
  });

  test("usa paginacao default quando query vem vazia", () => {
    const result = listSpeciesQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  test("valida parametro id como uuid", () => {
    const validId = "8c381d56-7f0f-4520-a251-ddeaa4bde736";

    expect(speciesIdParamSchema.parse({ id: validId })).toEqual({ id: validId });
    expect(speciesIdParamSchema.safeParse({ id: "abc" }).success).toBe(false);
  });
});
