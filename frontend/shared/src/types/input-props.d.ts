import { RegisterOptions, UseFormRegister } from 'react-hook-form';

type InputProps<T, V = string> = {
  id: NonNullable<Parameters<UseFormRegister<T>>[0]>;
  registerOptions?: RegisterOptions<T>;
  initialValue?: V;
  onChange?: (value: V) => void;
  label?: React.ReactNode;
  errorText?: string;
};

export default InputProps;
