import styled, { DefaultTheme } from 'styled-components';

interface MainProps {
  $backgroundColor: keyof DefaultTheme['colors'];
  $isSidebarVisible: boolean;
  theme: DefaultTheme;
}

export const $Main = styled.main<MainProps>`
  width: calc(
    100% - ${(props: MainProps) => (props.$isSidebarVisible ? '520px' : '0px')}
  );
  background-color: ${(props: MainProps) =>
    props.$backgroundColor ? props.$backgroundColor : props.theme.colors.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  transition: width 0.225s ease-out;
`;
