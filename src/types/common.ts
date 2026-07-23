import { type JSX } from "react";

/**
 * Base structure for an business entity (model).
 */
export interface Entity<TKey = string | number> {
  id: TKey;
}
/**
 * Defines the structure for a column definition in the table.
 */
export interface ColumnDef<T extends Entity = Entity> {
  title: string;
  sortKey: string | null;
  render: (v: T) => string | JSX.Element;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";
}
/**
 * Api Web request and response structures for paged data.
 */
export interface PagedWebRequest {
  pageNumber: number;
  pageSize: number;
  sortColumn?: string;
  isDescending: boolean;
  filter?: string;
}
/**
 * Api Web response structures for paged data.
 */
export interface PagedWebResponse<T extends Entity = Entity> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
