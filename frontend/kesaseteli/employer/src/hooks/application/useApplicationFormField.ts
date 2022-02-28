import useGetApplicationFormFieldLabel from 'kesaseteli/employer/hooks/application/useGetApplicationFormFieldLabel';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  Control,
  ErrorOption,
  FieldError,
  get,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';
import ApplicationFieldName from 'shared/types/application-field-name';
import Application from 'shared/types/application-form-data';
import Employment from 'shared/types/employment';
import { getLastValue } from 'shared/utils/array.utils';
import { convertToUIDateFormat, parseDate } from 'shared/utils/date.utils';
import { isDateObject } from 'shared/utils/type-guards';

type Value =
  | Application[keyof Application]
  | Employment
  | Employment[keyof Employment];

type ApplicationFormField<V extends Value> = {
  control: Control<Application>;
  register: UseFormRegister<Application>;
  fieldName: ApplicationFieldName;
  defaultLabel: string;
  getValue: () => V;
  watch: () => V;
  setValue: (value: V) => void;
  getError: () => FieldError | undefined;
  hasError: () => boolean;
  getErrorText: () => string | undefined;
  setError: (error: ErrorOption) => void;
  clearValue: () => void;
  trigger: () => Promise<boolean>;
  clearErrors: () => void;
  setFocus: () => void;
};

const useApplicationFormField = <V extends Value>(
  id: ApplicationFieldPath
): ApplicationFormField<V> => {
  const { t } = useTranslation();
  const {
    control,
    register,
    getValues,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState,
    setFocus,
    setError: setErrorF,
  } = useFormContext<Application>();
  const fieldName = (getLastValue((id as string).split('.')) ??
    '') as ApplicationFieldName;
  const defaultLabel = useGetApplicationFormFieldLabel(fieldName);

  const getValue = React.useCallback((): V => {
    const value = getValues(id) as string;
    if (isDateObject(parseDate(value))) {
      return convertToUIDateFormat(value) as V;
    }
    return value as V;
  }, [getValues, id]);

  const setValueF = React.useCallback(
    (value: V) => setValue(id, value),
    [setValue, id]
  );
  const watchF = React.useCallback(() => watch(id) as V, [watch, id]);
  const getError = React.useCallback(
    (): FieldError | undefined =>
      get(formState.errors, id) as FieldError | undefined,
    [formState, id]
  );
  const hasError = React.useCallback(() => Boolean(getError()), [getError]);

  const setError = React.useCallback(
    (error: ErrorOption) => setErrorF(id, error),
    [id, setErrorF]
  );

  const getErrorText = React.useCallback((): string | undefined => {
    const error = getError();
    if (!error) {
      return undefined;
    }
    const {message} = error;
    if (message) {
      return message;
    }
    switch (fieldName) {
      case 'summer_voucher_exception_reason':
      case 'hired_without_voucher_assessment':
        return t(`common:application.form.errors.selectionGroups`);

      case 'employment_contract':
      case 'payslip':
        return t(`common:application.form.errors.attachments`);

      default:
        return t(`common:application.form.errors.${error.type}`);
    }
  }, [fieldName, getError, t]);

  const clearValue = React.useCallback(() => setValue(id, ''), [setValue, id]);
  const triggerF = React.useCallback(
    () => trigger(id, { shouldFocus: true }),
    [trigger, id]
  );
  const clearErrorsF = React.useCallback(
    () => clearErrors(id),
    [clearErrors, id]
  );
  const setFocusF = React.useCallback(() => setFocus(id), [setFocus, id]);

  return {
    control,
    register,
    fieldName,
    defaultLabel,
    getValue,
    setValue: setValueF,
    watch: watchF,
    getError,
    hasError,
    getErrorText,
    setError,
    clearValue,
    trigger: triggerF,
    clearErrors: clearErrorsF,
    setFocus: setFocusF,
  };
};
export default useApplicationFormField;
