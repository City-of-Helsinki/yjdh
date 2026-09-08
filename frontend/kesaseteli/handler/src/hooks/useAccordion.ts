import noop from 'lodash/noop';
import React, { useState } from 'react';

export type AccordionConfig = {
  initiallyOpen: boolean;
  onToggle: (isOpen: boolean) => void;
};

export type AccordionButtonProps = {
  onClick: () => void;
  'aria-expanded': boolean;
};

export type AccordionContentProps = {
  style?: React.CSSProperties;
};

export type AccordionState = {
  isOpen: boolean;
  openAccordion: () => void;
  closeAccordion: () => void;
  toggleAccordion: () => void;
  buttonProps: AccordionButtonProps;
  contentProps: AccordionContentProps;
};

const useAccordion = ({
  initiallyOpen = false,
  onToggle = noop,
}: AccordionConfig): AccordionState => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const openAccordion = (): void => {
    setIsOpen(true);
  };

  const closeAccordion = (): void => {
    setIsOpen(false);
  };

  const toggleAccordion = (): void => {
    if (isOpen) {
      closeAccordion();
      onToggle(false);
    } else {
      openAccordion();
      onToggle(true);
    }
  };

  const buttonProps: AccordionButtonProps = {
    onClick: toggleAccordion,
    'aria-expanded': isOpen,
  };

  const contentProps: AccordionContentProps = {};
  if (isOpen === false) {
    contentProps.style = { display: 'none' };
  }

  React.useEffect(() => setIsOpen(initiallyOpen), [initiallyOpen, setIsOpen]);

  return {
    isOpen,
    openAccordion,
    closeAccordion,
    toggleAccordion,
    buttonProps,
    contentProps,
  };
};

export default useAccordion;
