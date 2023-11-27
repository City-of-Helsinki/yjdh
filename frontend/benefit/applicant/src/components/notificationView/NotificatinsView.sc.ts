import { IconAlertCircle, IconCheckCircle } from 'hds-react';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $Notification = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.l};
  background: ${(props) => props.theme.colors.fogLight};

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
  margin-right: ${(props) => props.theme.spacing.l};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $NotificationMessage = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin: 0;
  white-space: pre-line;
  max-width: 670px;
  line-height: 1.6;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props) => props.theme.spacing.xl} 0;
  ${respondAbove('sm')`
    display: flex;
  `}
  button {
    width: 100%;
    ${respondAbove('sm')`
    width: auto;
  `}
    margin-right: ${(props) => props.theme.spacing.m};
    margin-bottom: ${(props) => props.theme.spacing.m};
  }
`;

export const $NotificationTitle = styled.h1`
  font-weight: 400;
  font-size: ${(props) => props.theme.fontSize.heading.l};
  margin: ${(props) => props.theme.spacing.xs} 0
    ${(props) => props.theme.spacing.xl} 0;
`;
