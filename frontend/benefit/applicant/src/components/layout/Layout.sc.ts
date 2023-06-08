import styled, { DefaultTheme } from 'styled-components';

interface MainProps {
  $backgroundColor: keyof DefaultTheme['colors'];
}

export const $Main = styled.main<MainProps>`
  ${(props) => `
    background-color: ${props.theme.colors[props.$backgroundColor]};
  `}
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
`;
