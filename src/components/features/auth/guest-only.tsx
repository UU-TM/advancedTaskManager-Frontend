"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";

interface GuestOnlyProps {
  children: ReactNode;
}

/**
 * Renders children only for unauthenticated users.
 * Authenticated visitors are redirected to `?next=` or the post-auth home.
 */
export function GuestOnly({ children }: GuestOnlyProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? HOME_ROUTE;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, isLoading, next, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
