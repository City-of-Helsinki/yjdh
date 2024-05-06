/**
 * TODO: YJDH-701, refactor to reduce code duplication, copied and modified from:
 *       frontend/kesaseteli/employer/src/hooks/application/useApplicationFormField.ts
 */
import useGetApplicationWithoutSsnFormFieldLabel from 'kesaseteli/handler/hooks/application/useGetApplicationWithoutSsnFormFieldLabel';
import type {
  ApplicationWithoutSsn,
  ApplicationWithoutSsnFieldName,
  ApplicationWithoutSsnFieldPath,
  ApplicationWithoutSsnFormField,
  ApplicationWithoutSsnValue,
} from 'kesaseteli/handler/types/application-without-ssn-types';
import { useTranslation } from 'next-i18next';
import { ErrorOption, FieldError, get, useFormContext } from 'react-hook-form';
import { getLastValue } from 'shared/utils/array.utils';
import { convertToUIDateFormat, parseDate } from 'shared/utils/date.utils';
import { isDateObject } from 'shared/utils/type-guards';

const useApplicationWithoutSsnFormField = <
  V extends ApplicationWithoutSsnValue
>(
  id: ApplicationWithoutSsnFieldPath
): ApplicationWithoutSsnFormField<V> => {
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
  } = useFormContext<ApplicationWithoutSsn>();
  const fieldName = (getLastValue((id as string).split('.')) ??
    '') as ApplicationWithoutSsnFieldName;
  const defaultLabel = useGetApplicationWithoutSsnFormFieldLabel(fieldName);

  const getError = (): FieldError | undefined =>
    get(formState.errors, id) as FieldError | undefined;

  return {
    control,
    register,
    fieldName,
    defaultLabel,
    getValue: (): V => {
      const value = getValues(id);
      if (isDateObject(parseDate(value))) {
        return convertToUIDateFormat(value) as V;
      }
      return value as V;
    },
    setValue: (value: V) => setValue(id, value),
    watch: () => watch(id) as V,
    getError,
    hasError: () => Boolean(getError()),
    getErrorText: (): string | undefined => {
      const error = getError();
      if (!error) {
        return undefined;
      }
      const { message } = error;
      if (message) {
        return message;
      }
      return fieldName === 'language'
        ? t('common:applicationWithoutSsn.form.errors.selectionGroups')
        : t(`common:applicationWithoutSsn.form.errors.${error.type}`);
    },
    setError: (error: ErrorOption) => setErrorF(id, error),
    clearValue: () => setValue(id, ''),
    trigger: () => trigger(id, { shouldFocus: true }),
    clearErrors: () => clearErrors(id),
    setFocus: () => setFocus(id),
  };
};
export default useApplicationWithoutSsnFormField;
