import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';
import { respondBelow } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

type SpacingKeys = keyof DefaultTheme['spacing'];
type SpacingValue = DefaultTheme['spacing'][SpacingKeys];

export type FormSectionProps = {
  children?: React.ReactNode;
  action?: React.ReactNode;
  gridActions?: React.ReactNode;
  withoutDivider?: boolean;
  header?: string;
  headerLevel?: 'div' | 'h1' | 'h2' | 'h3' | 'h4';
  paddingBottom?: boolean;
  'aria-label'?: string;
} & HeadingProps &
  GridProps;

export type GridProps = {
  role?: React.HTMLAttributes<'div'>['role'];
  gap?: SpacingValue;
  rowGap?: SpacingValue;
  columnGap?: SpacingValue;
  columns?: number;
  bgColor?: boolean | string;
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
  padding-bottom: ${(props: { theme: DefaultTheme } & FormSectionProps) =>
    props.paddingBottom ? props.theme.spacing.l : ''};
  position: relative;
`;

type $SubHeaderProps = {
  weight?: string;
};

export const $SubHeader = styled.h3<$SubHeaderProps>`
  margin-top: 0;
  margin-bottom: 1em;
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xxs};
  font-weight: ${(props: $SubHeaderProps) =>
    props.weight ? props.weight : '600'};
`;

export const $Grid = styled.div.attrs<
  GridProps,
  Omit<GridProps, 'gap'> & { columnGap: SpacingValue; rowGap: SpacingValue }
>((props: { theme: DefaultTheme } & GridProps) => ({
  ...props,
  rowGap: props.rowGap || props.gap || props.theme.spacing.m,
  columnGap: props.columnGap || props.gap || props.theme.spacing.s,
}))<GridProps>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(
    ${(props: GridProps) => props.columns ?? 12},
    1fr
  );
  gap: ${(props: { columnGap: SpacingValue; rowGap: SpacingValue }) =>
    `${props.rowGap} ${props.columnGap}`};
  align-items: ${(props: GridProps) => props.alignItems ?? 'initial'};
  justify-items: ${(props: GridProps) => props.justifyItems ?? 'initial'};

  ${({
    bgColor,
    bgHorizontalPadding,
    bgVerticalPadding,
    gap,
    theme,
  }: { theme: DefaultTheme } & GridProps) =>
    bgColor &&
    `
    &::before {
      content: '';
      position: absolute;
      top: calc(-1 * ${String(bgVerticalPadding ? (gap ?? '0px') : '0px')});
      left: calc(-1 * ${String(bgHorizontalPadding ? (gap ?? '0px') : '0px')});
      right: calc(-1 * ${String(bgHorizontalPadding ? (gap ?? '0px') : '0px')});
      bottom: calc(-1 * ${String(bgVerticalPadding ? (gap ?? '0px') : '0px')});
      background-color: ${
        typeof bgColor === 'boolean' ? theme.colors.black5 : bgColor
      };
    }
  `}

  @media (max-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.m}) {
    & {
      display: flex;
      flex-direction: column;
    }
  }
`;

export const $GridCell = styled.div<GridCellProps>`
  position: relative;
  grid-column: ${(props: GridCellProps) => props.$colStart ?? 'auto'} / span
    ${(props: GridCellProps) => props.$colSpan ?? 1};
  grid-row: auto / span ${(props: GridCellProps) => props.$rowSpan ?? 1};
  align-self: ${(props: GridCellProps) => props.alignSelf ?? 'initial'};
  justify-self: ${(props: GridCellProps) => props.justifySelf ?? 'initial'};

  ${respondBelow('sm')`
    &:empty {
      display: none;
    }
  `};
`;

export const $Action = styled.div`
  position: absolute;
  right: 0;
`;

export const $Hr = styled.hr`
  border: none;
  border-top: 1px solid
    ${(props: { theme: DefaultTheme }) => props.theme.colors.black20};
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  width: 100%;
`;
