/** Maps to the NoteType enum values on the backend. */
export enum NoteType {
  INTERNAL = 'internal',
  EXTERNAL_MESSAGE = 'external_message',
}

/**
 * The Django content-type model name for note targets.
 * Must match the lowercase model name the backend uses for ContentType lookups.
 */
export enum NoteTargetType {
  YOUTH_APPLICATION = 'youthapplication',
  EMPLOYER_APPLICATION = 'employerapplication',
  ATTACHMENT = 'attachment',
}

export type HandlerNote = {
  id: string;
  content: string;
  author_username: string;
  /** Display name returned by author.get_full_name() */
  author_name: string;
  note_type: NoteType;
  is_important: boolean;
  created_at: string;
  modified_at: string;
  target_type: NoteTargetType;
  target_id: string;
};

export type CreateNotePayload = {
  target_type: NoteTargetType;
  target_id: string;
  content: string;
  note_type: NoteType;
  is_important: boolean;
};

export type UpdateNotePayload = {
  content: string;
  note_type: NoteType;
  is_important: boolean;
};
