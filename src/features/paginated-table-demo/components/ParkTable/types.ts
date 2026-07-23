import { type Entity, type PagedWebRequest } from "@/types/common";

/**
 * A New York State park record, as served by the mock parks API.
 * Extends {@link Entity} so it satisfies the `T extends Entity` constraint on
 * `PagedWebResponse<T>` and `ColumnDef<T>`.
 */
/**
 * A paged request for park data. Extends the generic {@link PagedWebRequest}
 * (paging, sorting, free-text `filter`) with the ParkTable-specific filters the
 * parks endpoint understands. Keeps domain params off the shared contract while
 * still flowing through the same `fetchParks` call.
 */
export interface ParkPagedWebRequest extends PagedWebRequest {
  /** Exact-match filter on {@link Park.county}; omit/empty for all counties. */
  county?: string;
}

export interface Park extends Entity<number> {
  parkCode: string;
  parkName: string;
  region: string;
  county: string;
  parkType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  latitude: number;
  longitude: number;
  acreage: number;
  established: number;
  annualVisitors: number;
  admissionFee: number;
  openYearRound: boolean;
  hours: string;
  phone: string;
  website: string;
  activities: string[];
  amenities: string[];
  petFriendly: boolean;
  parkingSpaces: number;
  campSites: number;
  trailsMiles: number;
  rating: number;
  featured: boolean;
}
