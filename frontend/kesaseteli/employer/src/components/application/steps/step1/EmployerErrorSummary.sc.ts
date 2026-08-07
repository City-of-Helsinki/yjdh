import { Notification } from 'hds-react';
import styled from 'styled-components';

export const $ErrorSummary = styled(Notification)`
  margin-top: ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.l};
`;
