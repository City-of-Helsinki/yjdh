import { NumberInputProps, TextAreaProps,TextInput, TextInputProps } from 'hds-react';
import styled from 'styled-components';

export type $TextInputProps = {
  $type: 'text' | 'decimal' | 'number' | 'textArea',
}

export const $TextInput = styled(TextInput)<$TextInputProps & (NumberInputProps | TextInputProps | TextAreaProps)>`
  ${(props) => !props.errorText ? `margin-bottom: ${props.theme.spacing.m};` : ''}
  ${(props) => props.$type === 'textArea' ?
      `&[style] {
          height: 208px !important;
       }` : ''}
`;
