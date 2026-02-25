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
      reset(application);
    }
  }, [reset, applicationQuery.isSuccess, applicationQuery.data]);
};
export default useResetApplicationFormValuesEffect;
