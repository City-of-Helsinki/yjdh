import { IconEnvelope, IconHistory, IconPaperclip, IconSpeechbubbleText } from 'hds-react';
import React from 'react';

import { NoteType } from '../../types/note';

export type TimelineItemThemeType = NoteType | 'attachment' | 'activity';

export interface TimelineItemThemeConfig {
  icon: React.ComponentType;
  background: string;
  avatarBackground: string;
  avatarColor: string;
  borderColor: string;
}

const COLOR_WHITE = 'var(--color-white)';

export const TIMELINE_ITEM_THEME_CONFIGS: Record<TimelineItemThemeType, TimelineItemThemeConfig> = {
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
  attachment: {
    icon: IconPaperclip,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-black-10)',
    avatarColor: 'var(--color-black-70)',
    borderColor: 'var(--color-black-20)',
  },
  activity: {
    icon: IconHistory,
    background: COLOR_WHITE,
    avatarBackground: 'var(--color-tram-light)',
    avatarColor: 'var(--color-tram)',
    borderColor: 'var(--color-tram)',
  },
};

export const getItemBorderColor = (
  type: TimelineItemThemeType,
  isImportant?: boolean
): string => {
  if (isImportant) {
    return 'var(--color-alert)';
  }
  return TIMELINE_ITEM_THEME_CONFIGS[type]?.borderColor || 'var(--color-black-20)';
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

export const getTimelineIcon = (type: TimelineItemThemeType): React.ComponentType =>
  TIMELINE_ITEM_THEME_CONFIGS[type]?.icon || IconSpeechbubbleText;
