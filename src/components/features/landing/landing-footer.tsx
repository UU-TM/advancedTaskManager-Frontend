"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const PRODUCT = [
  { href: "#features", key: "features" as const },
  { href: "#how-it-works", key: "how" as const },
  { href: "#pricing", key: "pricing" as const },
  { href: "#faq", key: "faq" as const },
];

const COMPANY = [
  { href: "/login", key: "signIn" as const },
  { href: "/register", key: "getStarted" as const },
];

export function LandingFooter() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background px-5 pb-8 pt-6 md:px-8">
      <div className="mx-auto grid max-w-[1152px] gap-10 border-t border-border pt-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={22} height={22} className="size-[22px]" />
            <span className="text-[15px] font-bold">{tCommon("brand")}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">{t("footer.product")}</p>
          <ul className="mt-4 space-y-2.5">
            {PRODUCT.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {t(`nav.${link.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">{t("footer.company")}</p>
          <ul className="mt-4 space-y-2.5">
            {COMPANY.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {t(`footer.links.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1152px] flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <p>
          © {year} {tCommon("brand")}. {t("footer.rights")}
        </p>
        <p>{t("footer.tagline")}</p>
      </div>
    </footer>
  );
}
