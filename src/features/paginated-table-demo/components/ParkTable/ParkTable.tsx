import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import {
  NysTable,
  NysPagination,
  NysTextinput,
  NysSelect,
  NysOption,
  NysButton,
} from "@nysds/components/react";
import type { PagedWebResponse } from "@/types/common";
import { useNysTableSortIndicator } from "@/hooks/useNysTableSortIndicator";
import { useNysTableRowAction } from "@/hooks/useNysTableRowAction";

import { fetchParks, getCounties } from "./parksApi";
import { PARK_COLUMNS } from "./columns";
import ParkDetailModal from "./ParkDetailModal";
import { type Park, type ParkPagedWebRequest } from "./types";

const PAGE_SIZE = 10;

// Index-aligned with PARK_COLUMNS: which columns can be sorted. Stable module
// constant so it doesn't re-trigger the sort-indicator effect each render.
const SORTABLE_COLUMNS = PARK_COLUMNS.map((col) => Boolean(col.sortKey));

/** Reads the current value off a NYSDS form element's `nys-*` event. */
const valueOf = (e: Event) => (e.target as unknown as { value: string }).value;

/**
 * ParkTable — searches, sorts, and pages NY parks entirely through the mock
 *
 * `PagedWebRequest`/`PagedWebResponse` contract, so it behaves exactly as it
 * would against a real server-paged endpoint.
 */
