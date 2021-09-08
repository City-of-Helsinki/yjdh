import { useIsFetching, useIsMutating } from 'react-query';

type SyncingToBackend = {
  isLoading: boolean;
  isMutating: boolean;
  isSyncing: boolean;
};

const useIsSyncingToBackend = (): SyncingToBackend => {
  const isLoading = useIsFetching({ fetching: false }) > 0;
  const isMutating = useIsMutating() > 0;
  return {
    isLoading,
    isMutating,
    isSyncing: isLoading || isMutating,
  };
};
export default useIsSyncingToBackend;
