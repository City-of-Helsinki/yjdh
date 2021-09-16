import { DateInput as HdsDateInput } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  FieldError,
  get,
  RegisterOptions,
  useFormContext,
  UseFormRegister} from 'react-hook-form';
import { $GridCell,GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/employer-application';
import { getLastValue } from 'shared/utils/array.utils';
import {
  convertToBackendDateFormat, convertToUIDateFormat, isValidDate, parseDate,
} from 'shared/utils/date.utils';

import { $DateInput } from './DateInput.sc';
import { isEmpty } from 'shared/utils/string.utils';



type Props = {
  validation: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
} & GridCellProps;

const DateInput = ({
  id,
  validation,
  ...gridCellProps
}: Props): ReturnType<typeof HdsDateInput> => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    register,
    getValues: getFormValues,
    formState: { errors },
  } = useFormContext<Application>();
  const { isLoading } = useApplicationApi();

  const name = getLastValue((id as string).split('.')) ?? '';
  const date = convertToUIDateFormat(getFormValues(id) as string);

  const validate = React.useCallback((value) => isValidDate(parseDate(value)), []);

  const errorType = get(errors, `${id}.type`) as FieldError['type'];
  const isError = Boolean(errorType);
  const errorText = React.useMemo((): string | undefined => {
    if (!isError) {
      return undefined;
    }
    if (errorType === 'pattern') {
        return `${t(`common:application.form.errors.${errorType}`)}. ${t(`common:application.form.helpers.date`)}`;
    }
    return t(`common:application.form.errors.${errorType}`);
  },[t,isError, errorType]);

  const convertDateForBackend = React.useCallback((dateString: string): string | undefined => {
    if (!dateString) {
      return undefined;
    }
    const result = convertToBackendDateFormat(dateString);
    return isEmpty(result) ? dateString : result;
  }, [])

  return (
    <$GridCell {...gridCellProps}>
      <$DateInput
        {...register(id, {...validation, validate, setValueAs: convertDateForBackend})}
        id={id}
        data-testid={id}
        name={id}
        disabled={isLoading}
        required={Boolean(validation.required)}
        initialMonth={new Date()}
        defaultValue={date}
        language={locale}
        onChange={convertToUIDateFormat}
        errorText={
          errorText
        }
        label={t(`common:application.form.inputs.${name}`)}
      />
    </$GridCell>
  );
};

export default DateInput;
