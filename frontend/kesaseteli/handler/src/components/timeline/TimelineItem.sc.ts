import styled from 'styled-components';

import { TIMELINE_AVATAR_SIZE, TIMELINE_COLUMN_WIDTH } from './Timeline.sc';
import {
  getItemBackgroundColor,
  getItemBorderColor,
  NOTE_TYPE_CONFIGS,
  NoteItemType,
} from './TimelineTheme';

const getBorderColor = ({
  $type,
  $isImportant,
}: {
  $type: NoteItemType;
  $isImportant: boolean;
}): string => getItemBorderColor($type, $isImportant);

const getBackgroundColor = ({
  $type,
  $isImportant,
}: {
  $type: NoteItemType;
  $isImportant: boolean;
}): string => getItemBackgroundColor($type, $isImportant);

const getAvatarSize = ($size?: 'small' | 'large'): string =>
  $size === 'small'
    ? `${TIMELINE_AVATAR_SIZE.small}px`
    : `${TIMELINE_AVATAR_SIZE.large}px`;

const getSvgSize = ($size?: 'small' | 'large'): string =>
  $size === 'small' ? '14px' : '18px';

export const $TimelineItemCard = styled.li<{ $size?: 'small' | 'large' }>`
  --timeline-item-line-color: ${getBorderColor};
  --timeline-item-border-color: ${getBorderColor};
  --timeline-item-background-color: ${getBackgroundColor};

  --timeline-item-padding: ${({ $size }: { $size?: 'small' | 'large' }) =>
    $size === 'small'
      ? 'var(--spacing-xs) var(--spacing-s)'
      : 'var(--spacing-s) var(--spacing-m) var(--spacing-s) var(--spacing-s)'};
  position: relative;
  z-index: 0;
  display: grid;
  grid-template-columns: ${({ $size }: { $size?: 'small' | 'large' }) =>
      $size === 'small'
        ? `${TIMELINE_COLUMN_WIDTH.small}px`
        : `${TIMELINE_COLUMN_WIDTH.large}px`} 1fr;
  gap: var(--spacing-s);
  align-items: flex-start;
  /* TODO: border-right would bring some visual clarity, but it looks bad with current layout. */
  /*
  border-right: ${({ $size }: { $size?: 'small' | 'large' }) =>
    $size === 'small' ? '2px' : '3px'} solid var(--timeline-item-border-color);
  border-radius: 0 4px 4px 0;
  */
  background-color: var(--timeline-item-background-color);
  margin-bottom: var(--spacing-m);

  &&::before {
    background-color: var(--timeline-item-line-color);
  }
`;

export const $TimelineItemAvatar = styled.div<{
  $type: NoteItemType;
  $size?: 'small' | 'large';
}>`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }: { $size?: 'small' | 'large' }) => getAvatarSize($size)};
  height: ${({ $size }: { $size?: 'small' | 'large' }) => getAvatarSize($size)};
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ $type }: { $type: NoteItemType }) =>
    NOTE_TYPE_CONFIGS[$type]?.avatarBackground};
  color: ${({ $type }: { $type: NoteItemType }) =>
    NOTE_TYPE_CONFIGS[$type]?.avatarColor};

  svg {
    width: ${({ $size }: { $size?: 'small' | 'large' }) => getSvgSize($size)};
    height: ${({ $size }: { $size?: 'small' | 'large' }) => getSvgSize($size)};
    display: block;
  }
`;

export const $TimelineItemBody = styled.div<{ $size?: 'small' | 'large' }>`
  min-width: 0;
  flex-grow: 1;
  margin-top: ${({ $size }) =>
    $size === 'small' ? '2px' : 'var(--spacing-2-xs)'};
  padding-right: var(--spacing-s);
`;

export const $TimelineItemHeader = styled.strong`
  display: block;
  font-size: var(--fontsize-body-s);
  color: var(--color-black-70);
  font-weight: 500;
  margin-bottom: var(--spacing-3-xs);
`;

export const $TimelineItemContent = styled.div`
  font-size: var(--fontsize-body-s);
  color: var(--color-black-90);
  margin: 0 0 var(--spacing-3-xs);
  line-height: var(--lineheight-l);
  word-break: break-word;
`;

export const $TimelineItemLink = styled.a`
  font-size: var(--fontsize-body-s);
  color: var(--color-coat-of-arms);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--color-coat-of-arms-dark);
  }
`;
