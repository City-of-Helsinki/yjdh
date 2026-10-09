import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { HandlerNote } from '../../types/note';

const useExternalMessagesQuery = (
  applicationId: string
): UseQueryResult<HandlerNote[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<HandlerNote[], Error>({
    queryKey: [
      BackendEndpoint.HANDLER_NOTES,
      applicationId,
      'external-messages',
    ],
    queryFn: () =>
      handleResponse<HandlerNote[]>(
        axios.get(
          `${BackendEndpoint.HANDLER_NOTES}${applicationId}/external-messages/`
        )
      ),
    staleTime: 30_000,
  });
};

export default useExternalMessagesQuery;
