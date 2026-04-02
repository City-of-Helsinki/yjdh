import styled from 'styled-components';

export const $DropdownWrapper = styled.div<{ errorText?: string }>`
  ${(props) =>
    !props.errorText ? `margin-bottom: ${props.theme.spacing.m};` : ''}
`;
