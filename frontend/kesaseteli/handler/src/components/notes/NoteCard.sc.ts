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

  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    /* Reduce padding and reset min-width for icon-only buttons (text is hidden via $ButtonText on mobile) */
    gap: var(--spacing-2-xs);

    & > * {
      padding-left: var(--spacing-2-xs) !important;
      padding-right: var(--spacing-2-xs) !important;
      min-width: auto !important;
    }
  }
`;

export const $ButtonText = styled.span`
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    /* Hide button text on mobile because full-width text buttons take up too much space */
    display: none;
  }
`;
