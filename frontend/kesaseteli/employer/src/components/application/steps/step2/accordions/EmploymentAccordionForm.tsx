import { Button } from 'hds-react';
import AttachmentInput from 'kesaseteli/employer/components/application/form/AttachmentInput';
import DateInput from 'kesaseteli/employer/components/application/form/DateInput';
import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useTargetGroupsQuery from 'kesaseteli/employer/hooks/backend/useTargetGroupsQuery';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FormSectionDivider from 'shared/components/forms/section/FormSectionDivider';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { CITY_REGEX, POSTAL_CODE_REGEX } from 'shared/constants';
import { EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT } from 'shared/constants/employee-constants';
import Application from 'shared/types/application';
import { getDecimalNumberRegex } from 'shared/utils/regex.utils';

import AccordionActionButtons from './AccordionActionButtons';
import { useEmploymentAccordionFormContext } from './AccordionFormContext';
import { $AccordionFormSection } from './EmploymentAccordion.sc';

/**
 * Hook to manage the state of the "Fetch Employee Data" button.
 * It determines whether the button should be enabled based on the current form values
 * for the employee name and voucher serial number.
 */
const useFetchEmployeeDataButtonState = (): {
  isFetchEmployeeDataEnabled: boolean;
  enableFetchEmployeeDataButton: () => void;
} => {
  const { getValues } = useFormContext<Application>();
  const { index } = useEmploymentAccordionFormContext();
  const [isFetchEmployeeDataEnabled, setIsFetchEmployeeDataEnabled] =
    useState<boolean>(false);

  const enableFetchEmployeeDataButton = useCallback(() => {
    const formDataVoucher = getValues().summer_vouchers[index];
    const integerStringRegex = /^\s*\d+\s*$/; // Allow leading and trailing whitespace
    setIsFetchEmployeeDataEnabled(
      formDataVoucher.employee_name.length > 0 &&
        typeof formDataVoucher.summer_voucher_serial_number === 'string' &&
        integerStringRegex.test(formDataVoucher.summer_voucher_serial_number)
    );
  }, [getValues, index]);

  useEffect(() => {
    enableFetchEmployeeDataButton();
  }, [enableFetchEmployeeDataButton]);

  return {
    isFetchEmployeeDataEnabled,
    enableFetchEmployeeDataButton,
  };
};

/**
 * Hook to handle fetching employee data from the API based on the voucher serial number.
 * It manages the fetching process and updates the application state upon success.
 */
const useFetchEmployeeData = (): {
  isEmployeeDataFetched: boolean;
  handleGetEmployeeData: () => void;
} => {
  const { getValues, reset } = useFormContext<Application>();
  const { fetchEmployment, applicationQuery } = useApplicationApi();
  const { index } = useEmploymentAccordionFormContext();
  const [isEmployeeDataFetched, setIsEmployeeDataFetched] =
    useState<boolean>(false);

  const handleGetEmployeeData = useCallback(() => {
    const handleReset = (): void => {
      reset(applicationQuery.data);
      setIsEmployeeDataFetched(true);
    };
    fetchEmployment(getValues(), index, handleReset);
  }, [getValues, fetchEmployment, index, reset, applicationQuery.data]);

  return {
    isEmployeeDataFetched,
    handleGetEmployeeData,
  };
};

const EmploymentAccordionForm: React.FC = () => {
  const { t } = useTranslation();
  const {
    index,
    closeAccordion,
    getAccordionFieldId: getId,
  } = useEmploymentAccordionFormContext();
  const { isFetchEmployeeDataEnabled, enableFetchEmployeeDataButton } =
    useFetchEmployeeDataButtonState();
  const { isEmployeeDataFetched, handleGetEmployeeData } =
    useFetchEmployeeData();
  const { data: targetGroups } = useTargetGroupsQuery();

  const targetGroupValues = targetGroups?.map((tg) => tg.id) || [];
  const getTargetGroupLabel = (value: string): string =>
    targetGroups?.find((tg) => tg.id === value)?.name || '';

  return (
    <$AccordionFormSection columns={2} withoutDivider>
      <TextInput
        id={getId('employee_name')}
        validation={{ required: true, maxLength: 256 }}
        onChange={enableFetchEmployeeDataButton}
        autoComplete="off"
        readOnly={isEmployeeDataFetched}
      />
      <TextInput
        id={getId('summer_voucher_serial_number')}
        validation={{ required: true, maxLength: 64 }}
        onChange={enableFetchEmployeeDataButton}
        autoComplete="off"
        readOnly={isEmployeeDataFetched}
      />
      {!isEmployeeDataFetched && (
        <Button
          onClick={handleGetEmployeeData}
          disabled={!isFetchEmployeeDataEnabled}
          variant="primary"
          theme="black"
        >
          {t('common:application.step2.fetch_employment')}
        </Button>
      )}
      {isEmployeeDataFetched && (
        <>
          <TextInput
            id={getId('employee_ssn')}
            validation={{
              required: true,
              maxLength: 32,
            }}
            autoComplete="off"
            readOnly
          />
          <SelectionGroup
            id={getId('target_group')}
            validation={{
              required: true,
            }}
            values={targetGroupValues}
            getValueText={getTargetGroupLabel}
            $colSpan={2}
          />
          <FormSectionDivider $colSpan={2} />
          <TextInput
            id={getId('employee_home_city')}
            validation={{
              required: true,
              pattern: CITY_REGEX,
              maxLength: 256,
            }}
          />
          <TextInput
            id={getId('employee_postcode')}
            type="number"
            validation={{
              required: true,
              pattern: POSTAL_CODE_REGEX,
              maxLength: 256,
            }}
            autoComplete="off"
          />
          <TextInput
            id={getId('employee_phone_number')}
            validation={{ required: true, maxLength: 64 }}
            autoComplete="off"
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
            autoComplete="off"
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
          <AccordionActionButtons
            index={index}
            disableSave={!isEmployeeDataFetched}
            onSave={closeAccordion}
          />
        </>
      )}
    </$AccordionFormSection>
  );
};

export default EmploymentAccordionForm;
