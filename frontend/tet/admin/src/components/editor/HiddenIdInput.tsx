import React from 'react';
import { useFormContext } from 'react-hook-form';
import InputProps from 'shared/types/input-props';
import TetPosting from 'tet-shared/types/tetposting';

const HiddenIdInput: React.FC<InputProps<TetPosting>> = ({ id, initialValue }) => {
  const { register } = useFormContext<TetPosting>();
  return <input type="hidden" {...register(id)} defaultValue={initialValue} />;
};

export default HiddenIdInput;
