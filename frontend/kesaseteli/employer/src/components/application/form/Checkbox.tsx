import { Checkbox as HdsCheckbox, CheckboxProps } from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, RegisterOptions, UseFormRegister } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import useToggle from 'shared/hooks/useToggle';
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

  const { hasError, defaultLabel, setError, clearErrors, control } =
    useApplicationFormField<boolean>(id);

  const [selectedValue, toggleSelectedValue] = useToggle(initialValue);
  const required = Boolean(validation.required);
  const handleChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      onChange(value);
      toggleSelectedValue();
      if (required && !value) {
        setError({ type: 'required' });
      } else if (required && value) {
        clearErrors();
      }
    },
    [toggleSelectedValue, onChange, required, clearErrors, setError]
  );

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        control={control}
        defaultValue={initialValue}
        rules={validation}
        render={({ field }) => (
          <HdsCheckbox
            {...field}
            id={id}
            data-testid={id}
            required={required}
            errorText={
              hasError() && required
                ? `${t(`common:application.form.errors.checkboxRequired`)}`
                : undefined
            }
            label={
              <>
                {label ?? defaultLabel} {required ? '*' : ''}
              </>
            }
            onChange={(event) => {
              field.onChange(event);
              return handleChange(event);
            }}
            checked={selectedValue}
          />
        )}
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
