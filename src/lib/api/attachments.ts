import type { Attachment } from "@/types/domain";
import { apiFetch, API_BASE_URL, getAccessToken } from "./client";

export const attachmentsApi = {
  listByCard(cardId: string) {
    return apiFetch<Attachment[]>(`/cards/${cardId}/attachments`);
  },

  async upload(cardId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<Attachment>(`/cards/${cardId}/attachments`, {
      method: "POST",
      body: form,
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/attachments/${id}`, { method: "DELETE" });
  },

  downloadUrl(id: string) {
    return `${API_BASE_URL}/attachments/${id}/download`;
  },

  async fetchBlob(id: string): Promise<Blob> {
    const token = getAccessToken();
    const res = await fetch(attachmentsApi.downloadUrl(id), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Download failed");
    return res.blob();
  },
};
