import styled, { DefaultTheme } from 'styled-components';



export const $NoteCardContainer = styled.div``;

export const $NoteContent = styled.p`
  margin: var(--spacing-xs) 0;
  white-space: pre-wrap;
  word-break: break-word;
`;



export const $NoteActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
  margin-top: var(--spacing-xs);

  @media (max-width: ${({ theme }: { theme: DefaultTheme }) => theme.breakpoints.m}) {
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
  @media (max-width: ${({ theme }: { theme: DefaultTheme }) => theme.breakpoints.m}) {
    /* Hide button text on mobile because full-width text buttons take up too much space */
    display: none;
  }
`;
