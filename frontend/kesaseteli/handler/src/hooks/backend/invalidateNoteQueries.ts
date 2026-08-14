import type { QueryClient } from '@tanstack/react-query';
import type { NoteTargetType } from 'kesaseteli/handler/types/note';
import {
  getEmployerApplicationTimelineKey,
  getHandlerNotesQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';

const invalidateNoteQueries = (
  queryClient: QueryClient,
  targetType: NoteTargetType,
  targetId: string
): Promise<void[]> =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: [getHandlerNotesQueryKey(targetType, targetId)],
    }),
    queryClient.invalidateQueries({
      queryKey: [getYouthApplicationTimelineKey(targetId)],
    }),
    queryClient.invalidateQueries({
      queryKey: [getEmployerApplicationTimelineKey(targetId)],
    }),
  ]);

export default invalidateNoteQueries;
