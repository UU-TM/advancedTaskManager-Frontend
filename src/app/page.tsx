"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  KeyRound,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HIGHLIGHTS = [
  {
    icon: Palette,
    title: "Alucard × Dracula",
    description:
      "Two official palettes mapped to CSS variables and switched live with next-themes — no reload.",
  },
  {
    icon: Layers,
    title: "Typed API client",
    description:
      "Fetch wrapper unwraps the backend envelope, surfaces typed ApiError, and auto-refreshes on 401.",
  },
  {
    icon: ShieldCheck,
    title: "Auth infra ready",
    description:
      "Access token in memory, refresh token in an httpOnly cookie, edge middleware for protected routes.",
  },
  {
    icon: Boxes,
    title: "shadcn/ui primitives",
    description:
      "Button, Input, Card, Badge, Avatar, Dialog, Progress, Skeleton — all restyled with our tokens.",
  },
];

const STACK = [
  { label: "Next.js 16", href: "https://nextjs.org" },
  { label: "TypeScript strict", href: "https://www.typescriptlang.org" },
  { label: "Tailwind CSS 4", href: "https://tailwindcss.com" },
  { label: "shadcn/ui", href: "https://ui.shadcn.com" },
  { label: "TanStack Query", href: "https://tanstack.com/query" },
  { label: "react-hook-form + Zod", href: "https://react-hook-form.com" },
  { label: "next-themes", href: "https://github.com/pacocoursey/next-themes" },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
        {/* Hero */}
        <div className="mb-14 max-w-3xl space-y-5">
          <Badge
            variant="outline"
            className="bg-card text-foreground/80 border-border"
          >
            <Sparkles className="mr-1 size-3" />
            Frontend scaffold · v0.1
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Kanban, dressed in{" "}
            <span className="text-primary">Alucard</span> and{" "}
            <span className="text-secondary">Dracula</span>.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            A scalable Next.js App Router foundation with a typed API client,
            theme-aware design tokens, and auth infrastructure — ready for the
            team to build boards, cards, and workspaces on top of.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/dev/components">
                Explore components
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">
                <KeyRound className="mr-2 size-4" />
                Sign in
              </Link>
            </Button>
          </div>
          <p className="pt-1 text-xs text-muted-foreground">
            Tip: use the palette icon in the top-right to switch themes.
          </p>
        </div>

        {/* Highlights */}
        <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Stack + layout summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Type className="size-4" /> Stack & conventions
              </CardTitle>
              <CardDescription>
                Defaults agreed by the team. Stick to these unless there&apos;s
                a reason not to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {STACK.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between rounded-md border bg-card/40 px-3 py-2"
                  >
                    <span>{s.label}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project layout</CardTitle>
              <CardDescription>One glance at the structure.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 text-[11px] leading-5 text-muted-foreground">
{`src/
  app/            # routes (thin)
  components/
    ui/           # shadcn primitives
    layout/       # AppShell, Sidebar, Header
    features/     # auth, boards, kanban
  lib/
    api/          # client + modules
    auth/         # context, storage, config
    validators/   # Zod schemas
  hooks/
  types/
  middleware.ts`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
