"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { githubKeys } from "@/hooks/use-github";
import { GithubConnectCard } from "./github-connect-card";
import { ApiTokensPanel } from "./api-tokens-panel";
import { McpConnectionCard } from "./mcp-connection-card";
import { WebhooksPanel } from "./webhooks-panel";
import { ExportPanel } from "./export-panel";
import { PageHeader } from "@/components/ui/page-header";

/**
 * Integrations — GitHub account connection and MCP API tokens.
 */
export function IntegrationsPageView() {
  const t = useTranslations("integrations");
  const qc = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubParam = params.get("github");
    if (!githubParam) return;

    if (githubParam === "connected") {
      toast.success(t("github.connectedToast"));
      void qc.invalidateQueries({ queryKey: githubKeys.status() });
    } else if (githubParam === "error") {
      toast.error(t("github.connectFailed"));
    }

    params.delete("github");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
    // Run once on mount to consume the OAuth callback redirect params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="space-y-6">
        <GithubConnectCard />
        <WebhooksPanel />
        <ExportPanel />
        <ApiTokensPanel />
        <McpConnectionCard />
      </div>
    </div>
  );
}
