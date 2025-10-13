import { useEffect, useState } from "react";

/**
 * Ensures loading state is displayed for a minimum duration to avoid jarring flashes.
 * @param isLoading - The actual loading state
 * @param minimumMs - Minimum time to show loading state (default: 500ms)
 * @returns Whether to show loading state
 */
export function useMinimumLoadingTime(isLoading: boolean, minimumMs = 500): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      // Started loading
      setLoadingStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && loadingStartTime) {
      // Loading finished, check if minimum time has elapsed
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, minimumMs - elapsed);

      if (remaining > 0) {
        // Wait for remaining time before hiding loading
        const timeout = setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, remaining);
        return () => clearTimeout(timeout);
      }
      // Minimum time already elapsed
      setShowLoading(false);
      setLoadingStartTime(null);
    }
  }, [isLoading, loadingStartTime, minimumMs]);

  return showLoading;
}
