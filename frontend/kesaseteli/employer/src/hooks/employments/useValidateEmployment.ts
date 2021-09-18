import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import noop from 'lodash/noop';
import React from 'react';

type Options = {
  onSuccess: () => void
}

const useValidateEmployment = (index: number, {onSuccess }: Options = {onSuccess: noop }): () => Promise<void> => {
  const {
    trigger,
  } = useApplicationFormField(`summer_vouchers.${index}`);
  return React.useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      onSuccess();
    }
  }, [trigger, onSuccess]);
};

export default  useValidateEmployment
