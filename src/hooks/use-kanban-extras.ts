"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  labelsApi,
  checklistsApi,
  commentsApi,
  attachmentsApi,
  activityApi,
  boardsApi,
} from "@/lib/api";
import { cardKeys } from "./use-card";

export const labelKeys = {
  byBoard: (boardId: string) => ["labels", boardId] as const,
};

export const checklistKeys = {
  byCard: (cardId: string) => ["checklists", cardId] as const,
};

export const commentKeys = {
  byCard: (cardId: string) => ["comments", cardId] as const,
};

export const attachmentKeys = {
  byCard: (cardId: string) => ["attachments", cardId] as const,
};

export const activityKeys = {
  byCard: (cardId: string) => ["activity", "card", cardId] as const,
  byBoard: (boardId: string) => ["activity", "board", boardId] as const,
};

export const memberKeys = {
  byBoard: (boardId: string) => ["members", boardId] as const,
};

export function useBoardLabels(boardId: string | undefined) {
  return useQuery({
    queryKey: labelKeys.byBoard(boardId ?? ""),
    queryFn: () => labelsApi.listByBoard(boardId!),
    enabled: !!boardId,
  });
}

export function useCreateLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; color: string }) =>
      labelsApi.create(boardId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: labelKeys.byBoard(boardId) });
    },
  });
}

export function useToggleCardLabel(cardId: string, columnId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      labelId,
      attached,
    }: {
      labelId: string;
      attached: boolean;
    }) => {
      if (attached) await labelsApi.detachFromCard(cardId, labelId);
      else await labelsApi.attachToCard(cardId, labelId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
      if (columnId) {
        void qc.invalidateQueries({ queryKey: cardKeys.byColumn(columnId) });
      }
    },
  });
}

export function useChecklists(cardId: string | undefined) {
  return useQuery({
    queryKey: checklistKeys.byCard(cardId ?? ""),
    queryFn: () => checklistsApi.listByCard(cardId!),
    enabled: !!cardId,
  });
}

export function useChecklistMutations(cardId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: checklistKeys.byCard(cardId) });
    void qc.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
  };

  return {
    create: useMutation({
      mutationFn: (title: string) => checklistsApi.create(cardId, title),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => checklistsApi.remove(id),
      onSuccess: invalidate,
    }),
    addItem: useMutation({
      mutationFn: ({ checklistId, title }: { checklistId: string; title: string }) =>
        checklistsApi.addItem(checklistId, title),
      onSuccess: invalidate,
    }),
    updateItem: useMutation({
      mutationFn: ({
        id,
        ...input
      }: {
        id: string;
        title?: string;
        completed?: boolean;
      }) => checklistsApi.updateItem(id, input),
      onSuccess: invalidate,
    }),
    removeItem: useMutation({
      mutationFn: (id: string) => checklistsApi.removeItem(id),
      onSuccess: invalidate,
    }),
  };
}

export function useComments(cardId: string | undefined) {
  return useQuery({
    queryKey: commentKeys.byCard(cardId ?? ""),
    queryFn: () => commentsApi.listByCard(cardId!),
    enabled: !!cardId,
  });
}

export function useCommentMutations(cardId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: commentKeys.byCard(cardId) });
    void qc.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
  };
  return {
    create: useMutation({
      mutationFn: (body: string) => commentsApi.create(cardId, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => commentsApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}

export function useAttachments(cardId: string | undefined) {
  return useQuery({
    queryKey: attachmentKeys.byCard(cardId ?? ""),
    queryFn: () => attachmentsApi.listByCard(cardId!),
    enabled: !!cardId,
  });
}

export function useAttachmentMutations(cardId: string, columnId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: attachmentKeys.byCard(cardId) });
    void qc.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    if (columnId) {
      void qc.invalidateQueries({ queryKey: cardKeys.byColumn(columnId) });
    }
  };
  return {
    upload: useMutation({
      mutationFn: (file: File) => attachmentsApi.upload(cardId, file),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => attachmentsApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}

export function useCardActivity(cardId: string | undefined) {
  return useQuery({
    queryKey: activityKeys.byCard(cardId ?? ""),
    queryFn: () => activityApi.listByCard(cardId!),
    enabled: !!cardId,
  });
}

export function useBoardMembers(boardId: string | undefined) {
  return useQuery({
    queryKey: memberKeys.byBoard(boardId ?? ""),
    queryFn: () => boardsApi.listMembers(boardId!),
    enabled: !!boardId,
  });
}

export function useMemberMutations(boardId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: memberKeys.byBoard(boardId) });
  return {
    add: useMutation({
      mutationFn: (input: { userId: string; role: "VIEWER" | "EDITOR" }) =>
        boardsApi.addMember(boardId, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => boardsApi.removeMember(boardId, userId),
      onSuccess: invalidate,
    }),
  };
}
