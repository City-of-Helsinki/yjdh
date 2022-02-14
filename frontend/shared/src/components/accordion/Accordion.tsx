import { IconAngleDown, IconAngleUp } from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import useAccordion from 'shared/hooks/useAccordion';

import { AccordionProps } from './accordion.d';
import {
  $Accordion,
  $AccordionContent,
  $AccordionHeader,
  $HeadingContainer,
} from './Accordion.module.sc';

/**
 * 95% copy-paste from hds, can be deleted after hds supoorts initiallyOpen prop
 */
const Accordion: React.FC<AccordionProps> = (props: AccordionProps) => {
  const {
    children,
    heading,
    headingLevel = 2,
    id,
    initiallyOpen = false,
    onToggle = noop,
  } = props;

  const { isOpen, buttonProps, contentProps } = useAccordion({
    initiallyOpen,
    onToggle,
  });

  const angleIcon = isOpen ? <IconAngleUp /> : <IconAngleDown />;

  return (
    <$Accordion {...props} data-testid={`${id}-${isOpen ? 'open' : 'closed'}`}>
      <$AccordionHeader {...props}>
        <$HeadingContainer
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              buttonProps.onClick();
            }
          }}
          aria-labelledby={`${id}-heading`}
          {...buttonProps}
        >
          <div role="heading" aria-level={headingLevel} id={`${id}-heading`}>
            {heading}
          </div>
          {angleIcon}
        </$HeadingContainer>
      </$AccordionHeader>
      <$AccordionContent
        {...contentProps}
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-heading`}
      >
        {children}
      </$AccordionContent>
    </$Accordion>
  );
};
export default Accordion;
