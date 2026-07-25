/**
 * Shared API types
 * ----------------------------------------------------
 * These mirror the backend envelope and DTO contracts.
 * Adjust the field set as the backend evolves.
 */

/** Backend envelope returned by every API endpoint. */
export interface ApiEnvelope<T> {
  message: string;
  status: number;
  data: T;
}

/** Paginated response shape (used by list endpoints). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Common error payload returned by the backend. */
export interface ApiErrorPayload {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}
