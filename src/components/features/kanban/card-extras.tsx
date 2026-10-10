"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShamsiDatePicker } from "@/components/ui/shamsi-date-picker";
import {
  useBoardCustomFields,
  useCardCustomFieldValues,
  useSetCardCustomFieldValue,
} from "@/hooks/use-custom-fields";
import {
  useCardStickerMutations,
  useCardStickers,
  useStickerPacks,
} from "@/hooks/use-stickers";
import { useUpdateCard } from "@/hooks/use-card";
import { cn } from "@/lib/utils";
import type { Card, CustomFieldDef } from "@/types/domain";

const NONE = "__none__";

/* ------------------------------------------------------------------ */
/* Custom fields                                                       */
/* ------------------------------------------------------------------ */

function CustomFieldEditor({
  def,
  value,
  disabled,
  onSave,
}: {
  def: CustomFieldDef;
  value: unknown;
  disabled?: boolean;
  onSave: (value: unknown) => void;
}) {
  const t = useTranslations("card");

  switch (def.type) {
    case "CHECKBOX":
      return (
        <Checkbox
          checked={value === true}
          disabled={disabled}
          onCheckedChange={(checked) => onSave(checked === true)}
          aria-label={def.name}
        />
      );
    case "DATE":
      return (
        <ShamsiDatePicker
          value={typeof value === "string" ? value : null}
          disabled={disabled}
          onChange={(iso) => onSave(iso)}
        />
      );
    case "LIST":
      return (
        <Select
          value={typeof value === "string" ? value : NONE}
          disabled={disabled}
          onValueChange={(v) => onSave(v === NONE ? null : v)}
        >
          <SelectTrigger className="h-8 w-full cursor-pointer">
            <SelectValue placeholder={t("customFieldPick")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>{t("customFieldNone")}</SelectItem>
            {(def.options ?? []).map((opt) => (
              <SelectItem key={opt.id ?? opt.label} value={opt.id ?? opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "NUMBER":
      return (
        <Input
          type="number"
          className="h-8"
          disabled={disabled}
          defaultValue={typeof value === "number" ? value : ""}
          key={`n-${def.id}-${String(value ?? "")}`}
          onBlur={(e) => {
            const raw = e.target.value.trim();
            const next = raw === "" ? null : Number(raw);
            if (next !== null && !Number.isFinite(next)) return;
            if (next === (typeof value === "number" ? value : null)) return;
            onSave(next);
          }}
        />
      );
    case "TEXT":
    default:
      return (
        <Input
          className="h-8"
          disabled={disabled}
          defaultValue={typeof value === "string" ? value : ""}
          key={`t-${def.id}-${String(value ?? "")}`}
          onBlur={(e) => {
            const next = e.target.value.trim();
            if (next === (typeof value === "string" ? value : "")) return;
            onSave(next === "" ? null : next);
          }}
        />
      );
  }
}

export function CardCustomFields({
  cardId,
  boardId,
  card,
}: {
  cardId: string;
  boardId: string;
  card?: Card;
}) {
  const t = useTranslations("card");
  const { data: defs = [] } = useBoardCustomFields(boardId);
  const { data: fetchedValues } = useCardCustomFieldValues(cardId);
  const setValue = useSetCardCustomFieldValue(cardId);

  const valueByField = useMemo(() => {
    const map = new Map<string, unknown>();
    for (const v of card?.customFieldValues ?? []) map.set(v.fieldId, v.value);
    for (const v of fetchedValues ?? []) map.set(v.fieldId, v.value);
    return map;
  }, [card?.customFieldValues, fetchedValues]);

  if (defs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noCustomFields")}</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {defs.map((def) => (
        <div key={def.id} className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{def.name}</Label>
          <CustomFieldEditor
            def={def}
            value={valueByField.get(def.id)}
            disabled={setValue.isPending}
            onSave={(value) =>
              setValue.mutate(
                { fieldId: def.id, value },
                { onError: () => toast.error(t("failedSaveCustomField")) },
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Location                                                            */
/* ------------------------------------------------------------------ */

export function CardLocation({ card }: { card: Card }) {
  const t = useTranslations("card");
  const updateCard = useUpdateCard();
  const [lat, setLat] = useState(
    card.locationLat != null ? String(card.locationLat) : "",
  );
  const [lng, setLng] = useState(
    card.locationLng != null ? String(card.locationLng) : "",
  );
  const [name, setName] = useState(card.locationName ?? "");

  const hasSaved =
    card.locationLat != null ||
    card.locationLng != null ||
    !!card.locationName;

  function save() {
    const latRaw = lat.trim();
    const lngRaw = lng.trim();
    const nextLat = latRaw === "" ? null : Number(latRaw);
    const nextLng = lngRaw === "" ? null : Number(lngRaw);
    const invalid =
      (nextLat !== null &&
        (!Number.isFinite(nextLat) || nextLat < -90 || nextLat > 90)) ||
      (nextLng !== null &&
        (!Number.isFinite(nextLng) || nextLng < -180 || nextLng > 180)) ||
      (nextLat === null) !== (nextLng === null);
    if (invalid) {
      toast.error(t("locationInvalid"));
      return;
    }
    updateCard.mutate(
      {
        id: card.id,
        input: {
          locationLat: nextLat,
          locationLng: nextLng,
          locationName: name.trim() || null,
        },
      },
      {
        onSuccess: () => toast.success(t("locationSaved")),
        onError: () => toast.error(t("failedSave")),
      },
    );
  }

  function clear() {
    setLat("");
    setLng("");
    setName("");
    updateCard.mutate(
      {
        id: card.id,
        input: { locationLat: null, locationLng: null, locationName: null },
      },
      { onError: () => toast.error(t("failedSave")) },
    );
  }

  return (
    <div className="space-y-2">
      <Input
        className="h-8"
        placeholder={t("locationName")}
        value={name}
        maxLength={500}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          className="h-8"
          type="number"
          step="any"
          min={-90}
          max={90}
          placeholder={t("locationLat")}
          aria-label={t("locationLat")}
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <Input
          className="h-8"
          type="number"
          step="any"
          min={-180}
          max={180}
          placeholder={t("locationLng")}
          aria-label={t("locationLng")}
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={updateCard.isPending}
          onClick={save}
        >
          {t("locationSave")}
        </Button>
        {hasSaved && (
          <Button
            size="sm"
            variant="ghost"
            disabled={updateCard.isPending}
            onClick={clear}
          >
            {t("locationClear")}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stickers                                                            */
/* ------------------------------------------------------------------ */

const STICKER_PACK_IDS: Record<string, string> = {
  Reactions: "reactions",
  Status: "status",
  Priority: "priority",
  Review: "review",
  Launch: "launch",
};

export function CardStickers({
  cardId,
  columnId,
}: {
  cardId: string;
  columnId?: string;
}) {
  const t = useTranslations("card");
  const packLabel = (name: string) => {
    const id = STICKER_PACK_IDS[name];
    const key = id ? `stickerPacks.${id}` : "";
    return key && t.has(key) ? t(key) : name;
  };
  const { data: packs = [], isLoading: packsLoading } = useStickerPacks();
  const { data: placed = [] } = useCardStickers(cardId);
  const { place, remove } = useCardStickerMutations(cardId, columnId);
  const [packId, setPackId] = useState<string | null>(null);

  const activePack = packs.find((p) => p.id === packId) ?? packs[0];

  function addSticker(stickerId: string) {
    const n = placed.length;
    place.mutate(
      {
        stickerId,
        x: Math.min(0.9, 0.55 + ((n * 0.17) % 0.4)),
        y: Math.min(0.9, 0.2 + ((n * 0.23) % 0.6)),
        rotate: Math.round(Math.random() * 40 - 20),
        zIndex: n + 1,
      },
      { onError: () => toast.error(t("failedPlaceSticker")) },
    );
  }

  return (
    <div className="space-y-3">
      {placed.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {placed.map((s) => (
            <li
              key={s.id}
              className="group relative flex size-10 items-center justify-center rounded-md bg-muted/50"
              title={s.name}
            >
              <img
                src={s.imageUrl}
                alt={s.name}
                className="size-8 object-contain"
              />
              <button
                type="button"
                aria-label={t("removeSticker", { name: s.name })}
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(s.id, {
                    onError: () => toast.error(t("failedRemoveSticker")),
                  })
                }
                className="absolute -end-1 -top-1 flex size-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-white opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {packsLoading && (
        <p className="text-xs text-muted-foreground">{t("loadingStickers")}</p>
      )}
      {!packsLoading && packs.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noStickerPacks")}</p>
      )}

      {packs.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {packs.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => setPackId(pack.id)}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-1 text-xs transition-colors",
                  activePack?.id === pack.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                )}
              >
                {packLabel(pack.name)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activePack?.stickers.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                title={sticker.name}
                aria-label={t("addSticker", { name: sticker.name })}
                disabled={place.isPending}
                onClick={() => addSticker(sticker.id)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-md bg-muted/40 transition-transform hover:scale-105 hover:bg-muted"
              >
                <img
                  src={sticker.imageUrl}
                  alt=""
                  className="size-8 object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
