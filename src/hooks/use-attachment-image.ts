"use client";

import { useQuery } from "@tanstack/react-query";
import { attachmentsApi } from "@/lib/api";

/**
 * Resolve an attachment to a displayable object URL (the download endpoint
 * needs the bearer token, so a plain <img src> would 401). Returns `null`
 * when the attachment is not an image.
 */
export function useAttachmentImageUrl(attachmentId: string | null | undefined) {
  return useQuery({
    queryKey: ["attachment-image", attachmentId ?? ""],
    enabled: !!attachmentId && !attachmentId.startsWith("temp-"),
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: false,
    queryFn: async () => {
      const blob = await attachmentsApi.fetchBlob(attachmentId!);
      return blob.type.startsWith("image/") ? URL.createObjectURL(blob) : null;
    },
  });
}
