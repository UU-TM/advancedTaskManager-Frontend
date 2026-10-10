import type {
  CardCustomFieldValue,
  CustomFieldDef,
  CustomFieldOption,
  CustomFieldType,
} from "@/types/domain";
import { apiFetch } from "./client";

export type CreateCustomFieldInput = {
  name: string;
  type: CustomFieldType;
  options?: CustomFieldOption[];
};

export type UpdateCustomFieldInput = {
  name?: string;
  options?: CustomFieldOption[] | null;
  position?: number;
};

export const customFieldsApi = {
  listByBoard(boardId: string): Promise<CustomFieldDef[]> {
    return apiFetch<CustomFieldDef[]>(`/boards/${boardId}/custom-fields`);
  },

  create(
    boardId: string,
    input: CreateCustomFieldInput,
  ): Promise<CustomFieldDef> {
    return apiFetch<CustomFieldDef>(`/boards/${boardId}/custom-fields`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(
    boardId: string,
    fieldId: string,
    input: UpdateCustomFieldInput,
  ): Promise<CustomFieldDef> {
    return apiFetch<CustomFieldDef>(
      `/boards/${boardId}/custom-fields/${fieldId}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  },

  remove(boardId: string, fieldId: string): Promise<CustomFieldDef> {
    return apiFetch<CustomFieldDef>(
      `/boards/${boardId}/custom-fields/${fieldId}`,
      { method: "DELETE" },
    );
  },

  listValues(cardId: string): Promise<CardCustomFieldValue[]> {
    return apiFetch<CardCustomFieldValue[]>(`/cards/${cardId}/custom-fields`);
  },

  setValue(
    cardId: string,
    fieldId: string,
    value: unknown,
  ): Promise<CardCustomFieldValue> {
    return apiFetch<CardCustomFieldValue>(
      `/cards/${cardId}/custom-fields/${fieldId}`,
      { method: "PUT", body: JSON.stringify({ value }) },
    );
  },
};
