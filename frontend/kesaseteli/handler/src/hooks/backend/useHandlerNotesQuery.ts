import { HandlerNote } from 'kesaseteli/handler/types/note';
import {
  BackendEndpoint,
  getHandlerNotesQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useHandlerNotesQuery = (
  targetType: string,
  targetId?: string
): UseQueryResult<HandlerNote[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  return useQuery(
    getHandlerNotesQueryKey(targetType, targetId ?? ''),
    () =>
      handleResponse<HandlerNote[]>(
        axios.get<HandlerNote[]>(BackendEndpoint.HANDLER_NOTES, {
          params: { target_type: targetType, target_id: targetId },
        })
      ),
    {
      enabled: Boolean(targetId),
      onError: handleError,
    }
  );
};

export default useHandlerNotesQuery;
