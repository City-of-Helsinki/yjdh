import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

export const $DecisionCalculatorAccordion = styled.div`
  position: relative;

  &:not(:last-child) {
    margin-bottom: ${(props: { theme: DefaultTheme }) =>
      props.theme.spacing.xs};
  }

  div[role='heading'] > div[role='button'] > span.label {
    padding-left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  }
`;

export const $DecisionCalculatorAccordionIconContainer = styled.div`
  position: absolute;
  left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
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
    background-color: ${(props: { theme: DefaultTheme }) =>
      props.theme.colors.coatOfArmsLight};
  }
`;
