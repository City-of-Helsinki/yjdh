import styled, { DefaultTheme } from 'styled-components';

interface MainProps {
  $backgroundColor: keyof DefaultTheme['colors'];
}

export const $Main = styled.main<MainProps>`
  background-color: ${(props) =>
    props.$backgroundColor ? props.$backgroundColor : props.theme.colors.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
`;
