import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  APPLICATION_LIST_TYPES,
  ApplicationListType,
} from 'kesaseteli/handler/types/application';
import { TimelineItem } from 'kesaseteli/handler/types/timeline';
import {
  getEmployerApplicationTimelineKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

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

  const query = useQuery({
    queryKey: [timelineKey],
    queryFn: () =>
      handleResponse<TimelineItem[]>(axios.get<TimelineItem[]>(timelineKey)),
    enabled: Boolean(applicationId),
  });

  useQuerySideEffect(query, {
    onError: handleError,
  });

  return query;
};

export default useApplicationTimelineQuery;
