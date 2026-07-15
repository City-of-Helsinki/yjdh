import {
  APPLICATION_LIST_TYPES,
  ApplicationListType,
} from 'kesaseteli/handler/types/application';
import { TimelineItem } from 'kesaseteli/handler/types/timeline';
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
): UseQueryResult<TimelineItem[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  const timelineKey =
    applicationType === APPLICATION_LIST_TYPES.YOUTH
      ? getYouthApplicationTimelineKey(applicationId ?? '')
      : getEmployerApplicationTimelineKey(applicationId ?? '');

  return useQuery(
    timelineKey,
    () =>
      handleResponse<TimelineItem[]>(axios.get<TimelineItem[]>(timelineKey)),
    {
      enabled: Boolean(applicationId),
      onError: handleError,
    }
  );
};

export default useApplicationTimelineQuery;
