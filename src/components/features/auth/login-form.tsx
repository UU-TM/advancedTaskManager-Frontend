"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import { HOME_ROUTE } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthField } from "./auth-field";

/**
 * Login form — react-hook-form + Zod, wired to `useAuth().login`.
 */
export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? HOME_ROUTE;
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      await login(values.username, values.password);
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>Could not sign in</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <AuthField
        id="username"
        label="Username"
        icon={User}
        type="text"
        autoComplete="username"
        placeholder="yourname"
        error={errors.username?.message}
        {...register("username")}
      />

      <AuthField
        id="password"
        label="Password"
        icon={Lock}
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        trailing={
          <a
            href="#"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Forgot password?
          </a>
        }
        {...register("password")}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="mr-2 size-4" />
            Sign in
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No account yet?{" "}
        <Link href="/register" className="text-foreground underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
