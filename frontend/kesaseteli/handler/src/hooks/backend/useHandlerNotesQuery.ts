import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { HandlerNote } from 'kesaseteli/handler/types/note';
import {
  BackendEndpoint,
  getHandlerNotesQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useHandlerNotesQuery = (
  targetType: string,
  targetId?: string
): UseQueryResult<HandlerNote[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  const query = useQuery({
    queryKey: [getHandlerNotesQueryKey(targetType, targetId ?? '')],
    queryFn: () =>
      handleResponse<HandlerNote[]>(
        axios.get<HandlerNote[]>(BackendEndpoint.HANDLER_NOTES, {
          params: { target_type: targetType, target_id: targetId },
        })
      ),
    enabled: Boolean(targetId),
  });

  useEffect(() => {
    if (query.isError) {
      handleError(query.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
};

export default useHandlerNotesQuery;
