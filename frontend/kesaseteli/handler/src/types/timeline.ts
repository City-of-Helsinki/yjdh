import { HandlerNote } from './note';

export enum TimelineItemType {
  NOTE = 'note',
  ACTIVITY = 'activity',
}

export enum ActionType {
  APPLICATION_STATUS_CHANGE = 'application_status_change',
  ATTACHMENT_ADDED = 'attachment_added',
  ATTACHMENT_DELETED = 'attachment_deleted',
}

export type ActivityLogItem = {
  item_type: TimelineItemType.ACTIVITY;
  action_type: ActionType;
  /**
   * For status changes: The application's previous status.
   * For attachment additions: An empty string.
   * For attachment deletions: The filename of the deleted attachment.
   */
  old_value: string;
  /**
   * For status changes: The application's new status.
   * For attachment additions: The filename of the added attachment.
   * For attachment deletions: An empty string.
   */
  new_value: string;
  author_name: string;
  created_at: string;
  target_id?: string | null;
  target_type?: string | null;
};

export type TimelineNoteItem = HandlerNote & {
  item_type: TimelineItemType.NOTE;
};

export type TimelineItem = TimelineNoteItem | ActivityLogItem;
