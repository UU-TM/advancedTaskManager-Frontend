"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Centered auth card on the cream background with brand mark + theme toggle.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="items-center text-center">
          <Link
            href="/"
            className="mb-2 flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt=""
              width={48}
              height={48}
              className="size-12"
            />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Kanban
            </span>
          </Link>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
