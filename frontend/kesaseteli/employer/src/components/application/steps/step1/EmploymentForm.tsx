import { Button } from 'hds-react';
import AttachmentInput from 'kesaseteli/employer/components/application/form/AttachmentInput';
import DateInput from 'kesaseteli/employer/components/application/form/DateInput';
import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import type { TextInputProps } from 'kesaseteli/employer/components/application/form/TextInput';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useTargetGroupsQuery from 'kesaseteli/employer/hooks/backend/useTargetGroupsQuery';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionDivider from 'shared/components/forms/section/FormSectionDivider';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { CITY_REGEX, POSTAL_CODE_REGEX } from 'shared/constants';
import { EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT } from 'shared/constants/employee-constants';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';
import Employment from 'shared/types/employment';
import { getFormApplication } from 'shared/utils/application.utils';
import { getDecimalNumberRegex } from 'shared/utils/regex.utils';

/**
 * Hook to manage the state of the "Fetch Employee Data" button.
 * It determines whether the button should be enabled based on the current form values
 * for the employee name and voucher serial number.
 */
const useFetchEmployeeDataButtonState = (
  index: number
): {
  isFetchEmployeeDataEnabled: boolean;
  enableFetchEmployeeDataButton: () => void;
} => {
  const { getValues } = useFormContext<Application>();
  const [isFetchEmployeeDataEnabled, setIsFetchEmployeeDataEnabled] =
    useState<boolean>(false);

  /* eslint-disable-next-line consistent-return */
  const enableFetchEmployeeDataButton = useCallback((): void => {
    const formDataVoucher = getValues().summer_vouchers[index];
    if (!formDataVoucher) return;
    const integerStringRegex = /^\s*\d+\s*$/; // Allow leading and trailing whitespace
    setIsFetchEmployeeDataEnabled(
      (formDataVoucher.employee_name?.length ?? 0) > 0 &&
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
const useFetchEmployeeData = (
  index: number
): {
  isEmployeeDataFetched: boolean;
  handleGetEmployeeData: () => void;
} => {
  const { getValues, reset, control } = useFormContext<Application>();
  const { fetchEmployment, updateApplication } = useApplicationApi();

  // Use dedicated state instead of deriving from form values
  // This prevents the state from becoming false during form reset
  const [isEmployeeDataFetched, setIsEmployeeDataFetched] =
    useState<boolean>(false);

  const employeeSsn = useWatch({
    control,
    name: `summer_vouchers.${index}.employee_ssn`,
  });

  // Set fetched state when SSN is populated
  useEffect(() => {
    if (employeeSsn) {
      setIsEmployeeDataFetched(true);
    }
  }, [employeeSsn]);

  const handleGetEmployeeData = useCallback((): void => {
    const currentValues = getValues();
    const voucher = currentValues.summer_vouchers[index];

    const handleReset = (app: Application): void => {
      // Don't reset the fetched state during form reset
      reset(getFormApplication(app));
    };

    const performFetch = (appData: Application | DraftApplication): void => {
      void fetchEmployment(appData, index, handleReset);
    };

    if (voucher.id) {
      performFetch(getValues());
    } else {
      updateApplication(currentValues, (app) => performFetch(app));
    }
  }, [getValues, fetchEmployment, index, reset, updateApplication]);

  return {
    isEmployeeDataFetched,
    handleGetEmployeeData,
  };
};

type Props = {
  index: number;
};

const EmploymentForm: React.FC<Props> = ({ index }) => {
  const { t } = useTranslation();

  const { isFetchEmployeeDataEnabled, enableFetchEmployeeDataButton } =
    useFetchEmployeeDataButtonState(index);
  const { isEmployeeDataFetched, handleGetEmployeeData } =
    useFetchEmployeeData(index);
  const { data: targetGroups } = useTargetGroupsQuery();

  const targetGroupValues = targetGroups?.map((tg) => tg.id) || [];
  const getTargetGroupLabel = (value: string): string =>
    targetGroups?.find((tg) => tg.id === value)?.name || '';

  const getId = (field: keyof Employment): TextInputProps['id'] =>
    `summer_vouchers.${index}.${field}`;

  const disableEmploymentFields = !isEmployeeDataFetched;

  return (
    <>
      <FormSection
        columns={2}
        withoutDivider
        header={t('common:application.step1.employment_section.header')}
        tooltip={t('common:application.step1.employment_section.tooltip')}
      >
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

        <Button
          onClick={handleGetEmployeeData}
          disabled={!isFetchEmployeeDataEnabled || isEmployeeDataFetched}
          variant="primary"
          theme="black"
        >
          {t('common:application.step1.employment_section.fetch_employment')}
        </Button>
      </FormSection>
      <FormSectionDivider $colSpan={2} />
      <FormSection columns={2} withoutDivider>
        <TextInput
          id={getId('employee_ssn')}
          validation={{
            required: true,
            maxLength: 32,
          }}
          autoComplete="off"
          disabled={disableEmploymentFields}
          readOnly={isEmployeeDataFetched}
        />
        <SelectionGroup
          id={getId('target_group')}
          validation={{
            required: true,
          }}
          values={targetGroupValues}
          getValueText={getTargetGroupLabel}
          $colSpan={2}
          disabled={disableEmploymentFields}
        />
        <FormSectionDivider $colSpan={2} />
        <TextInput
          id={getId('employee_home_city')}
          validation={{
            required: true,
            pattern: CITY_REGEX,
            maxLength: 256,
          }}
          disabled={disableEmploymentFields}
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
          disabled={disableEmploymentFields}
        />
        <TextInput
          id={getId('employee_phone_number')}
          validation={{ required: true, maxLength: 64 }}
          autoComplete="off"
          disabled={disableEmploymentFields}
        />
        <TextInput
          id={getId('employment_postcode')}
          type="number"
          validation={{
            required: true,
            pattern: POSTAL_CODE_REGEX,
            maxLength: 256,
          }}
          disabled={disableEmploymentFields}
        />
        <FormSectionDivider $colSpan={2} />
        <TextInput
          id={getId('employee_school')}
          validation={{ required: true, maxLength: 256 }}
          disabled={disableEmploymentFields}
        />
        <FormSectionDivider $colSpan={2} />
        <FormSectionHeading
          header={t(
            'common:application.step1.employment_section.attachments_section'
          )}
          size="s"
          $colSpan={2}
        />
        <AttachmentInput
          index={index}
          id={getId('employment_contract')}
          disabled={disableEmploymentFields}
          required
        />
        <AttachmentInput
          index={index}
          id={getId('payslip')}
          disabled={disableEmploymentFields}
          required
        />
        <FormSectionDivider $colSpan={2} />
        <FormSectionHeading
          header={t(
            'common:application.step1.employment_section.employment_section'
          )}
          size="s"
          $colSpan={2}
        />
        <DateInput
          id={getId('employment_start_date')}
          validation={{ required: true }}
          disabled={disableEmploymentFields}
        />
        <DateInput
          id={getId('employment_end_date')}
          validation={{ required: true }}
          disabled={disableEmploymentFields}
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
          disabled={disableEmploymentFields}
        />
        <TextInput
          $rowSpan={3}
          id={getId('employment_description')}
          type="textArea"
          placeholder={t(
            'common:application.step1.employment_section.employment_description_placeholder'
          )}
          autoComplete="off"
          disabled={disableEmploymentFields}
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
          disabled={disableEmploymentFields}
        />
        <SelectionGroup
          id={getId('hired_without_voucher_assessment')}
          validation={{
            required: true,
          }}
          values={EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT}
          disabled={disableEmploymentFields}
        />
      </FormSection>
    </>
  );
};

export default EmploymentForm;
