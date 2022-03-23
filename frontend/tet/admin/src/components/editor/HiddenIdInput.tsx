import React from 'react';
import InputProps from 'shared/types/input-props';
import TetPosting from 'tet/admin/types/tetposting';
import { useFormContext } from 'react-hook-form';

const HiddenIdInput: React.FC<InputProps<TetPosting>> = ({ id, initialValue }) => {
  const { register } = useFormContext<TetPosting>();
  return <input type="hidden" {...register(id)} defaultValue={initialValue} />;
};

export default HiddenIdInput;
