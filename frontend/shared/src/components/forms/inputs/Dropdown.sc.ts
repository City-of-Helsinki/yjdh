import styled, { DefaultTheme } from 'styled-components';

type $DropdownWrapperProps = {
  errorText?: string;
  theme: DefaultTheme;
};

export const $DropdownWrapper = styled.div<$DropdownWrapperProps>`
  ${(props: $DropdownWrapperProps) =>
    !props.errorText ? `margin-bottom: ${props.theme.spacing.m};` : ''}
`;
