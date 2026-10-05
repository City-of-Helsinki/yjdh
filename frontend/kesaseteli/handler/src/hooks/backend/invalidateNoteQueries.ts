import type { QueryClient } from '@tanstack/react-query';
import { NoteTargetType } from 'kesaseteli/handler/types/note';
import {
  BackendEndpoint,
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
    // Invalidate external messages query for employer applications
    queryClient.invalidateQueries({
      queryKey: [BackendEndpoint.HANDLER_NOTES, targetId, 'external-messages'],
    }),
  ];

  // If the target is an application itself, invalidate its application query
  // to refresh the status displayed at the top of the page
  if (targetType === NoteTargetType.EMPLOYER_APPLICATION) {
    actions.push(
      queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationQueryKey(targetId)],
      })
    );
  } else if (targetType === NoteTargetType.YOUTH_APPLICATION) {
    actions.push(
      queryClient.invalidateQueries({
        queryKey: [getYouthApplicationQueryKey(targetId)],
      })
    );
  }

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
      }),
      // Invalidate external messages query for parent application too
      queryClient.invalidateQueries({
        queryKey: [BackendEndpoint.HANDLER_NOTES, parentApplicationId, 'external-messages'],
      })
    );
  }

  return Promise.all(actions);
};
export default invalidateNoteQueries;
