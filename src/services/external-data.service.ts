import type { CreateSpeciesInput } from "../valueObjects/species.schema";

type ExternalSpeciesData = {
  provider: string;
  fetchedAt: string;
  data: Record<string, unknown>;
};

export const ExternalDataService = {
  async getSpeciesData(_species: CreateSpeciesInput): Promise<ExternalSpeciesData | null> {
    return null;
  },
};
