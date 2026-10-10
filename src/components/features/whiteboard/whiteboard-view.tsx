"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { io, type Socket } from "socket.io-client";
import { Loader2 } from "lucide-react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { API_BASE_URL, getAccessToken } from "@/lib/api";
import { whiteboardsApi } from "@/lib/api/whiteboards";

const WhiteboardCanvas = dynamic(
  () =>
    import("./whiteboard-canvas").then((m) => m.WhiteboardCanvas),
  { ssr: false },
);

type WhiteboardViewProps = {
  boardId: string;
};

type Collaborator = {
  socketId: string;
  userId: string;
  username: string;
};

function hashElements(elements: readonly unknown[]): string {
  try {
    return JSON.stringify(elements);
  } catch {
    return String(elements.length);
  }
}

export function WhiteboardView({ boardId }: WhiteboardViewProps) {
  const t = useTranslations("whiteboard");
  const { resolvedTheme } = useTheme();
  const token = getAccessToken();

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const [initialData, setInitialData] = useState<{
    elements: unknown[];
    appState: Record<string, unknown>;
    files: Record<string, unknown>;
  } | null>(null);

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastSentHash = useRef("");
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyRemoteRef = useRef<
    ((elements: readonly unknown[]) => void) | null
  >(null);

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const viewBackgroundColor = useMemo(
    () => (theme === "dark" ? "#0c1412" : "#f3f5f4"),
    [theme],
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function boot() {
      try {
        const res = await whiteboardsApi.getScene(boardId);
        if (cancelled) return;
        setInitialData({
          elements: (res.scene.elements as unknown[]) ?? [],
          appState: {
            ...(res.scene.appState ?? {}),
            viewBackgroundColor,
            showWelcomeScreen: false,
          },
          files: (res.scene.files as Record<string, unknown>) ?? {},
        });
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("connectionError"));
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [boardId, token, t, viewBackgroundColor]);

  useEffect(() => {
    if (!token || !ready) return;

    const socket = io(API_BASE_URL, {
      path: "/whiteboards/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-board", boardId);
    });

    socket.on(
      "scene-init",
      (payload: { scene?: { elements?: unknown[] }; readonly?: boolean }) => {
        if (payload.readonly != null) setReadonly(!!payload.readonly);
        if (payload.scene?.elements) {
          applyRemoteRef.current?.(payload.scene.elements);
          lastSentHash.current = hashElements(payload.scene.elements);
        }
      },
    );

    socket.on(
      "scene-update",
      (payload: { elements?: unknown[] }) => {
        if (!payload.elements) return;
        applyRemoteRef.current?.(payload.elements);
        lastSentHash.current = hashElements(payload.elements);
      },
    );

    socket.on("collaborators", (list: Collaborator[]) => {
      if (!apiRef.current) return;
      const map = new Map<
        string,
        { username: string; id: string }
      >();
      for (const c of list) {
        if (c.socketId === socket.id) continue;
        map.set(c.socketId, { username: c.username, id: c.userId });
      }
      apiRef.current.updateScene({ collaborators: map as never });
    });

    socket.on("error", (payload: { message?: string }) => {
      setError(payload?.message ?? t("connectionError"));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [boardId, token, ready, t]);

  const schedulePersist = useCallback(
    (elements: readonly unknown[], files: Record<string, unknown>) => {
      if (readonly) return;
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        void whiteboardsApi.putScene(boardId, {
          elements: [...elements],
          appState: { viewBackgroundColor, showWelcomeScreen: false },
          files,
        });
      }, 1200);
    },
    [boardId, readonly, viewBackgroundColor],
  );

  const onLocalChange = useCallback(
    (elements: readonly unknown[], files: Record<string, unknown>) => {
      const nextHash = hashElements(elements);
      if (nextHash === lastSentHash.current) return;
      lastSentHash.current = nextHash;
      socketRef.current?.emit("scene-update", { elements, files });
      schedulePersist(elements, files);
    },
    [schedulePersist],
  );

  const onPointerUpdate = useCallback(
    (payload: {
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "up" | "down";
    }) => {
      socketRef.current?.emit("pointer-update", payload);
    },
    [],
  );

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t("authRequired")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-destructive">
        <p>{t("connectionError")}</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!ready || !initialData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {t("connecting")}
      </div>
    );
  }

  return (
    <WhiteboardCanvas
      theme={theme}
      viewBackgroundColor={viewBackgroundColor}
      readonly={readonly}
      initialData={initialData}
      onApiReady={(api) => {
        apiRef.current = api;
      }}
      onLocalChange={onLocalChange}
      onPointerUpdate={onPointerUpdate}
      onRemoteSceneApply={(apply) => {
        applyRemoteRef.current = apply;
      }}
    />
  );
}
