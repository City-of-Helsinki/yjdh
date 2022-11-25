import {
  SelectionGroup as HdsSelectionGroup,
  SelectionGroupProps,
} from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import SelectionGroupBase from 'shared/components/forms/inputs/SelectionGroup';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import ApplicationFormData from 'shared/types/application-form-data';

type Props<V extends readonly string[]> = {
  validation?: RegisterOptions<ApplicationFormData>;
  id: ApplicationFieldPath;
  direction?: SelectionGroupProps['direction'];
  values: V;
  showTitle?: boolean;
  onChange?: (value?: string) => void;
} & GridCellProps;

const SelectionGroup = <V extends readonly string[]>({
  id,
  validation,
  direction,
  values,
  showTitle,
  onChange = noop,
  ...$gridCellProps
}: Props<V>): ReturnType<typeof HdsSelectionGroup> => {
  const { t } = useTranslation();

  const {
    getValue: getInitialValue,
    clearErrors,
    hasError,
    fieldName,
  } = useApplicationFormField<string>(id);

  const handleChange = React.useCallback(
    (value?: string) => {
      onChange(value);
      if (hasError()) {
        clearErrors();
      }
    },
    [hasError, onChange, clearErrors]
  );
  const getValueText = React.useCallback(
    (value: string): string =>
      t(`common:application.form.selectionGroups.${fieldName}.${value}`),
    [t, fieldName]
  );

  return (
    <SelectionGroupBase<ApplicationFormData>
      values={values}
      registerOptions={validation}
      id={id}
      direction={direction}
      initialValue={getInitialValue()}
      errorText={
        hasError()
          ? `${t('common:application.form.errors.selectionGroups')}`
          : undefined
      }
      label={
        showTitle ? t(`common:application.form.inputs.${fieldName}`) : undefined
      }
      onChange={handleChange}
      getValueText={getValueText}
      {...$gridCellProps}
    />
  );
};

export default SelectionGroup;
