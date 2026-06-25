import styled, { DefaultTheme } from 'styled-components';

type $DropdownWrapperProps = {
  errorText?: string;
  theme: DefaultTheme;
};

const dropdownWrapperShouldForwardProp = (prop: string): boolean =>
  prop !== 'errorText';

export const $DropdownWrapper = styled.div.withConfig({
  shouldForwardProp: dropdownWrapperShouldForwardProp,
})<$DropdownWrapperProps>`
  ${(props: $DropdownWrapperProps) =>
    props.errorText ? '' : `margin-bottom: ${props.theme.spacing.m};`}
`;
