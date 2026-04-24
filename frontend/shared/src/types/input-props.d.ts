import { RegisterOptions } from 'react-hook-form';
import { HdsOption } from 'shared/components/forms/inputs/Dropdown';
import AutoComplete from 'shared/types/auto-complete';
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
  autoComplete?: AutoComplete;
  readOnly?: boolean;
  helperText?: string;
  filter?: (option: HdsOption, inputValue: string) => boolean;
  filterLabel?: string;
  filterPlaceholder?: string;
};

export default InputProps;
