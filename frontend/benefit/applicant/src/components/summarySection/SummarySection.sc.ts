import styled, { DefaultTheme } from 'styled-components';

export const $Wrapper = styled.div`
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
  h2 {
    font-size: ${(props: { theme: DefaultTheme }) =>
      props.theme.fontSize.heading.m};
    margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s} 0;
  }
`;
