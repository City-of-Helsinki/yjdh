import type { QueryClient } from '@tanstack/react-query';
import type { NoteTargetType } from 'kesaseteli/handler/types/note';
import {
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
  getHandlerNotesQueryKey,
  getYouthApplicationQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

const invalidateNoteQueries = (
  queryClient: QueryClient,
  targetType: NoteTargetType,
  targetId: string,
  parentApplicationId?: string
): Promise<void[]> => {
  const actions = [
    queryClient.invalidateQueries({
      queryKey: [getHandlerNotesQueryKey(targetType, targetId)],
    }),
    queryClient.invalidateQueries({
      queryKey: [getYouthApplicationTimelineKey(targetId)],
    }),
    queryClient.invalidateQueries({
      queryKey: [getEmployerApplicationTimelineKey(targetId)],
    }),
  ];

  if (parentApplicationId) {
    // Note: parentApplicationId is a globally unique UUID. It will only ever match either
    // a youth application or an employer application in the cache, but never both.
    // Invalidating both sets of keys simultaneously is safe and side-effect free, as
    // React Query will simply ignore the invalidation request for keys that don't exist.
    actions.push(
      queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationQueryKey(parentApplicationId)],
      }),
      queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationTimelineKey(parentApplicationId)],
      }),
      queryClient.invalidateQueries({
        queryKey: [getYouthApplicationQueryKey(parentApplicationId)],
      }),
      queryClient.invalidateQueries({
        queryKey: [getYouthApplicationTimelineKey(parentApplicationId)],
      })
    );
  }

  return Promise.all(actions);
};
export default invalidateNoteQueries;
