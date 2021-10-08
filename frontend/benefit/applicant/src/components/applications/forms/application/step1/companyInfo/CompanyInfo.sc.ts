import { Notification as HDSNotification } from 'hds-react';
import styled from 'styled-components';

export const $CompanyInfoRow = styled.div`
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: ${(props) => props.theme.spacing.xs2};
`;

export const $Notification = styled(HDSNotification)`
  grid-area: notification;
  font-size: ${(props) => props.theme.fontSize.heading.xs};
`;
