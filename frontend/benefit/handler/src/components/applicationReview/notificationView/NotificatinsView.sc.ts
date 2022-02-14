import { IconAlertCircle, IconCheck } from 'hds-react';
import styled from 'styled-components';

export const $Notification = styled.div`
  display: flex;
  flex-direction: column;
`;

export const $IconCheck = styled(IconCheck)`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $NotificationMessage = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.l};
  margin: 0;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props) => props.theme.spacing.xl} 0;
  display: flex;
  button {
    margin-right: ${(props) => props.theme.spacing.m};
    width: 200px;
  }
`;

export const $NotificationTitle = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.m};
`;
