import styled from 'styled-components';

import { AccordionProps } from './accordion.d';

type AccordionStyleProps = Pick<
  AccordionProps,
  'card' | 'border' | 'headerBackgroundColor'
>;

export const $Accordion = styled.div<AccordionStyleProps>`
  ${(props: AccordionStyleProps) =>
    !props.card
      ? `
    border-bottom: 1px solid var(--color-black-60)`
      : ''}
  ${(props: AccordionStyleProps) =>
    props.card
      ? `
    background-color: var(--color-black-60);
    padding-left: var(--spacing-m);
    padding-right: var(--spacing-m);
    `
      : ''};
  ${(props: AccordionStyleProps) =>
    props.border ? `border: 2px solid var(--color-black-60)` : ''};
`;

export const $AccordionHeader = styled.div<AccordionStyleProps>`
  position: relative;
  background-color: ${(props: AccordionStyleProps) =>
    props.headerBackgroundColor};
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
