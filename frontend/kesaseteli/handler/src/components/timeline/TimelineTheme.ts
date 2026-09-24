import {
  IconDocument,
  IconEnvelope,
  IconHistory,
  IconPaperclip,
  IconSpeechbubbleText,
  IconUser,
} from 'hds-react';
import React from 'react';

import { NoteType } from '../../types/note';
import { ActionType } from '../../types/timeline';

export type TimelineItemThemeType = NoteType | ActionType;

export interface TimelineItemThemeConfig {
  icon: React.ComponentType;
  background: string;
  avatarBackground: string;
  avatarColor: string;
  borderColor: string;
}

const COLOR_WHITE = 'var(--color-white)';
const COLOR_METRO = 'var(--color-metro)';
const COLOR_METRO_DARK = 'var(--color-metro-dark)';
const COLOR_METRO_LIGHT = 'var(--color-metro-light)';

export const TIMELINE_ITEM_THEME_CONFIGS: Record<
  TimelineItemThemeType,
  TimelineItemThemeConfig
> = {
  [NoteType.INTERNAL]: {
    icon: IconSpeechbubbleText,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-coat-of-arms-light)',
    avatarColor: 'var(--color-coat-of-arms)',
    borderColor: 'var(--color-coat-of-arms)',
  },
  [NoteType.EXTERNAL_MESSAGE]: {
    icon: IconEnvelope,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-bus-light)',
    avatarColor: 'var(--color-bus)',
    borderColor: 'var(--color-bus)',
  },
  [ActionType.ATTACHMENT_ADDED]: {
    icon: IconPaperclip,
    background: COLOR_WHITE,
    avatarBackground: COLOR_METRO_LIGHT,
    avatarColor: COLOR_METRO_DARK,
    borderColor: COLOR_METRO,
  },
  [ActionType.ATTACHMENT_DELETED]: {
    icon: IconPaperclip,
    background: COLOR_WHITE,
    avatarBackground: COLOR_METRO_LIGHT,
    avatarColor: COLOR_METRO_DARK,
    borderColor: COLOR_METRO,
  },
  [ActionType.APPLICATION_STATUS_CHANGE]: {
    icon: IconHistory,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-tram-light)',
    avatarColor: 'var(--color-tram)',
    borderColor: 'var(--color-tram)',
  },
  [ActionType.ASSIGNEE_CHANGE]: {
    icon: IconUser,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-suomenlinna-light)',
    avatarColor: 'var(--color-suomenlinna-dark)',
    borderColor: 'var(--color-suomenlinna)',
  },
  [ActionType.APPLICATION_RECEIVED]: {
    icon: IconDocument,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-silver-light)',
    avatarColor: 'var(--color-black-50)',
    borderColor: 'var(--color-silver)',
  },
};

export const getItemBorderColor = (
  type: TimelineItemThemeType,
  isImportant?: boolean
): string => {
  if (isImportant) {
    return 'var(--color-alert)';
  }
  return (
    TIMELINE_ITEM_THEME_CONFIGS[type]?.borderColor || 'var(--color-black-20)'
  );
};

export const getItemBackgroundColor = (
  type: TimelineItemThemeType,
  isImportant?: boolean
): string => {
  if (isImportant) {
    return 'var(--color-alert-light)';
  }
  return TIMELINE_ITEM_THEME_CONFIGS[type]?.background || COLOR_WHITE;
};

export const getTimelineIcon = (
  type: TimelineItemThemeType
): React.ComponentType =>
  TIMELINE_ITEM_THEME_CONFIGS[type]?.icon || IconSpeechbubbleText;
