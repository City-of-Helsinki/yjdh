import styled, { DefaultTheme } from 'styled-components';

export const $ApplicationStepperWrapper = styled.div`
  h1 {
    margin: 0 0 ${(props: { theme: DefaultTheme }) => props.theme.spacing.m}
      ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
  }

  hr {
    border: 1px solid
      ${(props: { theme: DefaultTheme }) => props.theme.colors.silver};
    margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  }
`;
