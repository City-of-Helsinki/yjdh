import { TextInput } from 'hds-react';
import styled from 'styled-components';

export const $TextInput = styled(TextInput)<{ errorText?: string }>`
  ${(props) =>
    !props.errorText ? `margin-bottom: ${props.theme.spacing.m};` : ''}
`;
