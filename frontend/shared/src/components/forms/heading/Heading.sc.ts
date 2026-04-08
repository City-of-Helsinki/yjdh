import styled, { CSSProp, DefaultTheme } from 'styled-components';

export type HeadingProps = {
  size?: keyof DefaultTheme['fontSize']['heading'];
  header?: string;
  loading?: boolean;
  loadingText?: string;
  loadingFinishedText?: string;
  tooltip?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
  'data-testid'?: string;
  weight?: string;
  $css?: CSSProp;
  children?: React.ReactNode;
};

export const $Header = styled.h1<HeadingProps>`
  ${(props: { theme: DefaultTheme } & HeadingProps) =>
    // eslint-disable-next-line unicorn/explicit-length-check
    props.size ? `font-size: ${props.theme.fontSize.heading[props.size]};` : ''}
  display: flex;
  align-items: center;
  gap: ${(props: { theme: DefaultTheme } & HeadingProps) =>
    props.theme.spacing.s};
  font-weight: ${(props: { theme: DefaultTheme } & HeadingProps) =>
    props.weight ? props.weight : '500'};
`;
