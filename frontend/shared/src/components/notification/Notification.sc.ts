import { Notification } from 'hds-react';
import styled from 'styled-components';

export const $Notification = styled(Notification)`
  font-size: ${(props) => props.theme.fontSize.body.s};
  line-height: ${(props) => props.theme.lineHeight.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export default $Notification;
