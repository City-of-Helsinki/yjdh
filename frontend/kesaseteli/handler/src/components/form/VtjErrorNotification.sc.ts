import { Notification } from 'hds-react';
import styled from 'styled-components';

export const $Notification = styled(Notification)`
  ${(props) => (props.type === 'alert' ? `display: table-footer-group;` : '')}
  font-weight: 600;

  padding-bottom: 0px;
  & svg {
    position: relative;
    top: -3px;
  }
`;

export default $Notification;
