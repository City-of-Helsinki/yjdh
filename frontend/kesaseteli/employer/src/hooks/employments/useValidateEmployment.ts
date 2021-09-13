import noop from 'lodash/noop';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Application from 'shared/types/employer-application';

type Options = {
  onSuccess: () => void
}

const useValidateEmployment = (index: number, {onSuccess }: Options = {onSuccess: noop }): () => Promise<void> => {
  const {
    trigger,
  } = useFormContext<Application>();

  return React.useCallback(async () => {
    const isValid = await trigger([`summer_vouchers.${index}`], {shouldFocus: true});
    if (isValid) {
      onSuccess();
    }
  }, [trigger, onSuccess, index]);
};

export default  useValidateEmployment
