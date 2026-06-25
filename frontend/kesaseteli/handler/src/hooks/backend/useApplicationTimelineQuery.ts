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
import { useEffect } from 'react';
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

  const query = useQuery({
    queryKey: [timelineKey],
    queryFn: () =>
      handleResponse<TimelineItem[]>(axios.get<TimelineItem[]>(timelineKey)),
    enabled: Boolean(applicationId),
  });

  useEffect(() => {
    if (query.isError) {
      handleError(query.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
};

export default useApplicationTimelineQuery;
