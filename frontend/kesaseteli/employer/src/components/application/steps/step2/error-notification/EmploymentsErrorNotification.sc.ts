import { Notification } from 'hds-react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $NotificationDescription = styled($GridCell)``;

export const $Notification = styled(Notification)`
  margin-bottom: ${(props) => props.theme.spacing.l};
`;
