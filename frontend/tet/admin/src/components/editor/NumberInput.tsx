import { NumberInput as HdsNumberInput } from 'hds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Id from 'shared/types/id';
import TetPosting from 'tet/admin/types/tetposting';

// TODO add minusStepButtonAriaLabel and plusStepButtonAriaLabel
type Props = {
  id: Id<TetPosting>;
  initialValue: number;
  label: string;
};

const asNumber = (value?: string | number | undefined): number | undefined => Number(value) || undefined;

const NumberInput: React.FC<Props> = ({ id, initialValue, label }) => {
  const { register } = useFormContext<TetPosting>();
  const { min, max, ...values } = register(id);
  return (
    <HdsNumberInput
      id={id}
      label={label}
      {...values}
      min={asNumber(min)}
      max={asNumber(max)}
      defaultValue={initialValue}
      step={1}
    />
  );
};

export default NumberInput;
