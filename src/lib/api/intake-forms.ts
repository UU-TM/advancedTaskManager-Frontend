import { apiFetch } from "./client";

export type IntakeFieldType = "text" | "textarea" | "email" | "select";

export type IntakeField = {
  key: string;
  label: string;
  type?: IntakeFieldType;
  required?: boolean;
  options?: string[];
};

export type IntakeForm = {
  id: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
  name: string;
  slug: string;
  fields: IntakeField[] | unknown;
  enabled: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntakeFormInput = {
  boardId: string;
  columnId: string;
  name: string;
  slug: string;
  fields?: IntakeField[];
  enabled?: boolean;
};

export type UpdateIntakeFormInput = Partial<CreateIntakeFormInput>;

export type PublicIntakeForm = {
  name: string;
  slug: string;
  fields: IntakeField[];
  boardId?: string;
  enabled?: boolean;
};

export const intakeFormsApi = {
  list(workspaceId: string) {
    return apiFetch<IntakeForm[]>(
      `/workspaces/${workspaceId}/intake-forms`,
    );
  },

  create(workspaceId: string, input: CreateIntakeFormInput) {
    return apiFetch<IntakeForm>(`/workspaces/${workspaceId}/intake-forms`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(workspaceId: string, id: string, input: UpdateIntakeFormInput) {
    return apiFetch<IntakeForm>(
      `/workspaces/${workspaceId}/intake-forms/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
  },

  remove(workspaceId: string, id: string) {
    return apiFetch<IntakeForm>(
      `/workspaces/${workspaceId}/intake-forms/${id}`,
      { method: "DELETE" },
    );
  },

  getPublic(slug: string) {
    return apiFetch<PublicIntakeForm>(`/public/forms/${slug}`, {
      skipAuth: true,
      skipRefresh: true,
    });
  },

  /** Backend path is POST /public/forms/:slug/submit (not bare /submit on slug). */
  submitPublic(
    slug: string,
    body: Record<string, unknown> & {
      title?: string;
      description?: string;
      _hp?: string;
    },
  ) {
    return apiFetch<{ cardId?: string }>(`/public/forms/${slug}/submit`, {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
      skipRefresh: true,
    });
  },
};
