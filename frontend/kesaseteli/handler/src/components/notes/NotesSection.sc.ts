import Button from 'shared/components/button/Button';
import styled from 'styled-components';

export const $NotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-l);
  width: 100%;
`;

export const $ShowAllButton = styled(Button)`
  margin-top: var(--spacing-s);
`;
