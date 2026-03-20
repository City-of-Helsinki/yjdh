import styled, { DefaultTheme } from 'styled-components';

export const $NoDecisionsText = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.l};
`;

export const $ButtonContainer = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl2};
`;
