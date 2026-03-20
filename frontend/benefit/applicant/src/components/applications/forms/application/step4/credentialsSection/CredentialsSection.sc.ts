import styled, { DefaultTheme } from 'styled-components';

export const $Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.silverLight};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  padding-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $Heading = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.m};
  font-weight: 400;
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s} 0;
`;

export const $IconContainer = styled.span`
  svg {
    font-size: ${(props: { theme: DefaultTheme }) =>
      props.theme.fontSize.body.m};
  }
`;

export const $Description = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $ActionsContainer = styled.div`
  display: flex;
`;
