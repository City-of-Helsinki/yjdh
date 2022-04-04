import {
  NumberInput as HdsNumberInput,
  TextArea as HdsTextArea,
  TextInput as HdsTextInput,
} from 'hds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

import { $TextInput } from './TextInput.sc';

export type TextInputProps<T> = InputProps<T> & {
  type?: 'text' | 'decimal' | 'number' | 'textArea';
  placeholder?: string;
} & GridCellProps;

const getComponentType = <T,>(
  type: TextInputProps<T>['type']
): typeof HdsTextInput | typeof HdsNumberInput | typeof HdsTextArea => {
  switch (type) {
    case 'number':
    case 'decimal':
      return HdsNumberInput;

    case 'textArea':
      return HdsTextArea;

    case 'text':
    default:
      return HdsTextInput;
  }
};

const TextInput = <T,>({
  id,
  type = 'text',
  placeholder,
  initialValue,
  label,
  errorText,
  registerOptions = {},
  onChange,
  ...$gridCellProps
}: TextInputProps<T>): React.ReactElement<T> => {
  const { register } = useFormContext<T>();
  const preventScrolling = React.useCallback(
    (event: React.WheelEvent<HTMLInputElement>) => event.currentTarget.blur(),
    []
  );

  return (
    <$GridCell {...$gridCellProps}>
      <$TextInput
        as={getComponentType(type)}
        {...register(id, registerOptions)}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        placeholder={placeholder}
        required={Boolean(registerOptions.required)}
        max={
          registerOptions.maxLength
            ? String(registerOptions.maxLength)
            : undefined
        }
        defaultValue={initialValue}
        onWheel={preventScrolling}
        errorText={errorText}
        label={label}
        invalid={Boolean(errorText)}
        aria-invalid={Boolean(errorText)}
      />
    </$GridCell>
  );
};

TextInput.defaultProps = {
  type: undefined,
  placeholder: undefined,
};

export default TextInput;
