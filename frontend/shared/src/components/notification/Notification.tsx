import { Notification as HDSNotification } from 'hds-react';
import styled from 'styled-components';

const Notification = styled(HDSNotification)`
  font-size: ${(props) => props.theme.fontSize.body.s};
  line-height: ${(props) => props.theme.lineHeight.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export default Notification;
