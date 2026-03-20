import styled, { DefaultTheme } from 'styled-components';

export const $GuideParagraphFirst = styled.p`
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l} 0
    ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
`;

export const $GuideParagraphSecond = styled.p`
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m} 0
    ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl2};
`;

export const $AlterationFormStickyBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacingLayout.xs2};
`;
