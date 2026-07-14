import { z } from "zod";

/**
 * Board validators
 */

export const createBoardSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  name: z
    .string()
    .min(2, "Board name must be at least 2 characters")
    .max(64, "Board name is too long"),
  description: z.string().max(500).optional(),
});

export const updateBoardSchema = createBoardSchema.partial();

export const createColumnSchema = z.object({
  boardId: z.string().min(1),
  name: z.string().min(1).max(40),
  position: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
