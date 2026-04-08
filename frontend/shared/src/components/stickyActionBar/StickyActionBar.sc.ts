import styled, { DefaultTheme } from 'styled-components';

export const $Wrapper = styled.div`
  position: fixed;
  z-index: 101;
  background-color: ${(props: { theme: DefaultTheme }) => props.theme.colors.white};
  bottom: 0;
  width: 100%;
  box-shadow: 0 0 15px 0 rgba(45, 62, 80, 0.12);
`;

export const $StickyBarSpacing = styled.div`
  height: 80px;
`;
