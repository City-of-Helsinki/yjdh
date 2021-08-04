import $, { DefaultTheme } from 'styled-components';

export interface SpacingProps {
  size: keyof DefaultTheme['spacing'];
}

const $Content = $.div<SpacingProps>`
  width: 100%;
  height: ${(props) => props.theme.spacing[props.size]};
`;

export { $Content };
