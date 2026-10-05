"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold">{t("somethingWentWrong")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("tryAgain")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
