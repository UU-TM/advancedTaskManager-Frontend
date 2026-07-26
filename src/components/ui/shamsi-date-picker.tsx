"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseISO, isValid } from "date-fns";
import {
  parseISO as parseISOJalali,
  isValid as isValidJalali,
} from "date-fns-jalali";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateToDueIso, formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";

type ShamsiDatePickerProps = {
  value?: string | null;
  onChange: (iso: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

/** Locale-aware due-date picker (Jalali for fa, Gregorian for en). */
export function ShamsiDatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: ShamsiDatePickerProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const resolvedPlaceholder = placeholder ?? t("selectDate");

  const selected =
    locale === "fa"
      ? value && isValidJalali(parseISOJalali(value))
        ? parseISOJalali(value)
        : undefined
      : value && isValid(parseISO(value))
        ? parseISO(value)
        : undefined;

  const label =
    formatAppDate(value, "d MMMM yyyy", locale) ?? resolvedPlaceholder;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-8 flex-1 justify-start gap-2 px-2.5 font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-3.5 shrink-0" />
            <span className="truncate" dir={locale === "fa" ? "rtl" : "ltr"}>
              {label}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? dateToDueIso(date) : null);
              setOpen(false);
            }}
            defaultMonth={selected}
          />
        </PopoverContent>
      </Popover>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          disabled={disabled}
          aria-label={t("clearDate")}
          onClick={() => onChange(null)}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
