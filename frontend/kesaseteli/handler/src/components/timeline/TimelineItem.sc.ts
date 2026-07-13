import styled from 'styled-components';

import {
  getItemBackgroundColor,
  getItemBorderColor,
  NOTE_TYPE_CONFIGS,
  NoteItemType,
} from './TimelineTheme';

export const $TimelineItemCard = styled.li<{ $size?: 'small' | 'large' }>`
  --timeline-item-line-color: ${({
    $type,
    $isImportant,
  }: {
    $type: NoteItemType;
    $isImportant: boolean;
  }) => getItemBorderColor($type, $isImportant)};

  --timeline-item-border-color: ${({
    $type,
    $isImportant,
  }: {
    $type: NoteItemType;
    $isImportant: boolean;
  }) => getItemBorderColor($type, $isImportant)};

  --timeline-item-background-color: ${({
    $type,
    $isImportant,
  }: {
    $type: NoteItemType;
    $isImportant: boolean;
  }) => getItemBackgroundColor($type, $isImportant)};

  --timeline-item-padding: ${({ $size }) =>
    $size === 'small'
      ? 'var(--spacing-xs) var(--spacing-s)'
      : 'var(--spacing-s) var(--spacing-m) var(--spacing-s) var(--spacing-s)'};
  position: relative;
  z-index: 0;
  display: grid;
  grid-template-columns: ${({ $size }) => ($size === 'small' ? '24px' : '40px')} 1fr;
  gap: var(--spacing-s);
  align-items: flex-start;
  /* TODO: border-right would bring some visual clarity, but it looks bad with current layout. */
  /*
  border-right: ${({ $size }) =>
    $size === 'small' ? '2px' : '3px'} solid var(--timeline-item-border-color);
  border-radius: 0 4px 4px 0;
  */
  background-color: var(--timeline-item-background-color);
  padding: var(--timeline-item-padding);
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
  width: ${({ $size }) => ($size === 'small' ? '24px' : '36px')};
  height: ${({ $size }) => ($size === 'small' ? '24px' : '36px')};
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ $type }) =>
    NOTE_TYPE_CONFIGS[$type as NoteItemType]?.avatarBackground};
  color: ${({ $type }) =>
    NOTE_TYPE_CONFIGS[$type as NoteItemType]?.avatarColor};

  svg {
    width: ${({ $size }) => ($size === 'small' ? '14px' : '18px')};
    height: ${({ $size }) => ($size === 'small' ? '14px' : '18px')};
    display: block;
  }
`;

export const $TimelineItemBody = styled.div<{ $size?: 'small' | 'large' }>`
  min-width: 0;
  flex-grow: 1;
  margin-top: ${({ $size }) =>
    $size === 'small' ? '2px' : 'var(--spacing-2-xs)'};
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
