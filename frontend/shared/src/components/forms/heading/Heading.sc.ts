import $, { DefaultTheme } from 'styled-components';

export interface HeadingProps {
  size: keyof DefaultTheme['fontSize']['heading'];
}

export const $Header = $.h1<HeadingProps>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.s};
  font-size: ${(props) => props.theme.fontSize.heading[props.size]};
  font-weight: 500;
  margin-bottom: ${(props) => props.theme.spacing.l};
`;
