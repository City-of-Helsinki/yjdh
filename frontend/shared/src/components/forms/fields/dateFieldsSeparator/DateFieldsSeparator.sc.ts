import styled, { DefaultTheme } from 'styled-components';

export const $DateFieldsSeparator = styled.div`
  padding: 0 ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  font-weight: 500;
`;
