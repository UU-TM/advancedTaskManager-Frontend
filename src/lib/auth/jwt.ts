/**
 * Decode a JWT payload without verifying the signature.
 * Used only to read `exp` for proactive refresh scheduling.
 */
export function getJwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: unknown };

    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}
