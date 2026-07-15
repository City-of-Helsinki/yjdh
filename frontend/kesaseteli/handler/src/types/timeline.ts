import { HandlerNote } from './note';

export enum TimelineItemType {
  NOTE = 'note',
  ACTIVITY = 'activity',
}

export enum ActionType {
  APPLICATION_STATUS_CHANGE = 'application_status_change',
}

export type ActivityLogItem = {
  item_type: TimelineItemType.ACTIVITY;
  action_type: ActionType;
  old_value: string;
  new_value: string;
  author_name: string;
  created_at: string;
};

export type TimelineNoteItem = HandlerNote & {
  item_type: TimelineItemType.NOTE;
};

export type TimelineItem = TimelineNoteItem | ActivityLogItem;
