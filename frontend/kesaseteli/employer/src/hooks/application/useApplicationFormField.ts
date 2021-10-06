import React from 'react';
import {
  ErrorOption,
  FieldError,
  get,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';
import Application from 'shared/types/employer-application';
import Employment from 'shared/types/employment';
import { getLastValue } from 'shared/utils/array.utils';

type Key = keyof Application | keyof Employment;
type Value = Application[keyof Application] | Employment[keyof Employment]

type ApplicationFormField<V extends Value> = {
  fieldName: Key;
  getValue: () => V;
  watch: () => V;
  setValue: (value: V) => void;
  getError: () => FieldError | undefined;
  setError: (type: ErrorOption['type']) => void;
  clearValue: () => void;
  trigger: () => Promise<boolean>;
  clearErrors: () => void;
};

const useApplicationFormField = <V extends Value>(
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>
): ApplicationFormField<V> => {
  const {
    getValues,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState,
    setError,
  } = useFormContext<Application>();
  const fieldName = (getLastValue((id as string).split('.')) ?? '') as Key;

  return React.useMemo(
    () => ({
      fieldName,
      getValue: () => getValues(id) as V,
      setValue: (value: V) =>
        setValue(id, value),
      watch: () => watch(id) as V,
      getError: () => get(formState.errors, id) as FieldError | undefined,
      setError: (type: ErrorOption['type']) => setError(id, { type }),
      // todo undefined can be changed to "" after backend allows invalid values
      // eslint-disable-next-line unicorn/no-useless-undefined
      clearValue: () => setValue(id, undefined),
      trigger: () => trigger(id, { shouldFocus: true }),
      clearErrors: () => clearErrors(id),
    }),
    [
      id,
      getValues,
      clearErrors,
      formState,
      fieldName,
      setValue,
      trigger,
      setError,
      watch,
    ]
  );
};
export default useApplicationFormField;
