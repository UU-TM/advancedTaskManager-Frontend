import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";

/**
 * Authenticated app segment layout — persistent AppShell
 * across /home, /boards, /templates, /integrations, and related routes.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
