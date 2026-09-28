import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useUnreadMessagesCountQuery = (
  applicationId: string
): UseQueryResult<{ count: number }> => {
  const { axios, handleResponse } = useBackendAPI();
  const errorHandler = useErrorHandler();

  return useQuery({
    queryKey: [BackendEndpoint.HANDLER_NOTES, applicationId, 'unread-messages-count'],
    queryFn: () =>
      handleResponse<{ count: number }>(
        axios.get(`${BackendEndpoint.HANDLER_NOTES}${applicationId}/unread-messages-count/`)
      ),
    staleTime: 30_000,
    onError: errorHandler,
  });
};

export default useUnreadMessagesCountQuery;
