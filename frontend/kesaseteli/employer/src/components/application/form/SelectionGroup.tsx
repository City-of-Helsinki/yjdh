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
import { $GridCell,GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/employer-application';
import { getLastValue } from 'shared/utils/array.utils';
import { isEmpty } from 'shared/utils/string.utils';

import { $SelectionGroup } from './SelectionGroup.sc';

type Props<T extends readonly string[]> = {
  validation?: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  direction?: SelectionGroupProps['direction'],
  values: T,
  showTitle?: boolean,
} & GridCellProps;

const SelectionGroup = <T extends readonly string[]>({
                     id,
                     validation,
                     direction,
                     values,
                     showTitle,
                     ...gridCellProps
                   }: Props<T>): ReturnType<typeof HdsSelectionGroup> => {
  const { t } = useTranslation();
  const {
    register,
    getValues : getFormValues,
    formState: { errors },
  } = useFormContext<Application>();
  const { isLoading } = useApplicationApi();

  const [selectedValue, setSelectedValue] = React.useState(getFormValues(id));
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  },[setSelectedValue])

  const errorType = get(errors, `${id}.type`) as FieldError['type'];
  const isError = Boolean(errorType);
  const name = getLastValue((id as string).split('.')) ?? '';

  const getValueForBackend = React.useCallback((value: string) => isEmpty(value) ? undefined : value, []);

  return (
    <$GridCell {...gridCellProps}>
      <$SelectionGroup
        id={id}
        data-testid={id}
        name={id}
        disabled={isLoading}
        required={showTitle && Boolean(validation?.required)}
        direction={direction}
        errorText={
          isError ? `${t(`common:application.form.errors.selectionGroups`)}` : undefined
        }
        label={showTitle ? t(`common:application.form.inputs.${name}`) : undefined}
      >
        {values.map((value) => <RadioButton
          {...register(id, {...validation, setValueAs: getValueForBackend})}
          key={`${id}-${value}`}
          id={`${id}-${value}`}
          data-testid={`${id}-${value}`}
          label={t(`common:application.form.selectionGroups.${name}.${value}`)}
          value={value}
          onChange={handleChange}
          checked={value === selectedValue}
          />)}
      </$SelectionGroup>
    </$GridCell>
  );
};

SelectionGroup.defaultProps = {
  direction: 'horizontal',
  validation: undefined,
  showTitle: true,
}

export default SelectionGroup;
