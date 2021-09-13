import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Accordion from 'shared/components/accordion/Accordion';
import theme from 'shared/styles/theme';
import EmployerApplication from 'shared/types/employer-application';

import AccordionActionButtons from './AccordionActionButtons';
import {
  $AccordionContent,
  $EmploymentInputGrid,
} from './EmploymentAccordion.sc';
import EmploymentAccordionHeader from './EmploymentAccordionHeader';
import { EMPLOYEE_EXCEPTION_REASON } from 'shared/contants/employee-constants';

type Props = {
  index: number;
};

const EmploymentAccordion: React.FC<Props> = ({ index }: Props) => {
  const { storageValue: isOpen, persistToStorage } =
    useAccordionStateLocalStorage(index);

  const onToggle = React.useCallback(
    (toggledValue: boolean) => {
      persistToStorage(!toggledValue);
    },
    [persistToStorage]
  );

  const {
    formState: { errors },
  } = useFormContext<EmployerApplication>();
  const hasError = Boolean(errors.summer_vouchers?.[index]);
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
      onToggle={onToggle}
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
        <AccordionActionButtons index={index} />
      </$AccordionContent>
    </Accordion>
  );
};

export default EmploymentAccordion;
