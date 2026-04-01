import { IconAlertCircle, IconCheckCircle } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

export const $Notification = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArmsLight};
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
`;

export const $IconCheckCircle = styled(IconCheckCircle)`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $NotificationMessage = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs} 0;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s} 0;
  display: flex;
  button {
    margin-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
    min-width: 200px;
  }
`;

export const $NotificationTitle = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.l};
  font-weight: 200;
`;
