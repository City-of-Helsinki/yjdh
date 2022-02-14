import { DateInput } from 'hds-react';
import styled from 'styled-components';

export const $DateInput = styled(DateInput)`
  margin-bottom: ${(props) => !props.errorText && props.theme.spacing.m};
`;
