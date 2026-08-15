"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api";
import {
  useWorkspaces,
  workspaceKeys,
} from "@/hooks/use-workspaces";
import type { Workspace } from "@/types/domain";

const STORAGE_KEY = "activeWorkspaceId";
const DEFAULT_WORKSPACE_NAME = "My Workspace";

type ActiveWorkspaceContextValue = {
  workspaceId: string | undefined;
  workspace: Workspace | undefined;
  workspaces: Workspace[];
  setWorkspaceId: (id: string) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const ActiveWorkspaceContext =
  createContext<ActiveWorkspaceContextValue | null>(null);

function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function ActiveWorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: workspaces = [], isLoading, isError, error } = useWorkspaces();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const creatingRef = useRef(false);

  const createMutation = useMutation({
    mutationFn: (name: string) => workspacesApi.create({ name }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
      setActiveId(created.id);
      writeStoredId(created.id);
    },
    onSettled: () => {
      creatingRef.current = false;
    },
  });

  useEffect(() => {
    if (isLoading || isError) return;
    if (workspaces.length === 0) {
      if (creatingRef.current || createMutation.isPending) return;
      creatingRef.current = true;
      createMutation.mutate(DEFAULT_WORKSPACE_NAME);
      return;
    }

    const stored = readStoredId();
    const stillValid = stored && workspaces.some((w) => w.id === stored);
    const nextId = stillValid ? stored! : workspaces[0]!.id;
    setActiveId(nextId);
    writeStoredId(nextId);
  }, [workspaces, isLoading, isError, createMutation.isPending]);

  const setWorkspaceId = useCallback((id: string) => {
    setActiveId(id);
    writeStoredId(id);
  }, []);

  const createWorkspace = useCallback(
    async (name: string) => {
      return createMutation.mutateAsync(name);
    },
    [createMutation],
  );

  const workspace = useMemo(
    () => workspaces.find((w) => w.id === activeId),
    [workspaces, activeId],
  );

  const isEnsuring =
    isLoading ||
    createMutation.isPending ||
    (workspaces.length === 0 && !isError && !createMutation.isError);

  const value = useMemo<ActiveWorkspaceContextValue>(
    () => ({
      workspaceId: activeId,
      workspace,
      workspaces,
      setWorkspaceId,
      createWorkspace,
      isLoading: isEnsuring,
      isError: isError || createMutation.isError,
      error: (error ?? createMutation.error) as Error | null,
    }),
    [
      activeId,
      workspace,
      workspaces,
      setWorkspaceId,
      createWorkspace,
      isEnsuring,
      isError,
      createMutation.isError,
      createMutation.error,
      error,
    ],
  );

  return (
    <ActiveWorkspaceContext.Provider value={value}>
      {children}
    </ActiveWorkspaceContext.Provider>
  );
}

export function useActiveWorkspace(): ActiveWorkspaceContextValue {
  const ctx = useContext(ActiveWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useActiveWorkspace must be used within ActiveWorkspaceProvider",
    );
  }
  return ctx;
}
