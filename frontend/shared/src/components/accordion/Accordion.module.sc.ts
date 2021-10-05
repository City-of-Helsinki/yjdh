import styled from 'styled-components';

import { AccordionProps } from './accordion.d';

export const $Accordion = styled.div<AccordionProps>`
  ${(props) =>
    !props.card
      ? `
    border-bottom: 1px solid ${props.theme.colors.black60};`
      : ''}
  ${(props) =>
    props.card
      ? `
    background-color: ${props.theme.colors.black60};
    padding-left: ${props.theme.spacing.m};
    padding-right: ${props.theme.spacing.m};
    `
      : ''};
  ${(props) => (props.border ? `border: 2px solid var(--color-black-60)` : '')};
`;

export const $AccordionHeader = styled.div<AccordionProps>`
  position: relative;
  background-color: ${(props) => props.headerBackgroundColor};
  color: ${(props) => props.theme.colors.black90};
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: bold;
  line-height: ${(props) => props.theme.lineHeight.m};
  padding-top: ${(props) => props.theme.spacing.m};
  padding-bottom: ${(props) => props.theme.spacing.m};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $AccordionContent = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
  line-height: ${(props) => props.theme.lineHeight.l};
  color: ${(props) => props.theme.colors.black90};
`;
export const $HeadingContainer = styled.div`
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
`;
