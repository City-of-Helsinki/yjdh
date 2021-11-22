import { SelectionGroup } from 'hds-react';
import styled from 'styled-components';

export const $SelectionGroup = styled(SelectionGroup)`
  margin-bottom: ${(props) => !props.errorText && props.theme.spacing.m};
`;
