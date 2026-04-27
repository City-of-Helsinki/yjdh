import { Button, TextInput as HdsTextInput } from 'hds-react';
import AttachmentInput from 'kesaseteli/employer/components/application/form/AttachmentInput';
import DateInput from 'kesaseteli/employer/components/application/form/DateInput';
import SelectionGroup from 'kesaseteli/employer/components/application/form/SelectionGroup';
import type { TextInputProps } from 'kesaseteli/employer/components/application/form/TextInput';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useIsForeignIban from 'kesaseteli/employer/hooks/application/useIsForeignIban';
import { Trans, useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionDivider from 'shared/components/forms/section/FormSectionDivider';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import LinkText from 'shared/components/link-text/LinkText';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { POSTAL_CODE_REGEX } from 'shared/constants';
import { EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT } from 'shared/constants/employee-constants';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';
import Employment from 'shared/types/employment';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
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
  const { getValues, setValue, control } = useFormContext<Application>();
  const { fetchEmployment, updateApplication } = useApplicationApi();

  // Use dedicated state instead of deriving from form values
  // This prevents the state from becoming false during form reset
  const [isEmployeeDataFetched, setIsEmployeeDataFetched] =
    useState<boolean>(false);

  const [employeePhoneNumber, employmentPostcode, employeeBirthdate] = useWatch(
    {
      control,
      name: [
        `summer_vouchers.${index}.employee_phone_number`,
        `summer_vouchers.${index}.employment_postcode`,
        `summer_vouchers.${index}.employee_birthdate`,
      ],
    }
  );

  // Set fetched state when phone number, postcode or birthdate is populated
  useEffect(() => {
    if (employeePhoneNumber || employmentPostcode || employeeBirthdate) {
      setIsEmployeeDataFetched(true);
    }
  }, [employeePhoneNumber, employmentPostcode, employeeBirthdate]);

  const handleGetEmployeeData = useCallback((): void => {
    const currentValues = getValues();
    const voucher = currentValues.summer_vouchers[index];

    const performFetch = (appData: DraftApplication | Application): void => {
      const currentValues = getValues();
      // Ensure the voucher we are processing has the ID from the server (if it was just created)
      const serverVoucherId = appData.summer_vouchers?.[index]?.id;
      if (serverVoucherId) {
        currentValues.summer_vouchers[index].id = serverVoucherId;
      }

      void fetchEmployment(currentValues, index, (app) => {
        const updatedVoucher = app.summer_vouchers[index];
        if (updatedVoucher) {
          setValue(`summer_vouchers.${index}`, updatedVoucher, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        setIsEmployeeDataFetched(true);
      });
    };

    if (voucher.id) {
      performFetch(getValues());
    } else {
      updateApplication(currentValues, (app) => performFetch(app));
    }
  }, [getValues, fetchEmployment, index, setValue, updateApplication]);

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

  const isForeignIban = useIsForeignIban();

  const getId = (field: keyof Employment): TextInputProps['id'] =>
    `summer_vouchers.${index}.${field}`;

  const [employeeBirthdate] = useWatch({
    control: useFormContext<Application>().control,
    name: [`summer_vouchers.${index}.employee_birthdate`],
  });

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
        <$GridCell>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore: HDS types are overly strict in this environment, bypassing for read-only field */}
          <HdsTextInput
            id="employee_birthdate_readonly"
            name="employee_birthdate_readonly"
            label={t('common:application.form.inputs.employee_birthdate')}
            value={convertToUIDateFormat(employeeBirthdate)}
            readOnly
            disabled={disableEmploymentFields}
            onChange={() => undefined}
          />
        </$GridCell>

        <TextInput
          id={getId('employee_phone_number')}
          validation={{ required: true, maxLength: 64 }}
          autoComplete="off"
          disabled={disableEmploymentFields}
        />
        <TextInput
          id={getId('employment_postcode')}
          validation={{
            required: true,
            pattern: POSTAL_CODE_REGEX,
            maxLength: 5,
          }}
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
          message={
            isForeignIban ? (
              <Trans
                i18nKey="common:application.form.helpers.payslip_foreign_iban"
                components={{
                  // href should get overridden (https://react.i18next.com/latest/trans-component#overriding-react-component-props-v11.5.0),
                  // but for some reason it does not. However, the setter works, when href is left as unset.
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore ts(2741) link href and text will be set / overridden with values from translation.
                  lnk: <LinkText target="_blank" rel="noopener noreferrer" />,
                }}
              />
            ) : undefined
          }
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
