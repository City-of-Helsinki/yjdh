import { NumberInput as HdsNumberInput } from 'hds-react';
import React from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import Id from 'shared/types/id';
import TetPosting from 'tet/admin/types/tetposting';

type SpotsType = Pick<TetPosting, 'spots'>;

// TODO add minusStepButtonAriaLabel and plusStepButtonAriaLabel
type Props = {
  id: Id<SpotsType>;
  label: string;
  registerOptions: RegisterOptions;
  required: boolean;
};

const asNumber = (value?: string | number | undefined): number | undefined => Number(value) || undefined;

const NumberInput: React.FC<Props> = ({ id, registerOptions, label, required = false }) => {
  const { control } = useFormContext<SpotsType>();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsNumberInput
          id={id}
          label={label}
          value={value}
          min={1}
          step={1}
          required={required}
          onChange={onChange}
          errorText={error ? error.message : ''}
        />
      )}
      control={control}
      rules={registerOptions}
    />
  );
};

export default NumberInput;
