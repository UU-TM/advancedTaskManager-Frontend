"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Lock, User, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  createRegisterSchema,
  type RegisterInput,
} from "@/lib/validators";
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
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tVal = useTranslations("validators");
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(
    () => createRegisterSchema((key) => tVal(key as "passwordMin")),
    [tVal],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(schema),
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
        setServerError(tCommon("tryAgain"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>{t("couldNotCreateAccount")}</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <AuthField
        id="username"
        label={t("username")}
        icon={User}
        type="text"
        autoComplete="username"
        placeholder={t("usernamePlaceholder")}
        error={errors.username?.message}
        {...register("username")}
      />

      <AuthField
        id="password"
        label={t("password")}
        icon={Lock}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <AuthField
        id="confirmPassword"
        label={t("confirmPassword")}
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
            <Loader2 className="me-2 size-4 animate-spin" />
            {t("creatingAccount")}
          </>
        ) : (
          <>
            <UserPlus className="me-2 size-4" />
            {t("createAccount")}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="text-foreground underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
