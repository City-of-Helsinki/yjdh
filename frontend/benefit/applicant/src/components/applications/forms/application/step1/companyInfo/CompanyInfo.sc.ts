import { $Notification as NotificationBase } from 'benefit/applicant/components/Notification/Notification.sc';
import styled from 'styled-components';

export const $CompanyInfoRow = styled.div`
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: ${(props) => props.theme.spacing.xs2};
`;

export const $Notification = styled(NotificationBase)`
  grid-area: notification;
`;
