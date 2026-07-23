import { nysIconUrl } from "@/registerNysdsIcons";
import type { ColumnDef } from "@/types/common";
import { type Park } from "./types";

/**
 * Column definitions for the ParkTable.
 *
 * `sortKey` is the `Park` field name fed straight into `PagedWebRequest.sortColumn`
 * (server-side sort), or `null` for a non-sortable / computed column. Column order
 * here must match the `<th>` order in the table, since `onNysColumnSort` reports a
 * zero-based `columnIndex` that we look up in this array.
 */
export const PARK_COLUMNS: ColumnDef<Park>[] = [
  {
    title: "Park Name",
    sortKey: "parkName",
    minWidth: 400,
    render: (p) => p.parkName,
  },
  { title: "Region", sortKey: "region", render: (p) => p.region, width: 245 },
  { title: "County", sortKey: "county", render: (p) => p.county },
  { title: "Type", sortKey: "parkType", render: (p) => p.parkType, width: 170 },
  { title: "Rating", sortKey: "rating", render: (p) => p.rating.toFixed(1) },
  {
    title: "Actions",
    sortKey: null,
    render: (p) => (
      // The click is delegated from the nys-table host element; see
      // useNysTableRowAction() for the routing on these data-* attributes.
      <a
        href="#"
        data-row-action="view"
        data-row-id={p.id}
        aria-label={`View ${p.parkName}`}
        title={`View details - ${p.parkName}`}
      >
        <img src={nysIconUrl("visibility")} alt="View" width={20} height={20} />
      </a>
    ),
  },
];
