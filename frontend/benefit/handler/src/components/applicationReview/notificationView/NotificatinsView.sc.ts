import { IconAlertCircle, IconCheckCircle } from 'hds-react';
import styled from 'styled-components';

export const $Notification = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.coatOfArmsLight};
  margin: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.xl};
`;

export const $IconCheckCircle = styled(IconCheckCircle)`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $NotificationMessage = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.l};
  margin: ${(props) => props.theme.spacing.xs} 0;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props) => props.theme.spacing.s} 0;
  display: flex;
  button {
    margin-right: ${(props) => props.theme.spacing.m};
    min-width: 200px;
  }
`;

export const $NotificationTitle = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.l};
  font-weight: 200;
`;
