import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { HandlerNote } from 'kesaseteli/handler/types/note';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useExternalMessagesQuery = (
  applicationId: string
): UseQueryResult<HandlerNote[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const errorHandler = useErrorHandler();

  return useQuery({
    queryKey: [BackendEndpoint.HANDLER_NOTES, applicationId, 'external-messages'],
    queryFn: () =>
      handleResponse<HandlerNote[]>(
        axios.get(`${BackendEndpoint.HANDLER_NOTES}${applicationId}/external-messages/`)
      ),
    staleTime: 30_000,
    onError: errorHandler,
  });
};

export default useExternalMessagesQuery;
