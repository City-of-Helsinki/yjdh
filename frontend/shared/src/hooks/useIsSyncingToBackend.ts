import { useIsFetching, useIsMutating } from '@tanstack/react-query';

type SyncingToBackend = {
  isLoading: boolean;
  isMutating: boolean;
  isSyncing: boolean;
};

const useIsSyncingToBackend = (): SyncingToBackend => {
  const isLoading = useIsFetching() > 0;
  const isMutating = useIsMutating() > 0;
  return {
    isLoading,
    isMutating,
    isSyncing: isLoading || isMutating,
  };
};
export default useIsSyncingToBackend;
