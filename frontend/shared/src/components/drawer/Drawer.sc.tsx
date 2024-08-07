import styled from 'styled-components';

type DrawerProps = {
  stickyBarInUse?: boolean;
};

export const $Drawer = styled.aside<DrawerProps>`
  @keyframes animate-open {
    100% {
      margin-right: 0;
    }
  }

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 520px;
  margin-right: -520px;
  height: calc(100vh - ${(props) => (props.stickyBarInUse ? '80' : '0')}px);
  background-color: ${({ theme }) => theme.colors.white};
  z-index: 100;
  box-shadow: -2px 0px 10px 0px rgb(0 0 0 / 10%);
  display: flex;
  animation: animate-open 0.3s ease-out forwards;
  flex-direction: column;
  overflow: hidden;
`;

export const $Close = styled.div`
  @keyframes animate-open {
    100% {
      right: 520px;
    }
  }
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 ${({ theme }) => theme.spacing.s};
  right: 0px;
  animation: animate-open 0.3s ease-in-out forwards;

  box-shadow: -2px 0px 10px 0px rgb(0 0 0 / 10%);
  cursor: pointer;
`;

export const $Top = styled.div`
  margin: ${({ theme }) => theme.spacing.l} 0 ${({ theme }) => theme.spacing.l};
`;

export const $Title = styled.h3`
  color: ${({ theme }) => theme.colors.coatOfArms};
  padding-left: ${({ theme }) => theme.spacing.m};
  padding-right: ${({ theme }) => theme.spacing.xl3};
  padding-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.m};
  margin: 0;
`;

export const $CloseBtnWrapper = styled.div`
  position: absolute;
  right: 0;
  top: ${({ theme }) => theme.spacing.s};
`;

export const $Body = styled.div`
  display: flex;
  flex-grow: 1;
  overflow-y: scroll;
  & > div {
    width: 100%;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
  }
`;

export const $Bottom = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.m};
  background-color: ${({ theme }) => theme.colors.black5};
  padding-top: ${({ theme }) => theme.spacing.m};
  padding-bottom: ${({ theme }) => theme.spacing.m};
`;
