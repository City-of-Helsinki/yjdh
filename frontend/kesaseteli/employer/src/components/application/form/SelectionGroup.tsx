import { RadioButton,SelectionGroup as HdsSelectionGroup, SelectionGroupProps } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  FieldError,
  get,
  RegisterOptions,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';
import Application from 'shared/types/employer-application';
import { getLastValue } from 'shared/utils/array.utils';

import { $SelectionGroup } from './SelectionGroup.sc';

type Props<T extends readonly string[]> = {
  validation?: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  direction?: SelectionGroupProps['direction'],
  values: T,
  showTitle?: boolean,
};

const SelectionGroup = <T extends readonly string[]>({
                     id,
                     validation,
                     direction,
                     values,
                     showTitle,
                     ...rest
                   }: Props<T>): ReturnType<typeof HdsSelectionGroup> => {
  const { t } = useTranslation();
  const {
    register,
    getValues : getFormValues,
    formState: { errors },
  } = useFormContext<Application>();
  const { isLoading } = useApplicationApi();

  const [selectedValue, setSelectedValue] = React.useState(getFormValues(id));
  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  },[setSelectedValue])

  const errorType = get(errors, `${id}.type`) as FieldError['type'];
  const name = getLastValue((id as string).split('.')) ?? '';

  return (
    <$SelectionGroup
      {...rest}
      id={id}
      data-testid={id}
      name={id}
      disabled={isLoading}
      required={showTitle && Boolean(validation?.required)}
      direction={direction}
      errorText={
        errorType ? `${t(`common:application.form.errors.selectionGroups`)}` : undefined
      }
      label={showTitle ? t(`common:application.form.inputs.${name}`) : undefined}
    >
      {values.map((value) => <RadioButton
        {...register(id, validation)}
        key={`${id}-${value}`}
        id={`${id}-${value}`}
        data-testid={`${id}-${value}`}
        label={t(`common:application.form.selectionGroups.${name}.${value}`)}
        value={value}
        onChange={onChange}
        checked={value === selectedValue}
        />)}
    </$SelectionGroup>
  );
};

SelectionGroup.defaultProps = {
  direction: 'horizontal',
  validation: undefined,
  showTitle: false,
}

export default SelectionGroup;
