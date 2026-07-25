import { z } from "zod";

/**
 * Card validators
 */

export const createCardSchema = z.object({
  boardId: z.string().min(1),
  columnId: z.string().min(1),
  title: z
    .string()
    .min(1, "Card title is required")
    .max(120, "Card title is too long"),
  description: z.string().max(5000).optional(),
  position: z.number().int().min(0).optional(),
  labels: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(5000).optional(),
  labels: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

export const moveCardSchema = z.object({
  targetColumnId: z.string().min(1),
  targetPosition: z.number().int().min(0),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
