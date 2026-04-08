import styled, { DefaultTheme } from 'styled-components';

export const $SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: ${({ theme }: { theme: DefaultTheme }) =>
    theme.colors.silverLight};
`;
