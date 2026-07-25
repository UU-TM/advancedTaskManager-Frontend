"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  AuthShell,
  GuestOnly,
  RegisterForm,
} from "@/components/features/auth";

function RegisterContent() {
  return (
    <GuestOnly>
      <AuthShell
        title="Create account"
        description="Pick a username and password to get started."
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
