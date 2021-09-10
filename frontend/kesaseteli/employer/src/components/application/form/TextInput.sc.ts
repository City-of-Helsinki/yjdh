import { TextInput as HdsTextInput } from 'hds-react';
import styled from 'styled-components';

export const $TextInput = styled(HdsTextInput)`
  margin-bottom: ${(props) => !props.errorText && props.theme.spacing.m};
`;
