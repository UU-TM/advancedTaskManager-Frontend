"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const FOOTER_LINKS = {
  product: [
    { href: "#features", key: "features" },
    { href: "#solutions", key: "solutions" },
    { href: "#integrations", key: "integrations" },
    { href: "#pricing", key: "pricing" },
  ],
  company: [
    { href: "#faq", key: "faq" },
    { href: "/login", key: "signIn" },
    { href: "/register", key: "getStarted" },
  ],
} as const;

export function LandingFooter() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30 px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={28} height={28} className="size-7" />
            <span className="text-base font-semibold tracking-tight">
              {tCommon("brand")}
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">{t("footer.product")}</p>
          <ul className="mt-3 space-y-2">
            {FOOTER_LINKS.product.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(`nav.${link.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">{t("footer.company")}</p>
          <ul className="mt-3 space-y-2">
            {FOOTER_LINKS.company.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(`footer.links.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {year} {tCommon("brand")}. {t("footer.rights")}
        </p>
        <div className="flex gap-4">
          <span>{t("footer.privacy")}</span>
          <span>{t("footer.terms")}</span>
        </div>
      </div>
    </footer>
  );
}
