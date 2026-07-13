import { IconEnvelope, IconPaperclip, IconSpeechbubbleText } from 'hds-react';
import React from 'react';

import { NoteType } from '../../types/note';

export type NoteItemType = NoteType | 'attachment';

export interface NoteTypeConfig {
  icon: React.ComponentType;
  background: string;
  avatarBackground: string;
  avatarColor: string;
  borderColor: string;
}

const COLOR_WHITE = 'var(--color-white)';

export const NOTE_TYPE_CONFIGS: Record<NoteItemType, NoteTypeConfig> = {
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
};

export const getItemBorderColor = (
  type: NoteItemType,
  isImportant?: boolean
): string => {
  if (isImportant) {
    return 'var(--color-alert)';
  }
  return NOTE_TYPE_CONFIGS[type]?.borderColor || 'var(--color-black-20)';
};

export const getItemBackgroundColor = (
  type: NoteItemType,
  isImportant?: boolean
): string => {
  if (isImportant) {
    return 'var(--color-alert-light)';
  }
  return NOTE_TYPE_CONFIGS[type]?.background || COLOR_WHITE;
};

export const getNoteTypeIcon = (type: NoteItemType): React.ComponentType =>
  NOTE_TYPE_CONFIGS[type]?.icon || IconSpeechbubbleText;
