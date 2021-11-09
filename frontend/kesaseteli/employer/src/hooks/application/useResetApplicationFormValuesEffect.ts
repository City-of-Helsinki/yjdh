import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/application';

const useResetApplicationFormValuesEffect = ({
  reset,
}: UseFormReturn<Application>): void => {
  const { applicationQuery } = useApplicationApi();
  React.useEffect(() => {
    if (applicationQuery.isSuccess) {
      reset(applicationQuery.data);
    }
  }, [reset, applicationQuery.isSuccess, applicationQuery.data]);
};
export default useResetApplicationFormValuesEffect;
