import { z } from "zod";

/**
 * Board validators — aligned with backend CreateBoardDto
 * (name only on the wire; workspaceId is a path param).
 */

export const createBoardSchema = z.object({
  workspaceId: z.string().uuid("Workspace ID is required"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Board name is too long"),
});

export const updateBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Board name is too long")
    .optional(),
});

export const createColumnSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().trim().min(1).max(40),
  position: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
