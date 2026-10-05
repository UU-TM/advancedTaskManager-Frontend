import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Plus_Jakarta_Sans, JetBrains_Mono, Vazirmatn } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";
import { localeDirection, type Locale } from "@/i18n/config";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
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
  const fontVariable = `${plusJakarta.variable} ${vazirmatn.variable} ${jetbrainsMono.variable}`;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={fontVariable}
      style={
        {
          "--font-app-sans":
            locale === "fa"
              ? "var(--font-vazirmatn)"
              : "var(--font-plus-jakarta)",
        } as CSSProperties
      }
    >
      <body className="font-sans antialiased bg-background text-foreground">
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
