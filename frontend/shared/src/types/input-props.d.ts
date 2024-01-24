import { RegisterOptions } from 'react-hook-form';
import Id from 'shared/types/id';

type InputProps<T, V = string> = {
  id: Id<T>;
  registerOptions?: RegisterOptions<T>;
  initialValue?: V;
  onChange?: (value?: V) => void;
  label?: React.ReactNode;
  errorText?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
};

export default InputProps;
