import { HandlerNote, NoteTargetType, NoteType } from '../../../types/note';

export const fakeNote = (
  overrides?: Partial<HandlerNote>,
  index = 0
): HandlerNote => {
  const id = overrides?.id ?? `note-${index + 1}`;
  const timeOffset = index * 60 * 1000; // each note is 1 minute older than the previous
  const defaultCreated = new Date(Date.now() - timeOffset).toISOString();

  return {
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
  overrides?: Partial<HandlerNote>[] | ((index: number) => Partial<HandlerNote>)
): HandlerNote[] =>
  Array.from({ length: count }, (_, index) => {
    const override =
      typeof overrides === 'function'
        ? overrides(index)
        : overrides?.[index] ?? {};
    return fakeNote(override, index);
  });
