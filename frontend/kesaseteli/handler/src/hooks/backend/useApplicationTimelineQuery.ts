import { ApplicationListType } from 'kesaseteli/handler/types/application';
import { HandlerNote } from 'kesaseteli/handler/types/note';
import {
  getEmployerApplicationTimelineKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useApplicationTimelineQuery = (
  applicationId: string | undefined,
  applicationType: ApplicationListType
): UseQueryResult<HandlerNote[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  const timelineKey =
    applicationType === 'youth'
      ? getYouthApplicationTimelineKey(applicationId ?? '')
      : getEmployerApplicationTimelineKey(applicationId ?? '');

  return useQuery(
    timelineKey,
    () => handleResponse<HandlerNote[]>(axios.get<HandlerNote[]>(timelineKey)),
    {
      enabled: Boolean(applicationId),
      onError: handleError,
    }
  );
};

export default useApplicationTimelineQuery;
