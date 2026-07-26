import { format as formatGregorian, isValid as isValidGregorian, parseISO as parseISOGregorian } from "date-fns";
import {
  format as formatJalali,
  isValid as isValidJalali,
  parseISO as parseISOJalali,
} from "date-fns-jalali";
import type { Locale } from "@/i18n/config";

/** Format an ISO datetime for the active UI locale. Returns null if invalid. */
export function formatAppDate(
  iso: string | null | undefined,
  pattern = "yyyy/MM/dd",
  locale: Locale = "en",
): string | null {
  if (!iso) return null;
  if (locale === "fa") {
    const date = parseISOJalali(iso);
    if (!isValidJalali(date)) return null;
    return formatJalali(date, pattern);
  }
  const date = parseISOGregorian(iso);
  if (!isValidGregorian(date)) return null;
  return formatGregorian(date, pattern);
}

/** @deprecated Prefer formatAppDate with locale */
export function formatShamsi(
  iso: string | null | undefined,
  pattern = "yyyy/MM/dd",
): string | null {
  return formatAppDate(iso, pattern, "fa");
}

/** Noon UTC on the selected local calendar day — stable for date-only fields. */
export function dateToDueIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
  ).toISOString();
}
