import styled, { DefaultTheme } from 'styled-components';

export const $Description = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xs};
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.l};
`;

export const $DateHeader = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.s};
  font-weight: 500;
`;

export const $HelpText = styled.p`
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black70};
`;
