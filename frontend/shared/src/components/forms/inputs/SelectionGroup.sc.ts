import { SelectionGroup } from 'hds-react';
import styled from 'styled-components';

export const $SelectionGroup = styled(SelectionGroup)`
  ${(props) =>
    props.errorText ? '' : `margin-bottom: ${props.theme.spacing.m};`}
`;
