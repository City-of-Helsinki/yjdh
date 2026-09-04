import type { QueryClient } from '@tanstack/react-query';
import {
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

const invalidateAttachmentQueries = (
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

export default invalidateAttachmentQueries;
