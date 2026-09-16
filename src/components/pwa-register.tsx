"use client";

import { useEffect } from "react";

/** Registers the minimal PWA service worker once on the client. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // ignore registration failures (e.g. insecure origin)
    });
  }, []);

  return null;
}
