import { ErrorSummary } from 'hds-react';
import styled from 'styled-components';

export const $ErrorSummary = styled(ErrorSummary)`
  margin-top: ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.l};
`;
