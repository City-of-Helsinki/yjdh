import { respondBelow } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $TableCaption = styled.span`
  font-weight: 500;
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $Subheading = styled.h3`
  font-weight: 500;
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $Calculation = styled.div`
  margin: ${(props) => props.theme.spacing.l} 0 0 0;

  fieldset legend {
    font-weight: 500;
  }
`;

export const $DateRange = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: stretch;
  margin-right: calc(${(props) => props.theme.spacing.xl} * -0.5);

  > * {
    flex: 1;
  }

  ${respondBelow('sm')`
    margin-right: 0;
  `};
`;

export const $DateRangeSeparator = styled.span`
  margin: ${(props) => props.theme.spacing.s} 0;
  font-size: ${(props) => props.theme.fontSize.body.xl};
  font-weight: 500;
  text-align: center;
  flex: 0 0 ${(props) => props.theme.spacing.xl};
`;

export const $HighlightWrapper = styled.div`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $ErrorContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.l};
`;
