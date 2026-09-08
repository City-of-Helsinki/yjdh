import Application from 'kesaseteli-shared/types/application-form-data';
import Employment from 'kesaseteli-shared/types/employment';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const useValidateEmploymentsNotEmpty = (employments: Employment[]): void => {
  const { setError } = useFormContext<Application>();

  React.useEffect(() => {
    if (isEmpty(employments)) {
      setError('summer_vouchers', { type: 'minLength' });
    }
  }, [employments, setError]);
};
export default useValidateEmploymentsNotEmpty;
