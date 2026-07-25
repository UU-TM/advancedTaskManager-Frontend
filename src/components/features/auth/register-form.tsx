"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, User, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { ApiError } from "@/lib/api";
import { HOME_ROUTE } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthField } from "./auth-field";

/**
 * Register form — react-hook-form + Zod, wired to `useAuth().register`.
 * On success the session is established (register → auto-login) and we
 * redirect to the post-auth home.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      await registerUser(values.username, values.password);
      router.replace(HOME_ROUTE);
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
          <AlertTitle>Could not create account</AlertTitle>
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
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <AuthField
        id="confirmPassword"
        label="Confirm password"
        icon={Lock}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            <UserPlus className="mr-2 size-4" />
            Create account
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
