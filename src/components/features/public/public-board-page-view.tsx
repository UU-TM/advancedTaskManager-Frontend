"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Trello } from "lucide-react";
import { shareLinksApi, type PublicBoardSnapshot } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

function BoardColumns({ board }: { board: PublicBoardSnapshot }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {board.columns.map((col) => (
        <div
          key={col.id}
          className="w-72 shrink-0 rounded-md border border-border bg-muted/30 p-3"
        >
          <h2 className="mb-3 px-1 text-sm font-semibold">{col.title}</h2>
          <ul className="space-y-2">
            {col.cards.map((card) => (
              <li
                key={card.id}
                className="rounded-lg border border-border bg-card p-3 text-sm shadow-sm"
                style={
                  card.coverColor
                    ? { borderTop: `3px solid ${card.coverColor}` }
                    : undefined
                }
              >
                <p className="font-medium">{card.title}</p>
                {card.labels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {card.labels.map((l) => (
                      <Badge
                        key={l.id}
                        variant="secondary"
                        className="text-[10px]"
                        style={{ backgroundColor: `${l.color}33` }}
                      >
                        {l.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PublicBoardPageView({ embed = false }: { embed?: boolean }) {
  const t = useTranslations("publicBoard");
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [password, setPassword] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState<string | undefined>();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["public-board", token, submittedPassword ?? "", embed] as const,
    queryFn: () =>
      embed
        ? import("@/lib/api").then((m) => m.embedApi.getBoard(token))
        : shareLinksApi.getPublic(token, submittedPassword),
    enabled: !!token,
    retry: false,
  });

  const needsPassword =
    isError &&
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status: number }).status === 401;

  return (
    <div className={embed ? "min-h-screen bg-background p-3" : "mx-auto max-w-6xl px-4 py-8"}>
      {isLoading && <Skeleton className="h-64 w-full rounded-md" />}

      {needsPassword && (
        <form
          className="mx-auto max-w-sm space-y-3 rounded-md border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedPassword(password);
            void refetch();
          }}
        >
          <h1 className="font-semibold">{t("passwordTitle")}</h1>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
          />
          <Button type="submit" className="w-full cursor-pointer" disabled={isFetching}>
            {t("unlock")}
          </Button>
        </form>
      )}

      {isError && !needsPassword && (
        <EmptyState
          icon={Trello}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {data && (
        <div className="space-y-4">
          {!embed && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("readOnly")}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            </div>
          )}
          {embed && (
            <h1 className="truncate text-sm font-semibold">{data.name}</h1>
          )}
          <BoardColumns board={data} />
        </div>
      )}
    </div>
  );
}
