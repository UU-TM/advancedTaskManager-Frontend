"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import {
  usePublicIntakeForm,
  useSubmitPublicIntakeForm,
} from "@/hooks/use-intake-forms";
import type { IntakeField } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

function asFields(raw: unknown): IntakeField[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (f): f is IntakeField =>
      !!f && typeof f === "object" && "key" in f && "label" in f,
  );
}

export function PublicFormPageView() {
  const t = useTranslations("publicForm");
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data, isLoading, isError } = usePublicIntakeForm(slug);
  const submit = useSubmitPublicIntakeForm(slug);
  const fields = useMemo(() => asFields(data?.fields), [data?.fields]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <EmptyState
          icon={ClipboardList}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <EmptyState
          icon={ClipboardList}
          title={t("successTitle")}
          description={t("successBody")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <form
        className="space-y-4 rounded-xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const payload: Record<string, unknown> = { ...values, _hp: hp };
          if (values.title) payload.title = values.title;
          if (values.description) payload.description = values.description;
          submit.mutate(payload, {
            onSuccess: () => setDone(true),
            onError: () => toast.error(t("submitFailed")),
          });
        }}
      >
        {/* honeypot */}
        <input
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] opacity-0"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          aria-hidden
        />
        {(fields.length > 0
          ? fields
          : [
              { key: "title", label: "Title", type: "text" as const, required: true },
              {
                key: "description",
                label: "Description",
                type: "textarea" as const,
              },
            ]
        ).map((field) => (
          <div key={field.key} className="space-y-2">
            <Label>
              {field.label}
              {field.required ? " *" : ""}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
              />
            ) : field.type === "select" && field.options ? (
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
              >
                <option value="">—</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type === "email" ? "email" : "text"}
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
              />
            )}
          </div>
        ))}
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={submit.isPending}
        >
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
