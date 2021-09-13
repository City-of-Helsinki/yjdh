import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useGetEmploymentErrors from 'kesaseteli/employer/hooks/employments/useGetEmploymentErrors';
import React from 'react';
import Accordion from 'shared/components/accordion/Accordion';
import { EMPLOYEE_EXCEPTION_REASON } from 'shared/contants/employee-constants';
import theme from 'shared/styles/theme';

import AccordionActionButtons from './AccordionActionButtons';
import {
  $AccordionContent,
  $EmploymentInputGrid,
} from './EmploymentAccordion.sc';
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

  const closeAccordion = React.useCallback(() => handleToggle(false), [handleToggle]);

  const hasError = Boolean(useGetEmploymentErrors(index));
  const displayError = hasError && !isOpen;
  const heading = (
    <EmploymentAccordionHeader index={index} displayError={displayError} />
  );
  const headerBackgroundColor = displayError
    ? theme.colors.errorLight
    : undefined;

  return (
    <Accordion
      id={`accordion-${index}`}
      heading={heading}
      initiallyOpen={isOpen}
      onToggle={handleToggle}
      headerBackgroundColor={headerBackgroundColor}
    >
      <$AccordionContent>
        <$EmploymentInputGrid>
          <TextInput
            id={`summer_vouchers.${index}.employee_name`}
            validation={{ required: true, maxLength: 256 }}
          />
          <TextInput
            id={`summer_vouchers.${index}.employee_ssn`}
            validation={{
              required: true,
              maxLength: 20, // eslint-disable-next-line security/detect-unsafe-regex
            }}
          />
          <SelectionGroup
            id={`summer_vouchers.${index}.summer_voucher_exception_reason`}
            validation={{
              required: true,
            }}
            values={EMPLOYEE_EXCEPTION_REASON}
          />
        </$EmploymentInputGrid>
        <AccordionActionButtons index={index} onSave={closeAccordion} />
      </$AccordionContent>
    </Accordion>
  );
};

export default EmploymentAccordion;
