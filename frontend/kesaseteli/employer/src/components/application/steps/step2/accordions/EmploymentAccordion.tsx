import DateInput from 'kesaseteli/employer/components/application/form/DateInput';
import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useGetEmploymentErrors from 'kesaseteli/employer/hooks/employments/useGetEmploymentErrors';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionDivider from 'shared/components/forms/section/FormSectionDivider';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { DECIMAL_NUMBER_REGEX } from 'shared/constants';
import {
  EMPLOYEE_EXCEPTION_REASON,
  EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT,
} from 'shared/contants/employee-constants';
import theme from 'shared/styles/theme';

import AccordionActionButtons from './AccordionActionButtons';
import {
  $Accordion,
  $AccordionFormSection,
} from './EmploymentAccordion.sc';
import EmploymentAccordionHeader from './EmploymentAccordionHeader';

type Props = {
  index: number;
};

const EmploymentAccordion: React.FC<Props> = ({ index }: Props) => {
  const { t } = useTranslation();
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
    <$Accordion
      id={`accordion-${index}`}
      heading={heading}
      initiallyOpen={isOpen}
      onToggle={handleToggle}
      headerBackgroundColor={headerBackgroundColor}
    >
      <$AccordionFormSection columns={2} withoutDivider padding-bottom={false}>
   <TextInput
          id={`summer_vouchers.${index}.employee_name`}
          validation={{ required: true, maxLength: 256 }}
        />
        <TextInput
          id={`summer_vouchers.${index}.employee_ssn`}
          validation={{
            required: true,
            maxLength: 32, // eslint-disable-next-line security/detect-unsafe-regex
          }}
        />
        <SelectionGroup
          id={`summer_vouchers.${index}.summer_voucher_exception_reason`}
          showTitle={false}
          validation={{
            required: true,
          }}
          values={EMPLOYEE_EXCEPTION_REASON}
          $colSpan={2}
        />
        <FormSectionDivider $colSpan={2}/>
        <TextInput
          id={`summer_vouchers.${index}.employee_home_city`}
          validation={{ required: true, maxLength: 256 }}
        />
        <TextInput
          id={`summer_vouchers.${index}.employee_postcode`}
          validation={{ required: true, maxLength: 256 }}
        />
        <TextInput
          id={`summer_vouchers.${index}.employee_phone_number`}
          validation={{ required: true, maxLength: 64 }}
        />
        <TextInput
          id={`summer_vouchers.${index}.employment_postcode`}
          validation={{ required: true, maxLength: 256 }}
        />
        <FormSectionDivider $colSpan={2}/>
        <TextInput
          id={`summer_vouchers.${index}.summer_voucher_serial_number`}
          validation={{ required: true, maxLength: 64 }}
        />
        <TextInput
          id={`summer_vouchers.${index}.employee_school`}
          validation={{ required: true, maxLength: 256 }}
        />
        <FormSectionDivider $colSpan={2}/>
        <FormSectionHeading header={t('common:application.step2.attachments_section')} size="s" $colSpan={2} />
        <FormSectionDivider $colSpan={2}/>
        <FormSectionHeading header={t('common:application.step2.employment_section')} size="s" $colSpan={2} />
        <DateInput
          id={`summer_vouchers.${index}.employment_start_date`}
          validation={{ required: true }}
        />
        <DateInput
          id={`summer_vouchers.${index}.employment_end_date`}
          validation={{ required: true }}
        />
        <TextInput
          id={`summer_vouchers.${index}.employment_work_hours`}
          validation={{ required: true, maxLength: 18, pattern: DECIMAL_NUMBER_REGEX}}
          type='decimal'
        />
        <TextInput
          $rowSpan={3}
          id={`summer_vouchers.${index}.employment_description`}
          type='textArea'
        />
        <TextInput
          id={`summer_vouchers.${index}.employment_salary_paid`}
          validation={{ required: true, maxLength: 18, pattern: DECIMAL_NUMBER_REGEX }}
          type='decimal'
        />
        <SelectionGroup
          id={`summer_vouchers.${index}.employee_hired_without_voucher_assessment`}
          validation={{
            required: true,
          }}
          values={EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT}
        />
        <AccordionActionButtons index={index} onSave={closeAccordion} />
      </$AccordionFormSection>
    </$Accordion>
  );
};

export default EmploymentAccordion;
