import { Checkbox as HdsCheckbox } from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
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
import { isEmpty } from 'shared/utils/string.utils';

type Props = {
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  validation?: RegisterOptions<Application>;
} & GridCellProps;

const Checkbox: React.FC<Props> = ({
  id,
  validation = {},
  ...$gridCellProps
}: Props) => {
  const { t } = useTranslation();
  const { register } = useFormContext<Application>();

  const { getValue, getError, fieldName } =
    useApplicationFormField<boolean>(id);
  const [selectedValue, setSelectedValue] = React.useState(getValue());
  const required = Boolean(validation.required);
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedValue(event.target.checked);
    },
    [setSelectedValue]
  );

  // TODO: This can be removed after backend supports invalid values in draft save
  const getValueForBackend = React.useCallback(
    (value: string) => (isEmpty(value) ? undefined : value),
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
        checked={selectedValue}
      />
    </$GridCell>
  );
};

Checkbox.defaultProps = {
  validation: {},
};

export default Checkbox;
