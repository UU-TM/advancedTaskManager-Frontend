/**
 * Auth feature components
 * ----------------------------------------------------
 * Page-level auth UI (shell, forms, guest gate) plus the
 * shared `useAuth` hook re-export for feature consumers.
 */
export { useAuth } from "@/hooks/use-auth";
export { AuthShell } from "./auth-shell";
export { AuthField } from "./auth-field";
export { LoginForm } from "./login-form";
export { RegisterForm } from "./register-form";
export { GuestOnly } from "./guest-only";
