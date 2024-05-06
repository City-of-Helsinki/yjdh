/**
 * TODO: YJDH-701, refactor to reduce code duplication, copied and modified from:
 *       frontend/kesaseteli/employer/src/components/application/form/SelectionGroup.tsx
 */
import {
  SelectionGroup as HdsSelectionGroup,
  SelectionGroupProps,
} from 'hds-react';
import useApplicationWithoutSsnFormField from 'kesaseteli/handler/hooks/application/useApplicationWithoutSsnFormField';
import type {
  ApplicationWithoutSsnFieldPath,
  ApplicationWithoutSsnFormData,
} from 'kesaseteli/handler/types/application-without-ssn-types';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import SelectionGroupBase from 'shared/components/forms/inputs/SelectionGroup';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';

type Props<V extends readonly string[]> = {
  validation?: RegisterOptions<ApplicationWithoutSsnFormData>;
  id: ApplicationWithoutSsnFieldPath;
  direction?: SelectionGroupProps['direction'];
  values: V;
  onChange?: (value?: string) => void;
} & GridCellProps;

const SelectionGroup = <V extends readonly string[]>({
  id,
  validation,
  direction,
  values,
  onChange = noop,
  ...$gridCellProps
}: Props<V>): ReturnType<typeof HdsSelectionGroup> => {
  const { t } = useTranslation();

  const {
    getValue: getInitialValue,
    clearErrors,
    hasError,
    fieldName,
  } = useApplicationWithoutSsnFormField<string>(id);

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
      t(
        `common:applicationWithoutSsn.form.selectionGroups.${fieldName}.${value}`
      ),
    [t, fieldName]
  );

  return (
    <SelectionGroupBase<ApplicationWithoutSsnFormData>
      values={values}
      registerOptions={validation}
      id={id}
      direction={direction}
      initialValue={getInitialValue()}
      errorText={
        hasError()
          ? `${t('common:applicationWithoutSsn.form.errors.selectionGroups')}`
          : undefined
      }
      label={t(`common:applicationWithoutSsn.form.inputs.${fieldName}`)}
      onChange={handleChange}
      getValueText={getValueText}
      {...$gridCellProps}
    />
  );
};

export default SelectionGroup;
