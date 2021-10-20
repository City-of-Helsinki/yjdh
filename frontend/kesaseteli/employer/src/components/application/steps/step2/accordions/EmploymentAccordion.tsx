import AttachmentInput from 'kesaseteli/employer/components/application/form/AttachmentInput';
import DateInput from 'kesaseteli/employer/components/application/form/DateInput';
import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import TextInput, {
  TextInputProps,
} from 'kesaseteli/employer/components/application/form/TextInput';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useToggleSerialNumberInput from 'kesaseteli/employer/hooks/application/useToggleSerialNumberInput';
import useGetEmploymentErrors from 'kesaseteli/employer/hooks/employments/useGetEmploymentErrors';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionDivider from 'shared/components/forms/section/FormSectionDivider';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { CITY_REGEX, POSTAL_CODE_REGEX } from 'shared/constants';
import {
  EMPLOYEE_EXCEPTION_REASON,
  EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT,
} from 'shared/constants/employee-constants';
import theme from 'shared/styles/theme';
import Employment from 'shared/types/employment';
import { getDecimalNumberRegex } from 'shared/utils/regex.utils';

import AccordionActionButtons from './AccordionActionButtons';
import { $Accordion, $AccordionFormSection } from './EmploymentAccordion.sc';
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

  const getId = React.useCallback(
    (field: keyof Employment): TextInputProps['id'] =>
      `summer_vouchers.${index}.${field}`,
    [index]
  );

  const [showSerialNumberInput, toggleShowSerialNumberInput] =
    useToggleSerialNumberInput(index);

  return (
    <$Accordion
      id={`accordion-${index}`}
      heading={heading}
      initiallyOpen={isOpen}
      onToggle={handleToggle}
      headerBackgroundColor={headerBackgroundColor}
    >
      <$AccordionFormSection columns={2} withoutDivider>
        <TextInput
          id={getId('employee_name')}
          validation={{ required: true, maxLength: 256 }}
        />
        <TextInput
          id={getId('employee_ssn')}
          validation={{
            required: true,
            maxLength: 32, // eslint-disable-next-line security/detect-unsafe-regex
          }}
        />
        <SelectionGroup
          id={getId('summer_voucher_exception_reason')}
          showTitle={false}
          validation={{
            required: true,
          }}
          values={EMPLOYEE_EXCEPTION_REASON}
          onChange={toggleShowSerialNumberInput}
          $colSpan={2}
        />
        <FormSectionDivider $colSpan={2} />
        <TextInput
          id={getId('employee_home_city')}
          validation={{ required: true, pattern: CITY_REGEX, maxLength: 256 }}
        />
        <TextInput
          id={getId('employee_postcode')}
          type="number"
          validation={{
            required: true,
            pattern: POSTAL_CODE_REGEX,
            maxLength: 256,
          }}
        />
        <TextInput
          id={getId('employee_phone_number')}
          validation={{ required: true, maxLength: 64 }}
        />
        <TextInput
          id={getId('employment_postcode')}
          type="number"
          validation={{
            required: true,
            pattern: POSTAL_CODE_REGEX,
            maxLength: 256,
          }}
        />
        <FormSectionDivider $colSpan={2} />
        <TextInput
          id={getId('employee_school')}
          validation={{ required: true, maxLength: 256 }}
        />
        {showSerialNumberInput && (
          <TextInput
            id={getId('summer_voucher_serial_number')}
            validation={{ required: true, maxLength: 64 }}
          />
        )}
        <FormSectionDivider $colSpan={2} />
        <FormSectionHeading
          header={t('common:application.step2.attachments_section')}
          size="s"
          $colSpan={2}
        />
        <AttachmentInput
          index={index}
          id={getId('employment_contract')}
          required
        />
        <AttachmentInput index={index} id={getId('payslip')} required />
        <FormSectionDivider $colSpan={2} />
        <FormSectionHeading
          header={t('common:application.step2.employment_section')}
          size="s"
          $colSpan={2}
        />
        <DateInput
          id={getId('employment_start_date')}
          validation={{ required: true }}
        />
        <DateInput
          id={getId('employment_end_date')}
          validation={{ required: true }}
        />
        <TextInput
          id={getId('employment_work_hours')}
          type="decimal"
          validation={{
            required: true,
            maxLength: 18,
            pattern: getDecimalNumberRegex(2),
          }}
          helperFormat="######.##"
        />
        <TextInput
          $rowSpan={3}
          id={getId('employment_description')}
          type="textArea"
          placeholder={t(
            'common:application.step2.employment_description_placeholder'
          )}
        />
        <TextInput
          id={getId('employment_salary_paid')}
          validation={{
            required: true,
            maxLength: 18,
            pattern: getDecimalNumberRegex(2),
          }}
          type="decimal"
          helperFormat="######.##"
        />
        <SelectionGroup
          id={getId('hired_without_voucher_assessment')}
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
