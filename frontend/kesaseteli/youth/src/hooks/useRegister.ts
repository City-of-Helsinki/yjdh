import Voucher from 'kesaseteli/youth/types/voucher-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  FieldError,
  get,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import Id from 'shared/types/id';

type InputProps<T> = {
  id: Id<T>;
  errorText?: string;
  label: string;
  registerOptions?: RegisterOptions<T>;
};

const useRegister = <T = Voucher>(): ((
  id: Id<T>,
  registerOptions?: RegisterOptions<T>
) => InputProps<T>) => {
  const { t } = useTranslation();
  const { formState } = useFormContext<T>();

  const getErrorText = React.useCallback(
    (id: Id<T>): string | undefined => {
      const error = get(formState.errors, id) as FieldError | undefined;
      const errorType = error?.type;
      return errorType ? t(`common:errors.${errorType}`) : undefined;
    },
    [t, formState]
  );

  return React.useCallback(
    (id, registerOptions) => ({
      id,
      errorText: getErrorText(id),
      label: t(`common:applicationPage.form.${id as string}`),
      registerOptions,
    }),
    [t, getErrorText]
  );
};

export default useRegister;
