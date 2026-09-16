"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import { localeDirection, locales, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function applyDocumentLocale(next: Locale) {
  const dir = localeDirection(next);
  document.documentElement.lang = next;
  document.documentElement.dir = dir;
  document.documentElement.style.setProperty(
    "--font-app-sans",
    next === "fa" ? "var(--font-vazirmatn)" : "var(--font-plus-jakarta)",
  );
  document.body.style.fontFamily =
    next === "fa" ? "var(--font-vazirmatn), Tahoma, sans-serif" : "";
}

/**
 * Language switcher — sets NEXT_LOCALE cookie and soft-refreshes the tree.
 * Avoids window.location.reload() which loops with the server-action refresh.
 */
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();

  async function choose(next: Locale) {
    if (next === locale) return;
    await setLocale(next);
    applyDocumentLocale(next);
    router.refresh();
  }

  const labelFor = (code: Locale) =>
    code === "fa" ? t("persian") : t("english");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("language")}>
          <Languages className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => void choose(code)}
            className={locale === code ? "bg-muted" : ""}
          >
            {labelFor(code)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
