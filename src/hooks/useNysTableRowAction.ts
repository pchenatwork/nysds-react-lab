import { useEffect, type RefObject } from "react";

/**
 * Delegates row-action clicks from inside a `nys-table`.
 *
 * As of @nysds/components@1.19.4 the slotted <table> stays in the light DOM
 * (nys-table enhances it in place rather than cloning it into its shadow root),
 * so clicks bubble straight up through the `<nys-table>` host. One listener on
 * the host catches them all; we route on data-* attributes so cells don't each
 * need their own handler and the routing survives row re-renders.
 *
 * Action elements in any column's cells opt in by setting `data-row-action`
 * (the action name, e.g. "view") and `data-row-id` (the row's identifier).
 *
 * @param tableRef  ref to the `<nys-table>` element (NysTable forwards its ref)
 * @param onAction  called with (action, id) read off the clicked element's data-* attrs
 */
export function useNysTableRowAction(
  tableRef: RefObject<HTMLElement | null>,
  onAction: (action: string, id: string) => void,
): void {
  useEffect(() => {
    const host = tableRef.current;
    if (!host) return;

    const handler = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "[data-row-action]",
      );
      if (!el) return;
      e.preventDefault(); // stop the href="#" jump
      onAction(
        el.getAttribute("data-row-action") ?? "",
        el.getAttribute("data-row-id") ?? "",
      );
    };

    host.addEventListener("click", handler);
    return () => host.removeEventListener("click", handler);
  }, [tableRef, onAction]);
}
