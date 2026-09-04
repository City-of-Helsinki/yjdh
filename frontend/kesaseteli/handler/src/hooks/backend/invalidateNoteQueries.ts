import type { QueryClient } from '@tanstack/react-query';
import type { NoteTargetType } from 'kesaseteli/handler/types/note';
import {
  getEmployerApplicationQueryKey,
  getEmployerApplicationTimelineKey,
  getHandlerNotesQueryKey,
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
    actions.push(
      queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationQueryKey(parentApplicationId)],
      }),
      queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationTimelineKey(parentApplicationId)],
      })
    );
  }

  return Promise.all(actions);
};
export default invalidateNoteQueries;
