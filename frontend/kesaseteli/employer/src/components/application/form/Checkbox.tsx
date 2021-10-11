import { Checkbox as HdsCheckbox } from 'hds-react';
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
} & GridCellProps;

const Checkbox: React.FC<Props> = ({
  id,
  validation = {},
  onChange = noop,
  initialValue,
  ...$gridCellProps
}: Props) => {
  const { t } = useTranslation();
  const { register } = useFormContext<Application>();

  const { getError, fieldName } = useApplicationFormField<boolean>(id);
  const [selectedValue, setSelectedValue] = React.useState(initialValue);
  const required = Boolean(validation.required);
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
      setSelectedValue(event.target.checked);
    },
    [setSelectedValue, onChange]
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
          getError() && required
            ? `${t(`common:application.form.errors.checkboxRequired`)}`
            : undefined
        }
        label={t(`common:application.form.inputs.${fieldName}`)}
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
};

export default Checkbox;
