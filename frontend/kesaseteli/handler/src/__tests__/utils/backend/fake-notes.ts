import { NoteTargetType, NoteType } from '../../../types/note';
import {
  ActionType,
  ActivityLogItem,
  TimelineItemType,
  TimelineNoteItem,
} from '../../../types/timeline';

export const fakeNote = (
  overrides?: Partial<TimelineNoteItem>,
  index = 0
): TimelineNoteItem => {
  const id = overrides?.id ?? `note-${index + 1}`;
  const timeOffset = index * 60 * 1000; // each note is 1 minute older than the previous
  const defaultCreated = new Date(Date.now() - timeOffset).toISOString();

  return {
    item_type: TimelineItemType.NOTE,
    id,
    content: `note ${index + 1}`,
    author_username: overrides?.author_username ?? 'user-1',
    author_name: 'Author 1',
    note_type: NoteType.INTERNAL,
    is_important: false,
    created_at: defaultCreated,
    modified_at: defaultCreated,
    target_type: NoteTargetType.YOUTH_APPLICATION,
    target_id: 'app-1',
    ...overrides,
  };
};

export const fakeNotes = (
  count: number,
  overrides?:
    | Partial<TimelineNoteItem>[]
    | ((index: number) => Partial<TimelineNoteItem>)
): TimelineNoteItem[] =>
  Array.from({ length: count }, (_, index) => {
    const override =
      typeof overrides === 'function'
        ? overrides(index)
        : overrides?.[index] ?? {};
    return fakeNote(override, index);
  });

export const fakeActivityLogItem = (
  overrides?: Partial<ActivityLogItem>,
  index = 0
): ActivityLogItem => {
  const timeOffset = index * 60 * 1000;
  const defaultCreated = new Date(Date.now() - timeOffset).toISOString();

  return {
    item_type: TimelineItemType.ACTIVITY,
    action_type: ActionType.APPLICATION_STATUS_CHANGE,
    old_value: 'submitted',
    new_value: 'additional_information_requested',
    author_name: 'Author 1',
    created_at: defaultCreated,
    ...overrides,
  };
};
