import type { QueryClient } from '@tanstack/react-query';
import {
  APPLICATION_LIST_TYPES,
  ApplicationListType,
} from 'kesaseteli/handler/types/application';
import {
  BackendEndpoint,
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
  getYouthApplicationQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

export const APPLICATION_ENDPOINT_MAPPING = {
  [APPLICATION_LIST_TYPES.YOUTH]: BackendEndpoint.YOUTH_APPLICATIONS,
  [APPLICATION_LIST_TYPES.EMPLOYER]: BackendEndpoint.EMPLOYER_APPLICATIONS,
} as const;

export const APPLICATION_DETAIL_KEY_MAPPING = {
  [APPLICATION_LIST_TYPES.YOUTH]: getYouthApplicationQueryKey,
  [APPLICATION_LIST_TYPES.EMPLOYER]: getEmployerApplicationQueryKey,
} as const;

export const APPLICATION_TIMELINE_KEY_MAPPING = {
  [APPLICATION_LIST_TYPES.YOUTH]: getYouthApplicationTimelineKey,
  [APPLICATION_LIST_TYPES.EMPLOYER]: getEmployerApplicationTimelineKey,
} as const;

/**
 * Invalidates the react-query cache for application list, application detail,
 * and application timeline after an application is assigned or unassigned.
 */
const invalidateApplicationAssignmentQueries = (
  queryClient: QueryClient,
  applicationType: ApplicationListType,
  applicationId: string
): Promise<void[]> =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: [APPLICATION_ENDPOINT_MAPPING[applicationType]],
    }),
    queryClient.invalidateQueries({
      queryKey: [
        APPLICATION_DETAIL_KEY_MAPPING[applicationType](applicationId),
      ],
    }),
    queryClient.invalidateQueries({
      queryKey: [
        APPLICATION_TIMELINE_KEY_MAPPING[applicationType](applicationId),
      ],
    }),
  ]);

export default invalidateApplicationAssignmentQueries;
