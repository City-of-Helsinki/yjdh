import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $DecisionCalculatorAccordion = styled.div`
  position: relative;

  &:not(:last-child) {
    margin-bottom: ${(props) => props.theme.spacing.xs};
  }

  div[role='heading'] > div[role='button'] > span.label {
    padding-left: ${(props) => props.theme.spacing.xl};
  }
`;

export const $DecisionCalculatorAccordionIconContainer = styled.div`
  position: absolute;
  left: ${(props) => props.theme.spacing.xs};
  top: ${(props) => props.theme.spacing.s};
  pointer-events: none;
  z-index: 1;
  padding: 2px 0;
`;

export const $CalculatorContainer = styled.div`
  ${respondAbove('md')`
    width: 75%;
  `};
`;

export const $Section = styled.div`
  &.subtotal {
    background-color: ${(props) => props.theme.colors.coatOfArmsLight};
  }
`;
