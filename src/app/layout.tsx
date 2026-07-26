import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Plus_Jakarta_Sans, JetBrains_Mono, Vazirmatn } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { localeDirection, type Locale } from "@/i18n/config";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
  const fontVariable = `${plusJakarta.variable} ${vazirmatn.variable} ${jetbrainsMono.variable}`;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      style={
        {
          "--font-sans":
            locale === "fa"
              ? "var(--font-vazirmatn)"
              : "var(--font-plus-jakarta)",
        } as CSSProperties
      }
    >
      <body
        className={`${fontVariable} font-sans antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <Toaster />
            <SonnerToaster richColors closeButton />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
