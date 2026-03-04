import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/application';
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

const mergeVoucherSupplements = (vouchers: Employment[]): Employment[] =>
  vouchers.map((voucher) => {
    const supplement = ApplicationPersistenceService.getVoucherSupplement(
      // For new vouchers (no ID), we use the serial number as the key if available
      voucher.id || voucher.summer_voucher_serial_number
    );
    return supplement ? { ...voucher, ...supplement } : voucher;
  });

const mergeEmployerData = (application: Application): void => {
  const employerData = ApplicationPersistenceService.getEmployerData();
  if (!employerData) return;
  Object.assign(application, {
    contact_person_name:
      application.contact_person_name || employerData.contact_person_name,
    contact_person_email:
      application.contact_person_email || employerData.contact_person_email,
    contact_person_phone_number:
      application.contact_person_phone_number ||
      employerData.contact_person_phone_number,
    street_address: application.street_address || employerData.street_address,
    bank_account_number:
      application.bank_account_number || employerData.bank_account_number,
  });
};

const useResetApplicationFormValuesEffect = ({
  reset,
}: UseFormReturn<Application>): void => {
  const { applicationQuery } = useApplicationApi();
  React.useEffect(() => {
    if (!applicationQuery.isSuccess || !applicationQuery.data) return;

    const application = getFormApplication(applicationQuery.data);
    const vouchers = ensureVoucherExists(application.summer_vouchers ?? []);
    application.summer_vouchers = mergeVoucherSupplements(vouchers);
    mergeEmployerData(application);

    reset(application, { keepDirty: false });
  }, [reset, applicationQuery.isSuccess, applicationQuery.data]);
};

export default useResetApplicationFormValuesEffect;