const ParkTable = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  // Raw text as the user types it — updates on every keystroke but does not
  // itself trigger a fetch. `searchTerm` below is the applied filter.
  const [searchInput, setSearchInput] = useState("");
  // The committed filter term, only updated when the user clicks "Search"
  // (or presses Enter, which submits the form the same way).
  const [searchTerm, setSearchTerm] = useState("");
  // "" means "All counties" — no county filter applied.
  const [countyFilter, setCountyFilter] = useState("");

  const [response, setResponse] = useState<PagedWebResponse<Park> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);

  const tableRef = useRef<HTMLElement>(null);

  // Dropdown options: the distinct counties in the dataset. The underlying
  // data is static for the lifetime of the module, so this only needs to run once.
  const counties = useMemo(() => getCounties(), []);

  useEffect(() => {
    // Guard against out-of-order responses: if the inputs change (or the component unmounts) before the promise resolves, ignore its result.
    let ignore = false;
    setLoading(true);

    const request: ParkPagedWebRequest = {
      pageNumber,
      pageSize: PAGE_SIZE,
      sortColumn,
      isDescending,
      filter: searchTerm.trim() || undefined,
      county: countyFilter || undefined,
    };

    fetchParks(request).then((res) => {
      if (ignore) return;
      setResponse(res);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [pageNumber, sortColumn, isDescending, searchTerm, countyFilter]);

  // Local state only — does not trigger a fetch. The applied filter
  // (`searchTerm`) is only updated on submit (Search button click or Enter).
  const handleSearchInputChange = (e: Event) => {
    setSearchInput(valueOf(e));
  };

  // Commits the typed text as the active filter and returns to page 1 so the
  // user isn't stranded on a now-out-of-range page. Fired by the Search
  // button's onClick and, via native form submission, by pressing Enter in
  // the search box.
  const handleSearchSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setPageNumber(1);
  };

  // Same reasoning as handleSearchSubmit: changing the county composes with the
  // active search term, so it also needs to reset pagination.
  const handleCountyFilter = (e: Event) => {
    setCountyFilter(valueOf(e));
    setPageNumber(1);
  };

  // Force sorting server-side: prevent NysTable's built-in DOM sort (which would only reorder the current page) and update the request instead.
  // Deliver the direction from our own state rather than `detail.sortDirection`: preventing the
  // default freezes NysTable's internal sort tracking, so it always reports "asc".
  const handleColumnSort = (e: Event) => {
    e.preventDefault();
    const { columnIndex } = (e as CustomEvent).detail as {
      columnIndex: number;
    };
    const sortKey = PARK_COLUMNS[columnIndex]?.sortKey;
    if (!sortKey) return; // non-sortable / computed column
    // A new column starts ascending; re-clicking the active column flips direction.
    if (sortColumn !== sortKey) {
      setSortColumn(sortKey);
      setIsDescending(false);
    } else {
      setIsDescending((prev) => !prev);
    }
    setPageNumber(1);
  };

  const items = response?.items ?? [];

  // The "View details" link in each row carries data-* attributes; clicks are
  // delegated from the nys-table host (see useNysTableRowAction).
  const handleRowAction = useCallback((action: string, id: string) => {
    // The modal re-looks-up the full record by id, so we only need the id here.
    if (action === "view") setSelectedParkId(Number(id));
  }, []);

  // Column order matches the <th> order (see PARK_COLUMNS), so the array index
  // is the columnIndex nys-table reports; -1 means nothing is sorted.
  const activeColumnIndex = PARK_COLUMNS.findIndex(
    (col) => col.sortKey && col.sortKey === sortColumn,
  );

  // <NysTable /> can't reflect the server-side sort state, so we drive the shadow-DOM sort arrow directly. See useNysTableSortIndicator for details.
  useNysTableSortIndicator(
    tableRef,
    activeColumnIndex,
    isDescending,
    items,
    SORTABLE_COLUMNS,
  );

  useNysTableRowAction(tableRef, handleRowAction);

  return (
    <>
      <form
        className="nys-display-flex nys-flex-row nys-flex-wrap nys-flex-align-end nys-flex-gap-200"
        onSubmit={handleSearchSubmit}
      >
        <NysSelect
          id="park-county-filter"
          name="parkCounty"
          label="Filter by county"
          width="md"
          value={countyFilter}
          onNysChange={handleCountyFilter}
        >
          <NysOption value="" label="All counties" />
          {counties.map((county) => (
            <NysOption key={county} value={county} label={county} />
          ))}
        </NysSelect>
        <NysTextinput
          id="park-search2"
          name="parkSearch2"
          type="search"
          label="Search parks"
          placeholder="Search park by name, county, or region"
          width="lg"
          value={searchInput}
          onNysInput={handleSearchInputChange}
        >
          {/* NYSDS "Suffix Button" pattern: the search button lives in the
              input's endButton slot, so it is always flush with the field. */}
          <NysButton
            slot="endButton"
            type="submit"
            ariaLabel="Search"
            prefixIcon="search"
          />
        </NysTextinput>
      </form>
      <p aria-live="polite">
        {loading
          ? "Loading…"
          : `${response?.totalCount ?? 0} park${
              (response?.totalCount ?? 0) === 1 ? "" : "s"
            } found`}
      </p>

      <NysTable
        ref={tableRef}
        striped
        bordered
        sortable
        onNysColumnSort={handleColumnSort}
      >
        <table>
          <caption>New York State Parks</caption>
          <thead>
            <tr>
              {PARK_COLUMNS.map((col) => (
                <th
                  key={col.title}
                  scope="col"
                  // aria-sort is managed by useNysTableSortIndicator (setting
                  // it here would fight the hook's writes).
                  style={{
                    width: col.width,
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                  }}
                  align={col.align}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={PARK_COLUMNS.length}>
                  {loading ? "Loading…" : "No parks match your filters."}
                </td>
              </tr>
            ) : (
              items.map((park) => (
                <tr key={park.id}>
                  {PARK_COLUMNS.map((col) => (
                    <td key={col.title} align={col.align}>
                      {col.render(park)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </NysTable>

      {response && response.totalPages > 1 && (
        <>
          <br />
          <NysPagination
            currentPage={response.pageNumber}
            totalPages={response.totalPages}
            onNysChange={(e: Event) =>
              setPageNumber((e as CustomEvent).detail.page)
            }
          />
        </>
      )}
      <br />

      <ParkDetailModal
        parkId={selectedParkId}
        onClose={() => setSelectedParkId(null)}
      />
    </>
  );
};

export default ParkTable;
