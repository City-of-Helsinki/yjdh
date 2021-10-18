import styled from 'styled-components';

import { AccordionProps } from './accordion.d';

export const $Accordion = styled.div<AccordionProps>`
  ${(props) =>
    !props.card
      ? `
    border-bottom: 1px solid var(--color-black-60)`
      : ''}
  ${(props) =>
    props.card
      ? `
    background-color: var(--color-black-60);
    padding-left: var(--spacing-m);
    padding-right: var(--spacing-m);
    `
      : ''};
  ${(props) => (props.border ? `border: 2px solid var(--color-black-60)` : '')};
`;

export const $AccordionHeader = styled.div<AccordionProps>`
  position: relative;
  background-color: ${(props) => props.headerBackgroundColor};
  color: var(--color-black-90);
  font-size: var(--fontsize-heading-m);
  font-weight: bold;
  line-height: var(--lineheight-m);
  padding-top: var(--spacing-m);
  padding-bottom: var(--spacing-m);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $AccordionContent = styled.div`
  font-size: var(--fontsize-body-m);
  line-height: var(--lineheight-l);
  color: var(-color-black-90);
`;
export const $HeadingContainer = styled.div`
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding-right: var(--spacing-m);
`;
