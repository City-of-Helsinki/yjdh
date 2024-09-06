import styled, { DefaultTheme } from 'styled-components';

interface MainProps {
  $backgroundColor: keyof DefaultTheme['colors'];
  $isSidebarVisible: boolean;
}

export const $Main = styled.main<MainProps>`
  width: calc(100% - ${(props) => (props.$isSidebarVisible ? '520px' : '0px')});
  background-color: ${(props) =>
    props.$backgroundColor ? props.$backgroundColor : props.theme.colors.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  transition: width 0.225s ease-out;
`;
