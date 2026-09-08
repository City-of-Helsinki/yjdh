import { DateInput, DateInputProps } from 'hds-react';
import styled from 'styled-components';

export const $DateInput = styled(DateInput)<DateInputProps>`
  margin-bottom: ${(props) => !props.errorText && props.theme.spacing.m};
`;
