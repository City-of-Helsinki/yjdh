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
  }, [values, isDirty]);
};

export default usePersistFormValuesEffect;
