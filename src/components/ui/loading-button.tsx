import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Button that automatically shows a spinner and disables itself when `loading`.
 * Use with async onClick handlers via `useAsyncAction` to avoid double-submits.
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, disabled, children, ...props }, ref) => {
    return (
      <Button ref={ref} disabled={loading || disabled} {...props}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? loadingText ?? children : children}
      </Button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";

export function useAsyncAction<T>(action: () => Promise<T> | T) {
  const [loading, setLoading] = React.useState(false);
  const run = React.useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      return await action();
    } finally {
      setLoading(false);
    }
  }, [action, loading]);
  return { loading, run };
}
