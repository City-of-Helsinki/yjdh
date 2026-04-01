import { IconAlertCircle } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

export const $ErrorPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $ErrorPageMessage = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  margin: 0;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl} 0;
  display: flex;
  button {
    margin-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
    width: 200px;
  }
`;

export const $ErrorPageTitle = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.m};
`;
