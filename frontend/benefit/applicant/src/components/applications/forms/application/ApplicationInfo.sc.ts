import { breakpoints } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

type $ApplicationDetailWrapperProps = {
  $fontSize?: string;
  theme: DefaultTheme;
};
type $ApplicationDetailRowProps = {
  $forceColumn?: boolean;
  $alignItems?: string;
  theme: DefaultTheme;
};
type $ApplicationDetailValueProps = {
  $column?: boolean;
  theme: DefaultTheme;
};

export const $ApplicationDetailWrapper = styled.dl<$ApplicationDetailWrapperProps>`
  font-size: ${(props: $ApplicationDetailWrapperProps) =>
    props.$fontSize ? String(props.$fontSize) : props.theme.fontSize.body.m};
`;

export const $ApplicationDetailLabel = styled.dt`
  min-width: calc(
    ${(props: $ApplicationDetailWrapperProps) => props.theme.spacing.s} * 10
  );
  font-weight: 500;
  margin-right: ${(props: $ApplicationDetailWrapperProps) =>
    props.theme.spacing.m};
`;

export const $ApplicationDetailValue = styled.dd<$ApplicationDetailValueProps>`
  margin-right: ${(props: $ApplicationDetailValueProps) =>
    props.theme.spacing.xs};
  margin-inline-start: 0;
  display: ${(props: $ApplicationDetailValueProps) =>
    props.$column ? 'flex-start' : 'inline-flex'};
  svg {
    margin-left: ${(props: $ApplicationDetailValueProps) =>
      props.theme.spacing.xs2};
  }
`;

export const $ApplicationDetailRow = styled.div<$ApplicationDetailRowProps>`
  display: flex;
  font-size: 1.1em;
  line-height: ${(props: $ApplicationDetailRowProps) =>
    props.theme.lineHeight.l};
  margin-bottom: calc(
    ${(props: $ApplicationDetailRowProps) => props.theme.spacing.xl} / 2
  );
  align-items: ${(props: $ApplicationDetailRowProps) =>
    props.$alignItems ? props.$alignItems : 'flex-start'};
  flex-flow: column wrap;

  // Could not figure out syntax to use respondAbove('xs') with props :(
  @media screen and (min-width: ${breakpoints.xs}px) {
    flex-flow: ${(props: $ApplicationDetailRowProps) =>
      props.$forceColumn ? 'column wrap' : 'row'};
  }

  ${$ApplicationDetailLabel} {
    max-width: ${(props: $ApplicationDetailRowProps) =>
      props.$forceColumn ? 'none' : `calc(${props.theme.spacing.s} * 10)`};
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const $HintText = styled.section`
  display: flex;
  flex-flow: row;
  font-size: 1.1em;
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.l};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  svg {
    margin-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
    min-width: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  }
`;
