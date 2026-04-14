import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/application';

/**
 * Hook to automatically persist form values to SessionStorage as the user types.
 * This ensures data survives page reloads even before a backend save occurs.
 */
const usePersistFormValuesEffect = ({
  watch,
  formState: { isDirty },
}: UseFormReturn<Application>): void => {
  const values = watch();

  React.useEffect(() => {
    if (!isDirty) return;

    // Persist Employer fields (Step 1)
    ApplicationPersistenceService.storeEmployerData(values);

    // Persist Voucher fields (especially search fields and manual inputs)
    // IMPORTANT: We sanitize the voucher to exclude derived fields (birthdate, SSN, etc.)
    // to prevent "zombie" results from leaking across search attempts.
    (values.summer_vouchers ?? []).forEach((voucher) => {
      const {
        employee_birthdate,
        employee_ssn,
        employee_school,
        employee_home_city,
        ...safeVoucher
      } = voucher;

      // Use serial number or ID as key to ensure we can retrieve it correctly
      const key = safeVoucher.id || safeVoucher.summer_voucher_serial_number;
      if (key) {
        ApplicationPersistenceService.storeVoucherSupplement(key, safeVoucher);
      }
    });
  }, [values, isDirty]);
};

export default usePersistFormValuesEffect;
