"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api";
import { useWorkspaces, workspaceKeys } from "./use-workspaces";

const DEFAULT_WORKSPACE_NAME = "My Workspace";

/**
 * Ensures the user has at least one workspace.
 * If the list is empty after load, creates "My Workspace" once.
 * Returns the primary (first) workspace id when ready.
 */
export function useEnsureWorkspace() {
  const queryClient = useQueryClient();
  const { data: workspaces, isLoading, isError, error } = useWorkspaces();
  const creatingRef = useRef(false);

  const createMutation = useMutation({
    mutationFn: () => workspacesApi.create({ name: DEFAULT_WORKSPACE_NAME }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
    onSettled: () => {
      creatingRef.current = false;
    },
  });

  const { mutate, isPending, isError: isCreateError, error: createError } =
    createMutation;

  useEffect(() => {
    if (isLoading || isError) return;
    if (!workspaces) return;
    if (workspaces.length > 0) return;
    if (creatingRef.current || isPending) return;

    creatingRef.current = true;
    mutate();
  }, [workspaces, isLoading, isError, isPending, mutate]);

  const workspaceId = workspaces?.[0]?.id;
  const isEnsuring =
    isLoading ||
    isPending ||
    (!!workspaces && workspaces.length === 0 && !isError && !isCreateError);

  return {
    workspaceId,
    workspace: workspaces?.[0],
    isLoading: isEnsuring,
    isError: isError || isCreateError,
    error: error ?? createError,
  };
}
