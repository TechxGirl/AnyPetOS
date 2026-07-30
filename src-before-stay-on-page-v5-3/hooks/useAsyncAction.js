import { useCallback, useRef, useState } from "react";
import { useToast } from "../components/ui";

function getErrorMessage(error, fallback) {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  return fallback;
}

export default function useAsyncAction() {
  const pendingRef = useRef(new Set());
  const [pendingKeys, setPendingKeys] = useState(() => new Set());
  const { showToast } = useToast();

  const setPending = useCallback((key, pending) => {
    const next = new Set(pendingRef.current);

    if (pending) next.add(key);
    else next.delete(key);

    pendingRef.current = next;
    setPendingKeys(next);
  }, []);

  const isPending = useCallback(
    (key) => pendingKeys.has(key),
    [pendingKeys]
  );

  const isPendingPrefix = useCallback(
    (prefix) => Array.from(pendingKeys).some((key) => key.startsWith(prefix)),
    [pendingKeys]
  );

  const runAction = useCallback(
    async ({
      key,
      action,
      successTitle = "Saved",
      successMessage,
      errorTitle = "Something went wrong",
      errorMessage = "Your changes could not be saved. Please try again.",
    }) => {
      if (pendingRef.current.has(key)) {
        return { ok: false, skipped: true };
      }

      setPending(key, true);

      try {
        const data = await action();

        if (successMessage) {
          showToast({
            title: successTitle,
            message: successMessage,
            variant: "success",
          });
        }

        return { ok: true, data };
      } catch (error) {
        console.error(`[${key}]`, error);

        showToast({
          title: errorTitle,
          message: getErrorMessage(error, errorMessage),
          variant: "error",
          duration: 6000,
        });

        return { ok: false, error };
      } finally {
        setPending(key, false);
      }
    },
    [setPending, showToast]
  );

  return { runAction, isPending, isPendingPrefix };
}
