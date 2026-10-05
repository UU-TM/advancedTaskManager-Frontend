"use client";

import { useState, type ReactNode } from "react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/lib/auth/context";

/**
 * Root providers
 * ----------------------------------------------------
 * Bundles all client-side providers in a single
 * boundary so the root layout can stay a Server
 * Component. Order matters: ThemeProvider → QueryClient → Auth.
 */

export function Providers({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (_error, _vars, _ctx, mutation) => {
            if (mutation.options.onError) return;
            toast.error(t("tryAgain"));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry 4xx — they won't fix themselves.
              if (error instanceof Error && "status" in error) {
                const status = (error as { status: number }).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      themes={["light", "dark"]}
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <AuthProvider>{children}</AuthProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
