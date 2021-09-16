import styled, { DefaultTheme } from 'styled-components';

type SpacingKeys = keyof DefaultTheme['spacing'];
type SpacingValue = DefaultTheme['spacing'][SpacingKeys];

type GridProps = {
  gap?: SpacingValue;
  columns?: number;
  bgColor?: boolean;
  bgHorizontalPadding?: boolean;
  bgVerticalPadding?: boolean;
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
};

type GridCellProps = {
  $colSpan?: number;
  $rowSpan?: number;
  $colStart?: number;
  alignSelf?: 'start' | 'end' | 'center' | 'stretch';
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
};

type HrProps = {
  $hasMarginBottom?: boolean;
};

export const $Section = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: ${(props) => props.theme.spacing.m};
  /* margin-bottom: ${(props) => props.theme.spacing.s}; */
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

export const $Hr = styled.hr<HrProps>`
  border: none;
  border-top: 1px solid ${(props) => props.theme.colors.black20};
  margin-top: ${(props) => props.theme.spacing.xl2};
  margin-bottom: ${(props) =>
    props.$hasMarginBottom ? props.theme.spacing.xl2 : 0};
  width: 100%;
`;
