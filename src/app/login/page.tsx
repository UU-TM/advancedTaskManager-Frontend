"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  AuthShell,
  GuestOnly,
  LoginForm,
} from "@/components/features/auth";

function LoginContent() {
  const t = useTranslations("auth");

  return (
    <GuestOnly>
      <AuthShell title={t("signInTitle")} description={t("signInDescription")}>
        <LoginForm />
      </AuthShell>
    </GuestOnly>
  );
}

/**
 * Login page
 * ----------------------------------------------------
 * Guest-only. On success, AuthProvider holds the access
 * token in memory and we redirect to `next` (default /boards).
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
