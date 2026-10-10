import type { Metadata } from "next";
import type { CSSProperties } from "react";
import localFont from "next/font/local";
import { Source_Sans_3, JetBrains_Mono, Vazirmatn, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";
import { localeDirection, type Locale } from "@/i18n/config";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interVar = localFont({
  src: "../fonts/inter-variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const openRunde = localFont({
  src: [
    { path: "../fonts/open-runde-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/open-runde-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-open-runde",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("title"),
    description: t("description"),
    keywords: ["Kanban", "task manager", "boards", "productivity"],
    authors: [{ name: "Frontend Team" }],
    icons: {
      icon: "/logo.svg",
      apple: "/icons/icon-192.png",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: t("title"),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const dir = localeDirection(locale);
  const fontVariable = `${sourceSans.variable} ${vazirmatn.variable} ${jetbrainsMono.variable} ${plusJakarta.variable} ${interVar.variable} ${openRunde.variable}`;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={fontVariable}
      style={
        {
          "--font-app-sans":
            locale === "fa" ? "var(--font-vazirmatn)" : "var(--font-inter)",
          "--font-app-display":
            locale === "fa"
              ? "var(--font-vazirmatn)"
              : "var(--font-open-runde)",
        } as CSSProperties
      }
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-foreground"
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <SonnerToaster
              richColors
              closeButton
              dir={dir}
              position={dir === "rtl" ? "top-left" : "top-right"}
            />
            <PwaRegister />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
