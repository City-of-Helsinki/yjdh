import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $ActionsContainer = styled($GridCell)`
  box-sizing: border-box;
  border: 1px solid var(--color-black-10);
  background-color: var(--color-black-5);
  padding: var(--spacing-m);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme?.spacing?.m ?? 'var(--spacing-m)'};
  width: 100%;
`;

export const $ActionsHeading = styled.h4`
  margin: 0;
  font-size: ${(props) => props.theme?.fontSize?.body?.m ?? '1rem'};
  font-weight: 600;
  color: ${(props) => props.theme?.colors?.black90 ?? 'var(--color-black-90)'};
`;

export const $ButtonsRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme?.spacing?.m ?? 'var(--spacing-m)'};
  flex-wrap: wrap;
`;
