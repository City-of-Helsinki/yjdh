import useGetApplicationFormFieldLabel from 'kesaseteli/employer/hooks/application/useGetApplicationFormFieldLabel';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
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
import {
  convertToUIDateFormat,
  isDateObject,
  parseDate,
} from 'shared/utils/date.utils';

type Value =
  | Application[keyof Application]
  | Employment
  | Employment[keyof Employment];

type ApplicationFormField<V extends Value> = {
  fieldName: ApplicationFieldName;
  defaultLabel: string;
  getValue: () => V | string;
  watch: () => V;
  setValue: (value: V) => void;
  getError: () => FieldError | undefined;
  getErrorText: () => string | undefined;
  setError: (type: ErrorOption['type']) => void;
  clearValue: () => void;
  trigger: () => Promise<boolean>;
  clearErrors: () => void;
  getSummaryText: () => string;
};

const useApplicationFormField = <V extends Value>(
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>
): ApplicationFormField<V> => {
  const { t } = useTranslation();
  const {
    getValues,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState,
    setError,
  } = useFormContext<Application>();
  const fieldName = (getLastValue((id as string).split('.')) ??
    '') as ApplicationFieldName;
  const defaultLabel = useGetApplicationFormFieldLabel(fieldName);

  const getValue = React.useCallback((): V | string => {
    const value = getValues(id) as string;
    if (isDateObject(parseDate(value))) {
      return convertToUIDateFormat(value);
    }
    return value as V;
  }, [getValues, id]);

  const getError = React.useCallback(
    (): FieldError | undefined =>
      get(formState.errors, id) as FieldError | undefined,
    [formState, id]
  );

  return React.useMemo(
    () => ({
      fieldName,
      defaultLabel,
      getValue,
      setValue: (value: V) => setValue(id, value),
      watch: () => watch(id) as V,
      getError,
      getErrorText: () => {
        const type = getError()?.type;
        return type ? t(`common:application.form.errors.${type}`) : undefined;
      },
      setError: (type: ErrorOption['type']) => setError(id, { type }),
      clearValue: () => setValue(id, ''),
      trigger: () => trigger(id, { shouldFocus: true }),
      clearErrors: () => clearErrors(id),
      getSummaryText: () => {
        const value = getValue();
        return `${defaultLabel}: ${value ? value.toString() : '-'}`;
      },
    }),
    [
      id,
      t,
      defaultLabel,
      clearErrors,
      fieldName,
      setValue,
      trigger,
      setError,
      watch,
      getValue,
      getError,
    ]
  );
};
export default useApplicationFormField;
