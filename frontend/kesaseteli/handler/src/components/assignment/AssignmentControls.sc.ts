import Button from 'shared/components/button/Button';
import styled from 'styled-components';

export const $AssigneeName = styled.span`
  font-size: ${(props) => props.theme?.fontSize?.body?.l ?? '1.125rem'};
  color: ${(props) => props.theme?.colors?.black90 ?? 'var(--color-black-90)'};
`;

export const $AssigneeValueWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${(props) => props.theme?.spacing?.xs ?? 'var(--spacing-xs)'};
`;

export const $UnassignButton = styled(Button)`
  padding-left: 0;
`;
