import { afterEach, describe, expect, mock, test } from "bun:test";

import { ExternalDataService } from "./external-data.service";

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("ExternalDataService", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("busca dados taxonomicos e contagem de ocorrencias no GBIF", async () => {
    const fetchMock = mock(async (input: Parameters<typeof fetch>[0]) => {
      const url = new URL(String(input));

      if (url.pathname.endsWith("/species/match")) {
        expect(url.searchParams.get("name")).toBe("Oreochromis niloticus");
        expect(url.searchParams.get("verbose")).toBe("true");

        return jsonResponse({
          usageKey: 4285690,
          scientificName: "Oreochromis niloticus (Linnaeus, 1758)",
          canonicalName: "Oreochromis niloticus",
          rank: "SPECIES",
          status: "ACCEPTED",
          confidence: 99,
          matchType: "EXACT",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Actinopterygii",
          order: "Cichliformes",
          family: "Cichlidae",
          genus: "Oreochromis",
          species: "Oreochromis niloticus",
          synonym: false,
        });
      }

      if (url.pathname.endsWith("/occurrence/search")) {
        expect(url.searchParams.get("taxonKey")).toBe("4285690");
        expect(url.searchParams.get("limit")).toBe("0");

        return jsonResponse({
          count: 1234,
        });
      }

      throw new Error(`Unexpected GBIF URL: ${url.toString()}`);
    }) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    const result = await ExternalDataService.getSpeciesData({
      scientificName: "Oreochromis niloticus",
    });
    const data = result?.data as {
      match: { usageKey: number; scientificName: string; matchType: string };
      occurrence: { totalRecords: number };
    };

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.provider).toBe("GBIF");
    expect(Number.isNaN(Date.parse(result?.fetchedAt ?? ""))).toBe(false);
    expect(data.match).toMatchObject({
      usageKey: 4285690,
      scientificName: "Oreochromis niloticus (Linnaeus, 1758)",
      matchType: "EXACT",
    });
    expect(data.occurrence.totalRecords).toBe(1234);
  });

  test("retorna null quando a chamada para o GBIF falha", async () => {
    const fetchMock = mock(async () => jsonResponse({ message: "fail" }, 500)) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    const result = await ExternalDataService.getSpeciesData({
      scientificName: "Nome invalido",
    });

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
