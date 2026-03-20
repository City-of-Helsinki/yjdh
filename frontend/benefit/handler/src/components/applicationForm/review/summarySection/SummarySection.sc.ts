import styled, { DefaultTheme } from 'styled-components';

export const $Wrapper = styled.div`
  h2 {
    margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s} 0;
  }
`;
