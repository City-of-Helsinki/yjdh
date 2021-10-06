import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';
import styled, { DefaultTheme } from 'styled-components';

type SpacingKeys = keyof DefaultTheme['spacing'];
type SpacingValue = DefaultTheme['spacing'][SpacingKeys];

export type FormSectionProps = {
  children?: React.ReactNode;
  action?: React.ReactNode;
  withoutDivider?: boolean;
  header?: string;
  paddingBottom?: boolean;
} & HeadingProps &
  GridProps;

export type GridProps = {
  role?: React.HTMLAttributes<'div'>['role'];
  gap?: SpacingValue;
  columns?: number;
  bgColor?: boolean;
  bgHorizontalPadding?: boolean;
  bgVerticalPadding?: boolean;
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
};

export type GridCellProps = {
  $colSpan?: number;
  $rowSpan?: number;
  $colStart?: number;
  alignSelf?: 'start' | 'end' | 'center' | 'stretch';
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
};

export const $Section = styled.section<FormSectionProps>`
  display: flex;
  flex-direction: column;
  padding-bottom: ${(props) =>
    props.paddingBottom ? props.theme.spacing.m : ''};
  position: relative;
`;

export const $SubHeader = styled.h3`
  font-size: ${(props) => props.theme.fontSize.heading.xxs};
  font-weight: 600;
`;

export const $Grid = styled.div.attrs<
  GridProps,
  GridProps & { gap: SpacingValue }
>((props) => ({
  ...props,
  gap: props.gap || props.theme.spacing.s,
}))<GridProps>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns ?? 12}, 1fr);
  gap: ${(props) => props.gap};
  align-items: ${(props) => props.alignItems ?? 'initial'};
  justify-items: ${(props) => props.justifyItems ?? 'initial'};

  ${({ bgColor, bgHorizontalPadding, bgVerticalPadding, gap, theme }) =>
    bgColor &&
    `
    &::before {
      content: '';
      position: absolute;
      top: calc(-1 * ${bgVerticalPadding ? gap : '0px'});
      left: calc(-1 * ${bgHorizontalPadding ? gap : '0px'});
      right: calc(-1 * ${bgHorizontalPadding ? gap : '0px'});
      bottom: calc(-1 * ${bgVerticalPadding ? gap : '0px'});
      background-color: ${theme.colors.black5};
    }
  `}

  @media (max-width: ${(props) => props.theme.breakpoints.m}) {
    & {
      display: flex;
      flex-direction: column;
    }
  }
`;

export const $GridCell = styled.div<GridCellProps>`
  position: relative;
  grid-column: ${(props) => props.$colStart ?? 'auto'} / span
    ${(props) => props.$colSpan ?? 1};
  grid-row: auto / span ${(props) => props.$rowSpan ?? 1};
  align-self: ${(props) => props.alignSelf ?? 'initial'};
  justify-self: ${(props) => props.justifySelf ?? 'initial'};
`;

export const $Action = styled.div`
  position: absolute;
  right: 0;
`;

export const $Hr = styled.hr`
  border: none;
  border-top: 1px solid ${(props) => props.theme.colors.black20};
  margin-top: ${(props) => props.theme.spacing.xl2};
  width: 100%;
`;
