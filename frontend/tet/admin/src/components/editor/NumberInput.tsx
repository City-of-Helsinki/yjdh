import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { useFormContext } from 'react-hook-form';
import { NumberInput as HdsNumberInput } from 'hds-react';
import Id from 'shared/types/id';

// TODO add minusStepButtonAriaLabel and plusStepButtonAriaLabel
type Props = {
  id: Id<TetPosting>;
  initialValue: number;
  label: string;
};

const NumberInput: React.FC<Props> = ({ id, initialValue, label }) => {
  const { register } = useFormContext<TetPosting>();
  return <HdsNumberInput id={id} label={label} {...register(id)} defaultValue={initialValue} step={1} />;
};

export default NumberInput;
