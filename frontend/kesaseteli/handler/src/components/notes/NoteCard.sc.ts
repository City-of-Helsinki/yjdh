import styled from 'styled-components';

import { NoteType } from '../../types/note';
import { NOTE_TYPE_CONFIGS, NoteItemType } from '../timeline/TimelineTheme';

export const $NoteCardContainer = styled.div``;

export const $NoteContent = styled.p`
  margin: var(--spacing-xs) 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const $NoteTypeBadge = styled.span<{ $type: NoteType }>`
  display: inline-block;
  font-size: var(--fontsize-body-xs);
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${({ $type }) =>
    NOTE_TYPE_CONFIGS[$type as NoteItemType]?.avatarBackground};
  color: var(--color-black-90);
  margin-right: var(--spacing-xs);
`;

export const $NoteActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
  margin-top: var(--spacing-xs);
`;


