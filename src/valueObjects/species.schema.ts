import { z } from "zod";

const nameSchema = z.string().trim().min(2).max(160);

const categorySchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .transform((value) => value.toLowerCase());

const latitudeSchema = z.coerce.number().min(-90).max(90);
const longitudeSchema = z.coerce.number().min(-180).max(180);
const recordedAtSchema = z.coerce.date();

export const speciesIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createSpeciesSchema = z.object({
  commonName: nameSchema,
  scientificName: nameSchema,
  category: categorySchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  recordedAt: recordedAtSchema.default(() => new Date()),
});

export const updateSpeciesSchema = z
  .object({
    commonName: nameSchema,
    scientificName: nameSchema,
    category: categorySchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    recordedAt: recordedAtSchema,
  })
  .partial();

export const listSpeciesQuerySchema = z.object({
  category: categorySchema.optional(),
  q: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export type SpeciesIdParam = z.infer<typeof speciesIdParamSchema>;
export type CreateSpeciesInput = z.infer<typeof createSpeciesSchema>;
export type UpdateSpeciesInput = z.infer<typeof updateSpeciesSchema>;
export type ListSpeciesQuery = z.infer<typeof listSpeciesQuerySchema>;
