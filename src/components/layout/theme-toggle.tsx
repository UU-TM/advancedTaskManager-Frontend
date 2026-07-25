"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Theme toggle
 * ----------------------------------------------------
 * Switches between the Alucard (light) and Dracula (dark)
 * palettes without a page reload. `next-themes` writes
 * the chosen class on <html>, and our CSS variables in
 * globals.css take care of the rest.
 *
 * Until hydration finishes we render a placeholder icon
 * to avoid mismatched markup between server and client.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Canonical next-themes pattern: detect client mount to avoid
    // hydration mismatch when reading the resolved theme.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Palette className="size-5" />
      </Button>
    );
  }

  const isDracula = theme === "dracula";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {isDracula ? (
            <Moon className="size-5" />
          ) : (
            <Sun className="size-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("alucard")}
          className={theme === "alucard" ? "bg-accent text-accent-foreground" : ""}
        >
          <Sun className="mr-2 size-4" />
          Alucard (light)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dracula")}
          className={theme === "dracula" ? "bg-accent text-accent-foreground" : ""}
        >
          <Moon className="mr-2 size-4" />
          Dracula (dark)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
