"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Terminal } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MCP_TOOLS = [
  "list_workspaces",
  "list_boards",
  "get_board",
  "create_board",
  "create_board_from_template",
  "list_columns",
  "create_column",
  "create_card",
  "update_card",
  "move_card",
  "get_card",
  "list_my_assigned_cards",
  "list_activity",
  "list_linked_issues",
  "list_linked_prs",
  "link_issue_to_card",
] as const;

function CopyableBlock({
  value,
  copyLabel,
}: {
  value: string;
  copyLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative">
      <pre className="max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-xs">
        <code>{value}</code>
      </pre>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute top-2 end-2 size-7 cursor-pointer bg-background"
        onClick={() => void handleCopy()}
        aria-label={copyLabel}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}

/**
 * In-app MCP connection docs — endpoint, HTTP/stdio configs, and tool list.
 */
export function McpConnectionCard() {
  const t = useTranslations("integrations");
  const mcpUrl = `${API_BASE_URL}/mcp`;

  const httpSnippet = JSON.stringify(
    {
      mcpServers: {
        "advanced-task-manager": {
          url: mcpUrl,
          headers: {
            Authorization: "Bearer <YOUR_API_TOKEN>",
          },
        },
      },
    },
    null,
    2,
  );

  const stdioSnippet = JSON.stringify(
    {
      mcpServers: {
        "advanced-task-manager": {
          command: "node",
          args: ["/absolute/path/to/scripts/mcp-stdio.mjs"],
          env: {
            MCP_URL: mcpUrl,
            MCP_TOKEN: "<YOUR_API_TOKEN>",
          },
        },
      },
    },
    null,
    2,
  );

  const steps = [
    t("mcp.steps.createToken"),
    t("mcp.steps.pickTransport"),
    t("mcp.steps.pasteConfig"),
    t("mcp.steps.restartClient"),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Terminal className="size-5" />
          </div>
          <div>
            <CardTitle>{t("mcp.title")}</CardTitle>
            <CardDescription>{t("mcp.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ol className="list-decimal space-y-2 ps-5 text-sm text-muted-foreground">
          {steps.map((step) => (
            <li key={step} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>

        <div className="rounded-lg bg-muted/60 px-3 py-2">
          <p className="text-xs text-muted-foreground">{t("mcp.endpointLabel")}</p>
          <p className="break-all font-mono text-sm">{mcpUrl}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("mcp.authHint")}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("mcp.configTitle")}</p>
          <Tabs defaultValue="http">
            <TabsList>
              <TabsTrigger value="http">{t("mcp.httpTab")}</TabsTrigger>
              <TabsTrigger value="stdio">{t("mcp.stdioTab")}</TabsTrigger>
            </TabsList>
            <TabsContent value="http" className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("mcp.httpHint")}</p>
              <CopyableBlock value={httpSnippet} copyLabel={t("mcp.copy")} />
            </TabsContent>
            <TabsContent value="stdio" className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("mcp.stdioHint")}</p>
              <CopyableBlock value={stdioSnippet} copyLabel={t("mcp.copy")} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("mcp.toolsTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("mcp.toolsDescription")}</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {MCP_TOOLS.map((tool) => (
              <li
                key={tool}
                className="rounded-md bg-muted/50 px-2.5 py-1.5 font-mono text-xs"
              >
                {tool}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{t("mcp.resourcesHint")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
