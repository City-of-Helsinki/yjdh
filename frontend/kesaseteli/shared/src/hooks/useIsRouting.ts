/**
 * Hook to detect if a route change is in progress.
 * In App Router, this is usually handled by the framework or loading.tsx.
 * Simplified for kesaseteli-shared as it's now App Router native.
 */
const useIsRouting = (): boolean => {
  return false;
};

export default useIsRouting;
