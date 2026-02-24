import { TextInputProps } from 'kesaseteli/employer/components/application/form/TextInput';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useGetEmploymentErrors from 'kesaseteli/employer/hooks/employments/useGetEmploymentErrors';
import React from 'react';
import theme from 'shared/styles/theme';
import Employment from 'shared/types/employment';

import { EmploymentAccordionFormContextProvider } from './AccordionFormContext';
import { $Accordion } from './EmploymentAccordion.sc';
import EmploymentAccordionForm from './EmploymentAccordionForm';
import EmploymentAccordionHeader from './EmploymentAccordionHeader';

type Props = {
  index: number;
};

const EmploymentAccordion: React.FC<Props> = ({ index }: Props) => {
  const { storageValue: isInitiallyOpen, persistToStorage } =
    useAccordionStateLocalStorage(index);

  const [isOpen, setIsOpen] = React.useState(isInitiallyOpen);

  const handleToggle = React.useCallback(
    (toggleOpen: boolean) => {
      persistToStorage(toggleOpen);
      setIsOpen(toggleOpen);
    },
    [persistToStorage]
  );

  const closeAccordion = React.useCallback(
    () => handleToggle(false),
    [handleToggle]
  );

  const hasError = Boolean(useGetEmploymentErrors(index));
  const displayError = hasError && !isOpen;
  const heading = (
    <EmploymentAccordionHeader index={index} displayError={displayError} />
  );
  const headerBackgroundColor = displayError
    ? theme.colors.errorLight
    : undefined;

  const getAccordionFieldId = React.useCallback(
    (field: keyof Employment): TextInputProps['id'] =>
      `summer_vouchers.${index}.${field}`,
    [index]
  );

  return (
    <$Accordion
      id={`accordion-${index}`}
      heading={heading}
      initiallyOpen={isOpen}
      onToggle={handleToggle}
      headerBackgroundColor={headerBackgroundColor}
    >
      <EmploymentAccordionFormContextProvider
        index={index}
        getAccordionFieldId={getAccordionFieldId}
        closeAccordion={closeAccordion}
      >
        <EmploymentAccordionForm />
      </EmploymentAccordionFormContextProvider>
    </$Accordion>
  );
};

export default EmploymentAccordion;
