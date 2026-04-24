import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/application';
import ContactInfo from 'shared/types/contact-info';
import Employment from 'shared/types/employment';
import { getFormApplication } from 'shared/utils/application.utils';

const EMPTY_VOUCHER: Employment = {
  summer_voucher_serial_number: '',
  attachments: [],
  employment_contract: [],
  payslip: [],
} as Employment;

const createEmptyVoucher = (): Employment => ({
  ...EMPTY_VOUCHER,
  attachments: [],
  employment_contract: [],
  payslip: [],
});

const ensureVoucherExists = (vouchers: Employment[]): Employment[] =>
  vouchers.length > 0 ? vouchers : [createEmptyVoucher()];

const mergeEmployerData = (application: Application): void => {
  const employerData = ApplicationPersistenceService.getEmployerData();
  if (!employerData) return;
  CONTACT_INFO_KEYS.forEach((key) => {
    if (!application[key]) {
      // eslint-disable-next-line no-param-reassign
      application[key] = employerData[key] as string;
    }
  });
};

const mergeUserValues = <T>(
  target: T,
  source: T | undefined,
  keys: (keyof T)[]
): void => {
  if (!source) return;
  keys.forEach((key) => {
    if (source[key] !== undefined && source[key] !== null) {
      // eslint-disable-next-line no-param-reassign
      target[key] = source[key];
    }
  });
};

const CONTACT_INFO_KEYS: (keyof ContactInfo)[] = [
  'contact_person_name',
  'contact_person_email',
  'contact_person_phone_number',
  'street_address',
  'bank_account_number',
];

const EMPLOYMENT_KEYS: (keyof Employment)[] = [
  'employee_name',
  'summer_voucher_serial_number',
  'employee_phone_number',
  'employment_postcode',
  'employment_start_date',
  'employment_end_date',
  'employment_work_hours',
  'employment_salary_paid',
  'employment_description',
  'hired_without_voucher_assessment',
];

const useResetApplicationFormValuesEffect = ({
  reset,
  getValues,
  formState: { isDirty },
}: UseFormReturn<Application>): void => {
  const { applicationQuery } = useApplicationApi();
  React.useEffect(() => {
    if (!applicationQuery.isSuccess || !applicationQuery.data) return;

    const currentValues = getValues();
    const application = getFormApplication(applicationQuery.data);
    const vouchers = ensureVoucherExists(application.summer_vouchers ?? []);
    application.summer_vouchers = vouchers;

    // Clever Fix: Because search inputs and date fields are often NOT immediately
    // persisted to the backend (read-only or draft state), we manually preserve
    // the user's current typed/selected values for these fields.
    //
    // Comparison Hierarchy:
    // 1. On Initial Load (isDirty === false): We trust (Server Data + SessionStorage Data).
    // 2. During Active Edit (isDirty === true): We trust (User Typed Value) over Server Data.
    if (currentValues && isDirty) {
      mergeUserValues(application, currentValues, CONTACT_INFO_KEYS);

      application.summer_vouchers = application.summer_vouchers.map((v, i) => {
        const current = currentValues.summer_vouchers?.[i];
        const updatedVoucher = { ...v };
        mergeUserValues(updatedVoucher, current, EMPLOYMENT_KEYS);
        return updatedVoucher;
      });
    }

    mergeEmployerData(application);

    reset(application, { keepDirty: isDirty });
  }, [reset, applicationQuery.isSuccess, applicationQuery.data, getValues]);
};

export default useResetApplicationFormValuesEffect;
