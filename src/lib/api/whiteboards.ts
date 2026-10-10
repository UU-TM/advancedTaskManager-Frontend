import { apiFetch } from "./client";

export type WhiteboardScene = {
  elements: unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
};

export type WhiteboardSceneResponse = {
  boardId: string;
  revision: number;
  updatedAt: string;
  updatedById: string | null;
  scene: WhiteboardScene;
};

export const whiteboardsApi = {
  getScene(boardId: string): Promise<WhiteboardSceneResponse> {
    return apiFetch<WhiteboardSceneResponse>(
      `/boards/${boardId}/whiteboard/scene`,
    );
  },

  putScene(
    boardId: string,
    scene: WhiteboardScene,
  ): Promise<WhiteboardSceneResponse> {
    return apiFetch<WhiteboardSceneResponse>(
      `/boards/${boardId}/whiteboard/scene`,
      {
        method: "PUT",
        body: JSON.stringify(scene),
      },
    );
  },
};
