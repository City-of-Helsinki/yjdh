import { TextInput } from 'hds-react';
import styled from 'styled-components';

export const $TextInput = styled(TextInput)`
  margin-bottom: ${(props) => !props.errorText && props.theme.spacing.m};
`;
