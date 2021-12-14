import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import CheckboxBase from 'shared/components/forms/inputs/Checkbox';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import ApplicationFormData from 'shared/types/application-form-data';

type Props = {
  id: ApplicationFieldPath;
  validation?: RegisterOptions<ApplicationFormData>;
  onChange?: (value: boolean | undefined) => void;
  initialValue?: boolean;
  label?: string | React.ReactNode;
} & GridCellProps;

const Checkbox: React.FC<Props> = ({
  id,
  validation = {},
  onChange = noop,
  initialValue,
  label,
  ...$gridCellProps
}: Props) => {
  const { t } = useTranslation();

  const { hasError, defaultLabel } = useApplicationFormField<boolean>(id);

  const required = Boolean(validation.required);

  return (
    <$GridCell {...$gridCellProps}>
      <CheckboxBase<ApplicationFormData>
        id={id}
        label={label ?? defaultLabel}
        errorText={
          hasError() && required
            ? `${t('common:application.form.errors.checkboxRequired')}`
            : undefined
        }
        onChange={onChange}
        registerOptions={validation}
        initialValue={initialValue}
        {...$gridCellProps}
      />
    </$GridCell>
  );
};

Checkbox.defaultProps = {
  validation: {},
  onChange: noop,
  initialValue: false,
  label: undefined,
};

export default Checkbox;
