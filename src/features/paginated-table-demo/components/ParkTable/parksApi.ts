import type { PagedWebResponse } from "@/types/common";
import parksData from "./nys-parks.json";
import { type Park, type ParkPagedWebRequest } from "./types";

/**
 * Mock paged "web API" for NY parks.
 *
 * `nys-parks.json` stands in for a database; `fetchParks` behaves like a real
 * server endpoint: it accepts a `PagedWebRequest` and returns a
 * `PagedWebResponse<Park>` after a simulated network delay, applying filtering,
 * searching, sorting, and paging *server-side*.
 */

const PARKS = parksData as Park[];

// Simulated network latency (ms) so the UI exercises real loading states.
const LATENCY_MS = 300;

/**
 * `PagedWebRequest.filter` is a single free-text string. A park matches when the
 * (trimmed, case-insensitive) query is a substring of its name, code, county, or
 * region — so searching a region name still narrows the list.
 */
function applyFilter(parks: Park[], filter?: string): Park[] {
  const needle = filter?.trim().toLowerCase();
  if (!needle) return parks;
  return parks.filter((p) => {
    const haystack =
      `${p.parkName} ${p.parkCode} ${p.county} ${p.region}`.toLowerCase();
    return haystack.includes(needle);
  });
}

/**
 * Exact-match filter on `Park.county`. Kept separate from `applyFilter`
 * (free-text substring search) since the county dropdown's options are the
 * literal values present in the data — an exact match, not a substring one.
 */
function applyCountyFilter(parks: Park[], county?: string): Park[] {
  if (!county) return parks;
  return parks.filter((p) => p.county === county);
}

function applySort(
  parks: Park[],
  sortColumn: string | undefined,
  isDescending: boolean,
): Park[] {
  if (!sortColumn) return parks;
  const dir = isDescending ? -1 : 1;
  // Copy before sorting so the module-level PARKS array is never mutated.
  return [...parks].sort((a, b) => {
    const av = a[sortColumn as keyof Park];
    const bv = b[sortColumn as keyof Park];
    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv));
    }
    // Stable tiebreak by id so equal keys keep a deterministic order.
    return (cmp !== 0 ? cmp : a.id - b.id) * dir;
  });
}

/**
 * Fetch one page of parks. Mirrors a server that filters → sorts → pages,
 * resolving asynchronously after a simulated delay.
 *
 * `request.county`, when provided, narrows the result to an exact `Park.county`
 * match (e.g. from a county filter dropdown) and composes with `request.filter`
 * — both are applied before sorting/paging, same as a real server-side query
 * with two independent filter params would.
 */
export function fetchParks(
  request: ParkPagedWebRequest,
): Promise<PagedWebResponse<Park>> {
  const { pageNumber, pageSize, sortColumn, isDescending, filter, county } =
    request;

  const textFiltered = applyFilter(PARKS, filter);
  const filtered = applyCountyFilter(textFiltered, county);
  const sorted = applySort(filtered, sortColumn, isDescending);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (clampedPage - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  const response: PagedWebResponse<Park> = {
    items,
    totalCount,
    pageNumber: clampedPage,
    pageSize,
    totalPages,
  };

  return new Promise((resolve) =>
    setTimeout(() => resolve(response), LATENCY_MS),
  );
}

/**
 * Distinct `Park.county` values present in the dataset, sorted alphabetically.
 * Powers the county filter dropdown's options. Synchronous (no simulated
 * latency) since it's just deriving values already held in memory, not a
 * fetch of its own.
 */
export function getCounties(): string[] {
  return Array.from(new Set(PARKS.map((p) => p.county))).sort((a, b) =>
    a.localeCompare(b),
  );
}

/**
 * Fetch a single park by id. Mirrors the mock server's async contract so a
 * detail view re-fetches the record by id rather than reusing list payload.
 */
export function fetchParkById(id: number): Promise<Park | undefined> {
  const park = PARKS.find((p) => p.id === id);
  return new Promise((resolve) => setTimeout(() => resolve(park), LATENCY_MS));
}
