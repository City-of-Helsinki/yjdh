import styled from 'styled-components';

export const $StatusCard = styled.div`
  box-sizing: border-box;
  border: 1px solid var(--color-black-10);
  background-color: var(--color-black-5);
  padding: var(--spacing-m);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme?.spacing?.m ?? 'var(--spacing-m)'};
  width: 100%;
  margin-bottom: ${(props) => props.theme?.spacing?.xl ?? 'var(--spacing-xl)'};
`;

export const $FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme?.spacing?.xs2 ?? 'var(--spacing-xs2)'};
`;

export const $FieldLabel = styled.span`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme?.spacing?.xs2 ?? 'var(--spacing-xs2)'};
  font-size: ${(props) => props.theme?.fontSize?.body?.m ?? '1rem'};
  font-weight: 600;
  color: ${(props) => props.theme?.colors?.black60 ?? 'var(--color-black-60)'};
`;

export const $FieldValue = styled.div`
  font-size: ${(props) => props.theme?.fontSize?.body?.l ?? '1.125rem'};
  color: ${(props) => props.theme?.colors?.black90 ?? 'var(--color-black-90)'};
`;

export const $AssigneeHeading = styled.h4`
  margin: 0;
  font-size: ${(props) => props.theme?.fontSize?.body?.m ?? '1rem'};
  font-weight: 600;
  color: ${(props) => props.theme?.colors?.black60 ?? 'var(--color-black-60)'};
`;

export const $StatusValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs2};
`;
