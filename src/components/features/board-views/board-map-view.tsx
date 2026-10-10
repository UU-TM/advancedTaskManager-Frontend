"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ExternalLink, MapPin, MapPinPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCard } from "@/hooks/use-card";
import { cn } from "@/lib/utils";
import type { BoardColumn, Card } from "@/types/domain";
import type { MapPoint } from "./board-map-canvas";

const BoardMapCanvas = dynamic(() => import("./board-map-canvas"), {
  ssr: false,
  loading: () => <Skeleton className="size-full min-h-64 rounded-lg" />,
});

type BoardMapViewProps = {
  columns: BoardColumn[];
  onOpenCard: (cardId: string) => void;
};

function hasLocation(card: Card): card is Card & {
  locationLat: number;
  locationLng: number;
} {
  return (
    typeof card.locationLat === "number" && typeof card.locationLng === "number"
  );
}

export function BoardMapView({ columns, onOpenCard }: BoardMapViewProps) {
  const t = useTranslations("boardViews");
  const updateCard = useUpdateCard();

  const allCards = useMemo(
    () => columns.flatMap((c) => (c.cards ?? []).filter((card) => !card.archivedAt)),
    [columns],
  );
  const located = useMemo(() => allCards.filter(hasLocation), [allCards]);
  const unlocated = useMemo(
    () => allCards.filter((c) => !hasLocation(c)),
    [allCards],
  );
  const points: MapPoint[] = useMemo(
    () =>
      located.map((c) => ({
        id: c.id,
        title: c.title,
        lat: c.locationLat,
        lng: c.locationLng,
      })),
    [located],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [cardId, setCardId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [placeName, setPlaceName] = useState("");

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const draftValid =
    lat !== "" &&
    lng !== "" &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180;

  function saveLocation() {
    if (!cardId || !draftValid) {
      toast.error(t("mapInvalid"));
      return;
    }
    updateCard.mutate(
      {
        id: cardId,
        input: {
          locationLat: latNum,
          locationLng: lngNum,
          locationName: placeName.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("mapSaved"));
          setSelectedId(cardId);
          setAdding(false);
          setCardId("");
          setLat("");
          setLng("");
          setPlaceName("");
        },
        onError: () => toast.error(t("mapSaveFailed")),
      },
    );
  }

  const showAddPanel = adding;

  return (
    <div className="flex h-full flex-col gap-3 p-4 md:flex-row md:p-6" dir="ltr">
      <div className="min-h-72 flex-1">
        {points.length === 0 && !adding ? (
          <div className="flex size-full items-center justify-center rounded-lg">
            <EmptyState
              icon={MapPin}
              title={t("mapEmptyTitle")}
              description={t("mapEmptyBody")}
              action={
                unlocated.length > 0 ? (
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setAdding(true)}
                  >
                    <MapPinPlus className="me-1.5 size-4" />
                    {t("mapAddLocation")}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <BoardMapCanvas
            points={points}
            selectedId={selectedId}
            draft={draftValid ? { lat: latNum, lng: lngNum } : null}
            pickEnabled={adding}
            onSelect={(id) => {
              setSelectedId(id);
            }}
            onPick={(la, ln) => {
              setLat(String(la));
              setLng(String(ln));
            }}
          />
        )}
      </div>

      <aside
        className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto md:w-72"
        style={{ maxHeight: "100%" }}
      >
        <section
          className="rounded-lg border border-border bg-card p-3"
          style={{ boxShadow: "var(--kanban-list-shadow)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {t("mapLocated", { count: located.length })}
            </h3>
            {unlocated.length > 0 && (
              <Button
                size="sm"
                variant={adding ? "secondary" : "outline"}
                className="h-7 cursor-pointer px-2 text-xs"
                onClick={() => setAdding((v) => !v)}
              >
                <MapPinPlus className="me-1 size-3.5" />
                {t("mapAddLocation")}
              </Button>
            )}
          </div>
          {located.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("mapNoneYet")}</p>
          ) : (
            <ul className="space-y-1">
              {located.map((c) => (
                <li key={c.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                      selectedId === c.id && "bg-primary/10",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer text-start"
                      onClick={() => setSelectedId(c.id)}
                      onDoubleClick={() => onOpenCard(c.id)}
                    >
                      <span className="block truncate">{c.title}</span>
                      {c.locationName && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.locationName}
                        </span>
                      )}
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 cursor-pointer px-2 text-xs"
                      onClick={() => onOpenCard(c.id)}
                    >
                      {t("mapOpen")}
                    </Button>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${c.locationLat}&mlon=${c.locationLng}#map=15/${c.locationLat}/${c.locationLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={t("mapOpenInMaps")}
                      title={t("mapOpenInMaps")}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {showAddPanel && unlocated.length > 0 && (
          <section
            className="space-y-2 rounded-lg border border-border bg-card p-3"
            style={{ boxShadow: "var(--kanban-list-shadow)" }}
          >
            <h3 className="text-sm font-semibold">{t("mapAddLocation")}</h3>
            <p className="text-xs text-muted-foreground">{t("mapPickHint")}</p>
            <div className="space-y-1.5">
              <Label>{t("mapCard")}</Label>
              <Select value={cardId || undefined} onValueChange={setCardId}>
                <SelectTrigger className="h-8 w-full cursor-pointer">
                  <SelectValue placeholder={t("mapPickCard")} />
                </SelectTrigger>
                <SelectContent>
                  {unlocated.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>{t("mapLat")}</Label>
                <Input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  inputMode="decimal"
                  className="h-8"
                  placeholder="35.6892"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("mapLng")}</Label>
                <Input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  inputMode="decimal"
                  className="h-8"
                  placeholder="51.3890"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("mapPlaceName")}</Label>
              <Input
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="h-8"
                maxLength={500}
              />
            </div>
            <Button
              size="sm"
              className="w-full cursor-pointer"
              disabled={updateCard.isPending || !cardId || !draftValid}
              onClick={saveLocation}
            >
              {t("mapSave")}
            </Button>
          </section>
        )}
      </aside>
    </div>
  );
}
