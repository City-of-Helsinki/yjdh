import React from 'react';
import { useFormContext } from 'react-hook-form';
import Application from 'shared/types/application-form-data';
import Employment from 'shared/types/employment';
import { isEmpty } from 'shared/utils/array.utils';

const useValidateEmploymentsNotEmpty = (employments: Employment[]): void => {
  const { setError } = useFormContext<Application>();

  React.useEffect(() => {
    if (isEmpty(employments)) {
      setError('summer_vouchers', { type: 'minLength' });
    }
  }, [employments, setError]);
};
export default useValidateEmploymentsNotEmpty;
