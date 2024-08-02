import styled from 'styled-components';

type MainProps = {
  isSidebarVisible: boolean;
};

export const $Main = styled.main<MainProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  width: calc(100% - ${(props) => (props.isSidebarVisible ? '520px' : '0px')});
  transition: width 0.225s ease-out;
`;
