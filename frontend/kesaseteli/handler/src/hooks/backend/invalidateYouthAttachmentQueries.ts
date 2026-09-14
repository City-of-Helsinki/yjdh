import type { QueryClient } from '@tanstack/react-query';
import {
  getYouthApplicationQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

const invalidateYouthAttachmentQueries = (
  queryClient: QueryClient,
  youthApplicationId: string
): Promise<void[]> =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: [getYouthApplicationQueryKey(youthApplicationId)],
    }),
    queryClient.invalidateQueries({
      queryKey: [getYouthApplicationTimelineKey(youthApplicationId)],
    }),
  ]);

export default invalidateYouthAttachmentQueries;
