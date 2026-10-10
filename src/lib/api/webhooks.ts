import type { OutboundWebhook } from "@/types/domain";
import { apiFetch } from "./client";

export type CreateWebhookInput = {
  url: string;
  secret: string;
  events: string[];
  enabled?: boolean;
};

export type UpdateWebhookInput = {
  url?: string;
  secret?: string;
  events?: string[];
  enabled?: boolean;
};

export const webhooksApi = {
  list(workspaceId: string): Promise<OutboundWebhook[]> {
    return apiFetch<OutboundWebhook[]>(`/workspaces/${workspaceId}/webhooks`);
  },

  create(
    workspaceId: string,
    input: CreateWebhookInput,
  ): Promise<OutboundWebhook> {
    return apiFetch<OutboundWebhook>(`/workspaces/${workspaceId}/webhooks`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateWebhookInput): Promise<OutboundWebhook> {
    return apiFetch<OutboundWebhook>(`/webhooks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<OutboundWebhook> {
    return apiFetch<OutboundWebhook>(`/webhooks/${id}`, { method: "DELETE" });
  },
};
