"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import {
  Excalidraw,
  MainMenu,
  reconcileElements,
  useHandleLibrary,
} from "@excalidraw/excalidraw";
import { useTranslations } from "next-intl";
import { Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@excalidraw/excalidraw/index.css";
import "./whiteboard-theme.css";
import { whiteboardLibraryAdapter } from "./library-persistence";
import { WhiteboardLibraryStore } from "./whiteboard-library-store";

type WhiteboardCanvasProps = {
  theme: "light" | "dark";
  viewBackgroundColor: string;
  readonly: boolean;
  initialData: {
    elements: unknown[];
    appState: Record<string, unknown>;
    files: Record<string, unknown>;
  };
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
  onLocalChange: (
    elements: readonly unknown[],
    files: Record<string, unknown>,
  ) => void;
  onPointerUpdate: (payload: {
    pointer: { x: number; y: number; tool: "pointer" | "laser" };
    button: "up" | "down";
  }) => void;
  onRemoteSceneApply?: (
    apply: (elements: readonly unknown[]) => void,
  ) => void;
};

export function WhiteboardCanvas({
  theme,
  viewBackgroundColor,
  readonly,
  initialData,
  onApiReady,
  onLocalChange,
  onPointerUpdate,
  onRemoteSceneApply,
}: WhiteboardCanvasProps) {
  const t = useTranslations("whiteboard.libraryStore");
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const applyingRemote = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useHandleLibrary({
    excalidrawAPI: api,
    adapter: whiteboardLibraryAdapter,
    validateLibraryUrl: (libraryUrl) => {
      try {
        const url = new URL(libraryUrl, window.location.origin);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    },
  });

  useEffect(() => {
    if (!onRemoteSceneApply) return;
    onRemoteSceneApply((incoming) => {
      const current = apiRef.current;
      if (!current) return;
      applyingRemote.current = true;
      try {
        const local = current.getSceneElements();
        const appState = current.getAppState();
        const merged = reconcileElements(
          local,
          incoming as never,
          appState,
        );
        current.updateScene({ elements: merged });
      } catch {
        current.updateScene({ elements: incoming as never });
      } finally {
        applyingRemote.current = false;
      }
    });
  }, [onRemoteSceneApply]);

  const handleChange = useCallback(
    (
      elements: readonly unknown[],
      _appState: unknown,
      files: Record<string, unknown>,
    ) => {
      if (applyingRemote.current || readonly) return;
      onLocalChange(elements, files);
    },
    [onLocalChange, readonly],
  );

  if (!mounted) return null;

  return (
    <div className="excalidraw-kanban relative h-full w-full">
      <Excalidraw
        theme={theme}
        viewModeEnabled={readonly}
        aiEnabled={false}
        name="Whiteboard"
        initialData={
          {
            elements: initialData.elements,
            appState: {
              ...initialData.appState,
              viewBackgroundColor,
              currentItemStrokeColor:
                theme === "dark" ? "#e6eeea" : "#14201c",
              currentItemBackgroundColor: "transparent",
              showWelcomeScreen: false,
            },
            files: initialData.files,
          } as ExcalidrawInitialDataState
        }
        UIOptions={{
          welcomeScreen: false,
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: { saveFileToDisk: true },
            toggleTheme: false,
            clearCanvas: true,
            changeViewBackgroundColor: true,
            saveAsImage: true,
          },
        }}
        renderTopRightUI={() =>
          readonly ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer bg-card shadow-xs"
              onClick={() => setStoreOpen(true)}
            >
              <Shapes className="size-4" />
              {t("open")}
            </Button>
          )
        }
        excalidrawAPI={(nextApi) => {
          apiRef.current = nextApi;
          setApi(nextApi);
          onApiReady(nextApi);
        }}
        onChange={handleChange as never}
        onPointerUpdate={onPointerUpdate}
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          {!readonly && (
            <>
              <MainMenu.Separator />
              <MainMenu.Item
                icon={<Shapes />}
                onSelect={() => setStoreOpen(true)}
              >
                {t("open")}
              </MainMenu.Item>
            </>
          )}
        </MainMenu>
      </Excalidraw>

      <WhiteboardLibraryStore
        open={storeOpen}
        onOpenChange={setStoreOpen}
        api={api}
      />
    </div>
  );
}
