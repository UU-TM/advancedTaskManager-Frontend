"use server";

import { cookies } from "next/headers";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "./config";

export async function setLocale(locale: string) {
  const next: Locale = isLocale(locale) ? locale : defaultLocale;
  const store = await cookies();
  store.set(localeCookieName, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
