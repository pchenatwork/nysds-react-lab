import { useEffect, type RefObject } from "react";

/**
 * Drives the `nys-table` sort-direction arrow from React state.
 *
 * Why this hook exists (verified against @nysds/components@1.19.4):
 * `nys-table` enhances the slotted light-DOM <table> in place — it injects a
 * `nys-button[part='sort-button']` (with a `nys-icon[slot='suffix-icon']` arrow)
 * into each <th>. The arrow is rendered from the component's PRIVATE sort state,
 * which it only updates on a header click whose `nys-column-sort` event is NOT
 * `preventDefault()`ed. A server-side-sorted table must prevent the default (to
 * stop the built-in same-page DOM sort), so the component's own arrow never moves.
 *
 * This hook makes the injected icon a pure function of the React state,
 * replicating the component's own `_updateSortIcons` logic.
 *
 * Couples to two semi-stable markers: `part='sort-button'` and `slot='suffix-icon'`.
 *
 * @param tableRef          ref to the `<nys-table>` element (NysTable forwards its ref)
 * @param activeColumnIndex zero-based index of the sorted column, or -1 when unsorted
 * @param isDescending      current sort direction of the active column
 * @param redrawKey         value that changes when rows change (e.g. the items array);
 *                          forces a re-apply after a sorted page loads
 * @param sortableColumns   optional index-aligned flags; where `false`, the column's
 *                          sort arrow is hidden (nys-table adds one to every header).
 *                          Omit to treat all columns as sortable.
 */
export function useNysTableSortIndicator(
  tableRef: RefObject<HTMLElement | null>,
  activeColumnIndex: number,
  isDescending: boolean,
  redrawKey: unknown,
  sortableColumns?: readonly boolean[],
): void {
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    // The real table stays a light-DOM child of the host (projected through
    // the shadow <slot>, never cloned), so query the host, not the shadow root.
    const table = el.querySelector("table");
    if (!table) return;

    const apply = () => {
      table.querySelectorAll("thead th").forEach((th, index) => {
        const icon = th.querySelector<HTMLElement>(
          "nys-button[part='sort-button'] nys-icon[slot='suffix-icon']",
        );
        if (!icon) return;
        // nys-table adds a sort arrow to every header; hide it where the column
        // isn't sortable. A non-sortable column is never the active column.
        const sortable = sortableColumns
          ? sortableColumns[index] !== false
          : true;
        if (!sortable) {
          icon.style.display = "none";
          th.removeAttribute("aria-sort");
          return;
        }
        icon.style.display = "";
        if (index === activeColumnIndex) {
          icon.setAttribute("name", "straight");
          icon.setAttribute("color", "var(--nys-color-ink, #1b1b1b)");
          icon.style.transform = isDescending
            ? "rotate(180deg)"
            : "rotate(0deg)";
          th.setAttribute(
            "aria-sort",
            isDescending ? "descending" : "ascending",
          );
        } else {
          icon.setAttribute("name", "height");
          icon.setAttribute("color", "var(--nys-color-text-weak, #4a4d4f)");
          icon.style.transform = "";
          th.removeAttribute("aria-sort");
        }
      });
    };

    apply();

    // The component injects the sort buttons asynchronously (custom-element
    // upgrade / slotchange), so the icons may not exist on the first run.
    // Re-apply when they appear. Watch childList only — our own attribute
    // writes above must not re-trigger this observer (and, symmetrically,
    // they don't re-trigger nys-table's own childList/characterData observer).
    const observer = new MutationObserver(apply);
    observer.observe(table, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [tableRef, activeColumnIndex, isDescending, redrawKey, sortableColumns]);
}
