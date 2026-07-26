"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  AuthShell,
  GuestOnly,
  RegisterForm,
} from "@/components/features/auth";

function RegisterContent() {
  const t = useTranslations("auth");

  return (
    <GuestOnly>
      <AuthShell
        title={t("createAccountTitle")}
        description={t("createAccountDescription")}
      >
        <RegisterForm />
      </AuthShell>
    </GuestOnly>
  );
}

/**
 * Register page
 * ----------------------------------------------------
 * Guest-only. On success, register auto-logs in and we
 * redirect to the post-auth home (/boards).
 */
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
