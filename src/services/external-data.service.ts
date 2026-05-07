import type { Prisma } from "@prisma/client";

import { env } from "../lib/env";
import type { CreateSpeciesInput } from "../valueObjects/species.schema";

type ExternalSpeciesData = {
  provider: string;
  fetchedAt: string;
  data: Prisma.InputJsonValue;
};

type SpeciesLookupInput = Pick<CreateSpeciesInput, "scientificName">;

type GbifSpeciesMatchResponse = {
  usageKey?: number;
  acceptedUsageKey?: number;
  scientificName?: string;
  canonicalName?: string;
  rank?: string;
  status?: string;
  confidence?: number;
  matchType?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  synonym?: boolean;
  note?: string;
  issues?: string[];
  alternatives?: GbifSpeciesMatchResponse[];
};

type GbifOccurrenceSearchResponse = {
  count?: number;
};

function buildGbifUrl(path: string, params: Record<string, string | number | boolean>) {
  const baseUrl = env.GBIF_API_BASE_URL.endsWith("/")
    ? env.GBIF_API_BASE_URL
    : `${env.GBIF_API_BASE_URL}/`;
  const url = new URL(path.replace(/^\//, ""), baseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  return url;
}

async function fetchGbifJson<T>(path: string, params: Record<string, string | number | boolean>) {
  const url = buildGbifUrl(path, params);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": env.GBIF_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`GBIF request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeMatch(match: GbifSpeciesMatchResponse) {
  return {
    usageKey: match.usageKey ?? null,
    acceptedUsageKey: match.acceptedUsageKey ?? null,
    scientificName: match.scientificName ?? null,
    canonicalName: match.canonicalName ?? null,
    rank: match.rank ?? null,
    status: match.status ?? null,
    confidence: match.confidence ?? null,
    matchType: match.matchType ?? null,
    kingdom: match.kingdom ?? null,
    phylum: match.phylum ?? null,
    className: match.class ?? null,
    order: match.order ?? null,
    family: match.family ?? null,
    genus: match.genus ?? null,
    species: match.species ?? null,
    synonym: match.synonym ?? null,
    note: match.note ?? null,
    issues: match.issues ?? [],
    alternatives: (match.alternatives ?? []).slice(0, 3).map((alternative) => ({
      usageKey: alternative.usageKey ?? null,
      scientificName: alternative.scientificName ?? null,
      rank: alternative.rank ?? null,
      status: alternative.status ?? null,
      confidence: alternative.confidence ?? null,
      matchType: alternative.matchType ?? null,
    })),
  };
}

export const ExternalDataService = {
  async getSpeciesData(species: SpeciesLookupInput): Promise<ExternalSpeciesData | null> {
    try {
      const match = await fetchGbifJson<GbifSpeciesMatchResponse>("/species/match", {
        name: species.scientificName,
        verbose: true,
      });
      const taxonKey = match.usageKey ?? match.acceptedUsageKey;
      const occurrence = taxonKey
        ? await fetchGbifJson<GbifOccurrenceSearchResponse>("/occurrence/search", {
            taxonKey,
            limit: 0,
          })
        : null;

      return {
        provider: "GBIF",
        fetchedAt: new Date().toISOString(),
        data: {
          query: {
            scientificName: species.scientificName,
          },
          match: normalizeMatch(match),
          occurrence: occurrence
            ? {
                totalRecords: occurrence.count ?? 0,
              }
            : null,
          source: {
            apiBaseUrl: env.GBIF_API_BASE_URL,
            speciesMatchEndpoint: "/species/match",
            occurrenceSearchEndpoint: "/occurrence/search",
          },
        },
      };
    } catch {
      return null;
    }
  },
};
