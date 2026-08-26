import styled from 'styled-components';

export const $NotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-l);
  width: 100%;
`;

export const $Instructions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4-xs);
  padding: 1em;

  h3,
  p {
    margin: 0;
  }
`;
