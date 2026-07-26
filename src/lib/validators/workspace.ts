import { z } from "zod";

type Translate = (key: string) => string;

const en = (key: string) => {
  const messages: Record<string, string> = {
    nameRequired: "Name is required",
    workspaceNameMax: "Workspace name is too long",
  };
  return messages[key] ?? key;
};

/**
 * Workspace validators — aligned with backend CreateWorkspaceDto.
 */

export function createCreateWorkspaceSchema(t: Translate) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("nameRequired"))
      .max(64, t("workspaceNameMax")),
  });
}

export const createWorkspaceSchema = createCreateWorkspaceSchema(en);

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
