import { Checkbox } from 'hds-react';
import styled from 'styled-components';

export const $Checkbox = styled(Checkbox)`
  ${(props) =>
    !props.errorText ? `margin-bottom: ${props.theme.spacing.m};` : ''}
`;
