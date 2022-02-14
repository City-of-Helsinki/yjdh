import {
  NumberInputProps,
  TextAreaProps,
  TextInput,
  TextInputProps,
} from 'hds-react';
import styled from 'styled-components';

export const $TextInput = styled(TextInput)<
  NumberInputProps | TextInputProps | TextAreaProps
>`
  ${(props) =>
    !props.errorText ? `margin-bottom: ${props.theme.spacing.m};` : ''}
`;
