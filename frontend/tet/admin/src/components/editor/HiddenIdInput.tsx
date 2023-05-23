import React from 'react';
import { useFormContext } from 'react-hook-form';
import InputProps from 'shared/types/input-props';
import TetPosting from 'tet-shared/types/tetposting';

// Known issue with react-hook-form library, errors out with:
// Type of property 'prototype' circularly references itself in mapped type '{ [K in keyof Blob]-?: PathImpl<K & string, Blob[K]>; }'.
// More at: https://github.com/orgs/react-hook-form/discussions/7764

// @ts-ignore
const HiddenIdInput: React.FC<InputProps<TetPosting>> = ({ id, initialValue }) => {
  const { register } = useFormContext<TetPosting>();
  return <input type="hidden" {...register(id)} defaultValue={initialValue} />;
};

export default HiddenIdInput;
