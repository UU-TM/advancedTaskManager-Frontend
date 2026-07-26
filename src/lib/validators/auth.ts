import { z } from "zod";

type Translate = (key: string) => string;

/**
 * Auth validators — aligned with backend LoginDto / RegisterDto.
 * Factory forms take translated messages for the active locale.
 */

export function createPasswordSchema(t: Translate) {
  return z
    .string()
    .min(8, t("passwordMin"))
    .max(128, t("passwordMax"));
}

export function createUsernameSchema(t: Translate) {
  return z
    .string()
    .min(3, t("usernameMin"))
    .max(32, t("usernameMax"))
    .regex(/^[a-zA-Z0-9_-]+$/, t("usernamePattern"));
}

export function createLoginSchema(t: Translate) {
  return z.object({
    username: createUsernameSchema(t),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export function createRegisterSchema(t: Translate) {
  return z
    .object({
      username: createUsernameSchema(t),
      password: createPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

/** Default English schemas for non-UI / server callers. */
const en = (key: string) => {
  const messages: Record<string, string> = {
    passwordMin: "Password must be at least 8 characters",
    passwordMax: "Password is too long",
    passwordRequired: "Password is required",
    usernameMin: "Username must be at least 3 characters",
    usernameMax: "Username must be 32 characters or fewer",
    usernamePattern:
      "Username can only contain letters, numbers, hyphens and underscores",
    passwordsMismatch: "Passwords do not match",
  };
  return messages[key] ?? key;
};

export const passwordSchema = createPasswordSchema(en);
export const usernameSchema = createUsernameSchema(en);
export const loginSchema = createLoginSchema(en);
export const registerSchema = createRegisterSchema(en);

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
