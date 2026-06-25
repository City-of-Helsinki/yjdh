import {
  NumberInputProps,
  TextAreaProps,
  TextInput,
  TextInputProps,
} from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

type StyledTextInputProps = {
  errorText?:
    | NumberInputProps['errorText']
    | TextAreaProps['errorText']
    | TextInputProps['errorText'];
  theme: DefaultTheme;
};

export const $TextInput = styled(TextInput)<StyledTextInputProps>`
  ${({ errorText, theme }: StyledTextInputProps) =>
    errorText ? '' : `margin-bottom: ${theme.spacing.m};`}
`;
