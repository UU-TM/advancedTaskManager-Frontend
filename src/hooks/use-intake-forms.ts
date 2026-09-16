"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  intakeFormsApi,
  type CreateIntakeFormInput,
  type UpdateIntakeFormInput,
} from "@/lib/api";

export const intakeFormKeys = {
  all: ["intake-forms"] as const,
  workspace: (workspaceId: string) =>
    [...intakeFormKeys.all, workspaceId] as const,
  public: (slug: string) => [...intakeFormKeys.all, "public", slug] as const,
};

export function useIntakeForms(workspaceId: string | undefined) {
  return useQuery({
    queryKey: intakeFormKeys.workspace(workspaceId ?? ""),
    queryFn: () => intakeFormsApi.list(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateIntakeForm(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIntakeFormInput) =>
      intakeFormsApi.create(workspaceId, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: intakeFormKeys.workspace(workspaceId),
      });
    },
  });
}

export function useUpdateIntakeForm(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateIntakeFormInput;
    }) => intakeFormsApi.update(workspaceId, id, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: intakeFormKeys.workspace(workspaceId),
      });
    },
  });
}

export function useDeleteIntakeForm(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => intakeFormsApi.remove(workspaceId, id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: intakeFormKeys.workspace(workspaceId),
      });
    },
  });
}

export function usePublicIntakeForm(slug: string | undefined) {
  return useQuery({
    queryKey: intakeFormKeys.public(slug ?? ""),
    queryFn: () => intakeFormsApi.getPublic(slug!),
    enabled: !!slug,
  });
}

export function useSubmitPublicIntakeForm(slug: string) {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      intakeFormsApi.submitPublic(slug, body),
  });
}
