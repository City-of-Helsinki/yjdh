import type { QueryClient } from '@tanstack/react-query';
import {
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

/**
 * Invalidates the react-query cache for an employer application and its timeline.
 *
 * This is used to force a refetch of the application state and timeline events
 * after an attachment is successfully uploaded or deleted.
 */
const invalidateEmployerAttachmentQueries = (
  queryClient: QueryClient,
  applicationId: string
): Promise<void[]> =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: [getEmployerApplicationQueryKey(applicationId)],
    }),
    queryClient.invalidateQueries({
      queryKey: [getEmployerApplicationTimelineKey(applicationId)],
    }),
  ]);

export default invalidateEmployerAttachmentQueries;
