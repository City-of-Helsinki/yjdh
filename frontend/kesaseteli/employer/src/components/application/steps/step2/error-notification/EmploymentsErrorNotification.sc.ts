import { Notification } from 'hds-react';
import styled from 'styled-components';

export const $Notification = styled(Notification)`
  margin-bottom: ${(props) => props.theme.spacing.l};
`;
