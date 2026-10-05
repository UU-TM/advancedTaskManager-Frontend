"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Moon,
  Package,
  Plug,
  Rocket,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trello,
  Users,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "@/hooks/use-activity-stats";
import { useNlSearch } from "@/hooks/use-ai";
import { LOGIN_ROUTE } from "@/lib/auth/config";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const NAV_ITEMS = [
  { href: "/home", icon: Home, labelKey: "home" as const },
  { href: "/my-work", icon: Inbox, labelKey: "myWork" as const },
  { href: "/inbox", icon: Bell, labelKey: "inbox" as const },
  { href: "/boards", icon: Trello, labelKey: "myBoards" as const },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics" as const },
  { href: "/workload", icon: Users, labelKey: "workload" as const },
  { href: "/sprints", icon: Rocket, labelKey: "sprints" as const },
  { href: "/goals", icon: Target, labelKey: "goals" as const },
  { href: "/portfolio", icon: LayoutDashboard, labelKey: "portfolio" as const },
  { href: "/forms", icon: ClipboardList, labelKey: "forms" as const },
  { href: "/templates", icon: LayoutTemplate, labelKey: "templates" as const },
  { href: "/marketplace", icon: Package, labelKey: "marketplace" as const },
  { href: "/billing", icon: CreditCard, labelKey: "billing" as const },
  { href: "/integrations", icon: Plug, labelKey: "integrations" as const },
  { href: "/workspace", icon: LayoutDashboard, labelKey: "workspace" as const },
  { href: "/invitations", icon: Bell, labelKey: "invitations" as const },
  { href: "/settings", icon: Settings, labelKey: "settings" as const },
];

const CommandPaletteContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  shortcutLabel: string;
} | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider",
    );
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAi = useTranslations("ai");
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const isNl = q.trim().startsWith("?");
  const nlQuery = isNl ? q.trim().slice(1).trim() : "";
  const { data, isFetching } = useSearch(
    q,
    open && q.trim().length > 0 && !isNl,
  );
  const nlSearch = useNlSearch();

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || !isNl || nlQuery.length < 2) return;
    const handle = window.setTimeout(() => {
      nlSearch.mutate(nlQuery);
    }, 350);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on query change
  }, [open, isNl, nlQuery]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push(LOGIN_ROUTE);
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setOpen(false);
  }

  const [shortcutLabel, setShortcutLabel] = useState("Ctrl+K");
  useEffect(() => {
    const platform = navigator.platform ?? "";
    setShortcutLabel(/Mac|iPhone|iPad/.test(platform) ? "⌘K" : "Ctrl+K");
  }, []);
  const nlCards = nlSearch.data?.cards ?? [];

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, shortcutLabel }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQ("");
        }}
        title={t("search")}
        description={t("searchPlaceholder")}
      >
        <CommandInput
          placeholder={t("searchPlaceholderNl")}
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          <CommandEmpty>
            {isFetching || (isNl && nlSearch.isPending) ? (
              <div className="space-y-2 px-2 py-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : q.trim() ? (
              t("searchEmpty")
            ) : (
              t("commandHint")
            )}
          </CommandEmpty>

          <CommandGroup heading={t("commandNavigation")}>
              {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => (
                <CommandItem
                  key={href}
                  value={`${t(labelKey)} ${labelKey}`}
                  onSelect={() => go(href)}
                >
                  <Icon className="size-4" />
                  {t(labelKey)}
                </CommandItem>
              ))}
            </CommandGroup>

          {isNl && nlQuery && (
            <CommandGroup heading={tAi("nlResults")}>
              {nlCards.map((card) => (
                <CommandItem
                  key={card.id}
                  value={`nl-${card.title}`}
                  onSelect={() =>
                    go(`/boards/${card.boardId}?card=${card.id}`)
                  }
                >
                  <Sparkles className="size-4" />
                  <span className="truncate">{card.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {card.boardName}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {q.trim() && !isNl && (
            <>
              {data && data.boards.length > 0 && (
                <CommandGroup heading={t("searchBoards")}>
                  {data.boards.map((board) => (
                    <CommandItem
                      key={board.id}
                      value={`board-${board.name}`}
                      onSelect={() => go(`/boards/${board.id}`)}
                    >
                      <Trello className="size-4" />
                      {board.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {data && data.cards.length > 0 && (
                <CommandGroup heading={t("searchCards")}>
                  {data.cards.map((card) => (
                    <CommandItem
                      key={card.id}
                      value={`card-${card.title}`}
                      onSelect={() =>
                        go(`/boards/${card.boardId}?card=${card.id}`)
                      }
                    >
                      <span className="truncate">{card.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {card.boardName}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}

          {!q.trim() && isAuthenticated && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("commandActions")}>
                <CommandItem onSelect={toggleTheme}>
                  {resolvedTheme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  {tCommon("toggleTheme")}
                </CommandItem>
                <CommandItem
                  onSelect={() => void handleLogout()}
                  className="text-destructive"
                >
                  <LogOut className="size-4" />
                  {t("signOut")}
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}

export function CommandPaletteTrigger({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const { setOpen, shortcutLabel } = useCommandPalette();
  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(true)}
      aria-label="Open command palette"
    >
      {children}
      <CommandShortcut className="hidden md:inline">{shortcutLabel}</CommandShortcut>
    </button>
  );
}
