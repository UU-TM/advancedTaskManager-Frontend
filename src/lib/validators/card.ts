import { z } from "zod";

type Translate = (key: string) => string;

const en = (key: string) => {
  const messages: Record<string, string> = {
    cardTitleRequired: "Card title is required",
    cardTitleMax: "Card title is too long",
    oneAnchorCard: "Provide at most one anchor card",
  };
  return messages[key] ?? key;
};

export function createCreateCardSchema(t: Translate) {
  return z.object({
    columnId: z.string().uuid(),
    title: z
      .string()
      .min(1, t("cardTitleRequired"))
      .max(120, t("cardTitleMax")),
    description: z.string().max(5000).optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    category: z.string().max(64).optional(),
    /** Kept for FE forms that still pass boardId locally — stripped before API */
    boardId: z.string().uuid().optional(),
  });
}

export const createCardSchema = createCreateCardSchema(en);

export const updateCardSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  estimateMinutes: z.number().int().min(0).nullable().optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
  recurrenceUntil: z.string().datetime().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).nullable().optional(),
  category: z.string().max(64).nullable().optional(),
  coverColor: z.string().nullable().optional(),
  coverAttachmentId: z.string().uuid().nullable().optional(),
});

export function createMoveCardSchema(t: Translate) {
  return z
    .object({
      columnId: z.string().uuid(),
      afterCardId: z.string().uuid().optional(),
      beforeCardId: z.string().uuid().optional(),
    })
    .refine((d) => !(d.afterCardId && d.beforeCardId), {
      message: t("oneAnchorCard"),
    });
}

export const moveCardSchema = createMoveCardSchema(en);

export const copyCardSchema = z.object({
  columnId: z.string().uuid(),
  includeChecklists: z.boolean().optional(),
  includeLabels: z.boolean().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type CopyCardInput = z.infer<typeof copyCardSchema>;
