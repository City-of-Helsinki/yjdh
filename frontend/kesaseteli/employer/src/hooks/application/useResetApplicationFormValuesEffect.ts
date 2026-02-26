import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/application';
import Employment from 'shared/types/employment';
import { getFormApplication } from 'shared/utils/application.utils';

const useResetApplicationFormValuesEffect = ({
  reset,
}: UseFormReturn<Application>): void => {
  const { applicationQuery } = useApplicationApi();
  React.useEffect(() => {
    if (applicationQuery.isSuccess && applicationQuery.data) {
      const application = getFormApplication(applicationQuery.data);
      const vouchers = application.summer_vouchers ?? [];
      if (vouchers.length === 0) {
        vouchers.push({
          summer_voucher_serial_number: '',
          attachments: [],
          employment_contract: [],
          payslip: [],
        } as Employment);
      }
      application.summer_vouchers = vouchers.map((voucher) => {
        const supplement = ApplicationPersistenceService.getVoucherSupplement(
          voucher.id
        );
        return supplement ? { ...voucher, ...supplement } : voucher;
      });

      const employerData = ApplicationPersistenceService.getEmployerData();
      if (employerData) {
        Object.assign(application, {
          contact_person_name: application.contact_person_name || employerData.contact_person_name,
          contact_person_email: application.contact_person_email || employerData.contact_person_email,
          contact_person_phone_number: application.contact_person_phone_number || employerData.contact_person_phone_number,
          street_address: application.street_address || employerData.street_address,
          bank_account_number: application.bank_account_number || employerData.bank_account_number,
        });
      }

      reset(application);
    }
  }, [reset, applicationQuery.isSuccess, applicationQuery.data]);
};
export default useResetApplicationFormValuesEffect;
