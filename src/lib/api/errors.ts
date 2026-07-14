import type { ApiErrorPayload } from "@/types/api";

/**
 * ApiError
 * ----------------------------------------------------
 * A single typed error class that wraps any non-2xx
 * response from the backend. Consumers can switch on
 * `status` to handle different failure modes
 * (401 → refresh / redirect, 403 → toast, 422 → form, …).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;
  readonly raw: unknown;

  constructor(payload: ApiErrorPayload, raw?: unknown) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
    this.raw = raw;
  }

  /** True for any 401 response (token expired or missing). */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True for any 403 response (authenticated but forbidden). */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True for any 4xx validation error. */
  get isValidation(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** Convert to a plain object for logging / telemetry. */
  toJSON(): ApiErrorPayload & { raw?: unknown } {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      raw: this.raw,
    };
  }
}

/** Sentinel thrown when the refresh-token attempt also failed. */
export class SessionExpiredError extends ApiError {
  constructor(message = "Session expired — please sign in again.") {
    super({ message, status: 401, code: "SESSION_EXPIRED" });
    this.name = "SessionExpiredError";
  }
}
