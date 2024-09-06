import styled from 'styled-components';

type MainProps = {
  $isSidebarVisible: boolean;
};

export const $Main = styled.main<MainProps>`
  width: calc(100% - ${(props) => (props.$isSidebarVisible ? '520px' : '0px')});
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  transition: width 0.225s ease-out;
`;
