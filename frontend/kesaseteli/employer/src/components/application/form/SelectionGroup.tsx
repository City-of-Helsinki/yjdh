import {
  RadioButton,
  SelectionGroup as HdsSelectionGroup,
  SelectionGroupProps,
} from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  RegisterOptions,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/application-form-data';

import { $SelectionGroup } from './SelectionGroup.sc';

type Props<T extends readonly string[]> = {
  validation?: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  direction?: SelectionGroupProps['direction'];
  values: T;
  showTitle?: boolean;
  onChange?: (value: string) => void;
} & GridCellProps;

const SelectionGroup = <T extends readonly string[]>({
  id,
  validation,
  direction,
  values,
  showTitle,
  onChange = noop,
  ...$gridCellProps
}: Props<T>): ReturnType<typeof HdsSelectionGroup> => {
  const { t } = useTranslation();
  const { register } = useFormContext<Application>();

  const {
    getValue: getInitialValue,
    hasError,
    fieldName,
  } = useApplicationFormField<string>(id);
  const [selectedValue, setSelectedValue] = React.useState(getInitialValue());

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
      setSelectedValue(event.target.value);
    },
    [setSelectedValue, onChange]
  );

  // TODO: This can be removed after backend supports invalid values in draft save
  const getValueForBackend = React.useCallback(
    (value: string) => (isEmpty(value) ? undefined : value),
    []
  );

  return (
    <$GridCell {...$gridCellProps}>
      <$SelectionGroup
        key={id}
        id={id}
        data-testid={id}
        name={id}
        required={showTitle && Boolean(validation?.required)}
        direction={direction}
        errorText={
          hasError()
            ? `${t(`common:application.form.errors.selectionGroups`)}`
            : undefined
        }
        label={
          showTitle
            ? t(`common:application.form.inputs.${fieldName}`)
            : undefined
        }
      >
        {values.map((value) => (
          <RadioButton
            {...register(id, { ...validation, setValueAs: getValueForBackend })}
            key={`${id}-${value}`}
            id={`${id}-${value}`}
            data-testid={`${id}-${value}`}
            label={t(
              `common:application.form.selectionGroups.${fieldName}.${value}`
            )}
            value={value}
            onChange={handleChange}
            checked={value === selectedValue}
          />
        ))}
      </$SelectionGroup>
    </$GridCell>
  );
};

SelectionGroup.defaultProps = {
  direction: 'horizontal',
  validation: undefined,
  showTitle: true,
  onChange: noop,
};

export default SelectionGroup;
