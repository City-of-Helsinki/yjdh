import styled, { DefaultTheme } from 'styled-components';

export const $FooterWrapper = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
`;
