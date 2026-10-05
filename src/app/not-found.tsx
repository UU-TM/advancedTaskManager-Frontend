import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold">{t("somethingWentWrong")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("tryAgain")}</p>
      <Button asChild>
        <Link href="/home">{t("open")}</Link>
      </Button>
    </div>
  );
}
