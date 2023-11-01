import { breakpoints } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

type $ApplicationDetailWrapperProps = {
  $fontSize?: string;
};
type $ApplicationDetailRowProps = {
  $forceColumn?: boolean;
  $alignItems?: string;
};
type $ApplicationDetailValueProps = {
  $column?: boolean;
};

export const $ApplicationDetailWrapper = styled.dl<$ApplicationDetailWrapperProps>`
  font-size: ${(props) =>
    props.$fontSize ? String(props.$fontSize) : props.theme.fontSize.body.m};
`;

export const $ApplicationDetailLabel = styled.dt`
  min-width: calc(${(props) => props.theme.spacing.s} * 10);
  font-weight: 500;
  margin-right: ${(props) => props.theme.spacing.m};
`;

export const $ApplicationDetailValue = styled.dd<$ApplicationDetailValueProps>`
  margin-right: ${(props) => props.theme.spacing.xs};
  margin-inline-start: 0;
  display: ${(props) => (props.$column ? 'flex-start' : 'inline-flex')};
  svg {
    margin-left: ${(props) => props.theme.spacing.xs2};
  }
`;

export const $ApplicationDetailRow = styled.div<$ApplicationDetailRowProps>`
  display: flex;
  font-size: 1.1em;
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: calc(${(props) => props.theme.spacing.xl} / 2);
  align-items: ${(props) =>
    props.$alignItems ? props.$alignItems : 'flex-start'};
  flex-flow: column wrap;

  // Could not figure out syntax to use respondAbove('xs') with props :(
  @media screen and (min-width: ${breakpoints.xs}px) {
    flex-flow: ${(props) => (props.$forceColumn ? 'column wrap' : 'row')};
  }

  ${$ApplicationDetailLabel} {
    max-width: ${(props) =>
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
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: ${(props) => props.theme.spacing.xs};
  svg {
    margin-right: ${(props) => props.theme.spacing.xs};
    min-width: ${(props) => props.theme.spacing.m};
  }
`;
