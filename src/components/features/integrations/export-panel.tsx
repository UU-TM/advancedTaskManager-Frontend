"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { exportApi } from "@/lib/api/export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExportPanel() {
  const t = useTranslations("integrations.export");
  const { workspaceId } = useActiveWorkspace();
  const [pending, setPending] = useState(false);

  async function onExport() {
    if (!workspaceId) return;
    setPending(true);
    try {
      const data = await exportApi.workspace(workspaceId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workspace-${workspaceId}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("success"));
    } catch {
      toast.error(t("failed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="size-4" />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onExport}
          disabled={!workspaceId || pending}
          className="cursor-pointer"
        >
          {pending ? t("exporting") : t("button")}
        </Button>
      </CardContent>
    </Card>
  );
}
