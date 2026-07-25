import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";

/**
 * Authenticated app segment layout — persistent AppShell
 * across /boards and related protected routes.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
