import { toast } from "sonner";

/** Run `action` after a short delay unless the user presses Undo. */
export function toastUndo(
  message: string,
  undoLabel: string,
  action: () => void,
  delay = 4000,
) {
  let cancelled = false;
  const timer = window.setTimeout(() => {
    if (!cancelled) action();
  }, delay);
  toast(message, {
    duration: delay,
    action: {
      label: undoLabel,
      onClick: () => {
        cancelled = true;
        window.clearTimeout(timer);
      },
    },
  });
}
