import { ExternalDataService } from "../services/external-data.service";

type GbifSmokeData = {
  match?: {
    usageKey?: number | null;
    scientificName?: string | null;
    canonicalName?: string | null;
    rank?: string | null;
    status?: string | null;
    confidence?: number | null;
    matchType?: string | null;
  };
  occurrence?: {
    totalRecords?: number;
  } | null;
};

const scientificName = Bun.argv.slice(2).join(" ").trim() || "Oreochromis niloticus";

const result = await ExternalDataService.getSpeciesData({ scientificName });

if (!result) {
  console.error(`GBIF lookup failed for "${scientificName}".`);
  process.exit(1);
}

const data = result.data as unknown as GbifSmokeData;

console.log(`GBIF lookup for "${scientificName}"`);
console.log(`Provider: ${result.provider}`);
console.log(`Fetched at: ${result.fetchedAt}`);
console.log(`Usage key: ${data.match?.usageKey ?? "not found"}`);
console.log(`Scientific name: ${data.match?.scientificName ?? "not found"}`);
console.log(`Canonical name: ${data.match?.canonicalName ?? "not found"}`);
console.log(`Rank/status: ${data.match?.rank ?? "unknown"} / ${data.match?.status ?? "unknown"}`);
console.log(`Match: ${data.match?.matchType ?? "unknown"} (${data.match?.confidence ?? "unknown"} confidence)`);
console.log(`Occurrence records: ${data.occurrence?.totalRecords ?? "not available"}`);
