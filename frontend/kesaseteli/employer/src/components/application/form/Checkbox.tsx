import { Checkbox as HdsCheckbox, CheckboxProps } from 'hds-react';
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

type Props = {
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  validation?: RegisterOptions<Application>;
  onChange?: (value: boolean) => void;
  initialValue?: boolean;
  label?: CheckboxProps['label'];
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
  const { register } = useFormContext<Application>();

  const { hasError, defaultLabel, setError, clearErrors } =
    useApplicationFormField<boolean>(id);

  const [selectedValue, setSelectedValue] = React.useState(initialValue);
  const required = Boolean(validation.required);
  const handleChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      onChange(value);
      setSelectedValue(value);
      if (required && !value) {
        setError({ type: 'required' });
      } else if (required && value) {
        clearErrors();
      }
    },
    [setSelectedValue, onChange, required, clearErrors, setError]
  );

  // TODO: This can be removed after backend supports invalid values in draft save
  const getValueForBackend = React.useCallback(
    (value: string) => (isEmpty(value) ? false : value),
    []
  );

  return (
    <$GridCell {...$gridCellProps}>
      <HdsCheckbox
        {...register(id, { ...validation, setValueAs: getValueForBackend })}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        required={required}
        errorText={
          hasError() && required
            ? `${t(`common:application.form.errors.checkboxRequired`)}`
            : undefined
        }
        label={label || defaultLabel}
        onChange={handleChange}
        checked={selectedValue ?? initialValue}
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
