import { z } from "zod";

type Translate = (key: string) => string;

const en = (key: string) => {
  const messages: Record<string, string> = {
    workspaceIdRequired: "Workspace ID is required",
    nameRequired: "Name is required",
    boardNameMax: "Board name is too long",
    oneAnchorColumn: "Provide at most one anchor column",
  };
  return messages[key] ?? key;
};

export function createCreateBoardSchema(t: Translate) {
  return z.object({
    workspaceId: z.string().uuid(t("workspaceIdRequired")),
    name: z
      .string()
      .trim()
      .min(1, t("nameRequired"))
      .max(64, t("boardNameMax")),
  });
}

export function createUpdateBoardSchema(t: Translate) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("nameRequired"))
      .max(64, t("boardNameMax"))
      .optional(),
  });
}

export const createBoardSchema = createCreateBoardSchema(en);
export const updateBoardSchema = createUpdateBoardSchema(en);

export const createColumnSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().trim().min(1).max(40),
});

export const updateColumnSchema = z.object({
  title: z.string().trim().min(1).max(40),
});

export function createMoveColumnSchema(t: Translate) {
  return z
    .object({
      afterColumnId: z.string().uuid().optional(),
      beforeColumnId: z.string().uuid().optional(),
    })
    .refine((d) => !(d.afterColumnId && d.beforeColumnId), {
      message: t("oneAnchorColumn"),
    });
}

export const moveColumnSchema = createMoveColumnSchema(en);

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type MoveColumnInput = z.infer<typeof moveColumnSchema>;
