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
  seen_at?: string | null;
};

export type CreateNotePayload = {
  target_type: NoteTargetType;
  target_id: string;
  content: string;
  note_type: NoteType;
  is_important: boolean;
  mark_as_additional_info_requested?: boolean;
};

export type UpdateNotePayload = {
  content: string;
  note_type: NoteType;
  is_important: boolean;
  mark_as_additional_info_requested?: boolean;
};

export enum EmployerExternalMessages {
  SIGNATURES_MISSING = 'signaturesMissing',
  HOLIDAY_COMPENSATION_MISSING = 'holidayCompensationMissing',
  TOO_SMALL_SALARY = 'tooSmallSalary',
  PAYROLL_MISSING = 'payrollMissing',
  NOT_ENOUGH_WORKING_HOURS = 'notEnoughWorkingHours',
  MINIMUM_WAGE = 'minimumWage',
  TYEL_MISSING = 'tyelMissing',
  THANK_YOU_FOR_INFORMATION = 'thankYouForInformation',
}
