import { IconAlertCircle, IconCheckCircle } from 'hds-react';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

export const $Notification = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  background: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.fogLight};

  ${respondAbove('sm')`
    flex-direction: row;

  `}
`;

export const $NotificationRow = styled.div`
  display: flex;
  flex-flow: column;
  ${respondAbove('sm')`
    min-width: 13%;
  `}
`;

export const $IconCheck = styled(IconCheckCircle)`
  margin-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $NotificationMessage = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  margin: 0;
  white-space: pre-line;
  max-width: 670px;
  line-height: 1.6;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl} 0;
  ${respondAbove('sm')`
    display: flex;
  `}
  button {
    width: 100%;
    ${respondAbove('sm')`
    width: auto;
  `}
    margin-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
    margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  }
`;

export const $NotificationTitle = styled.h1`
  font-weight: 400;
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.l};
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs} 0
    ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl} 0;
`;
