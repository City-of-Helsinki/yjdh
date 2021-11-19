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

import { $TextInput, $TextInputProps } from './TextInput.sc';

const getComponentType = (
  type: $TextInputProps['$type']
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

export type TextInputProps<T> = InputProps<T> & {
  type?: $TextInputProps['$type'];
  placeholder?: string;
} & GridCellProps;

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
        $type={type}
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

export default TextInput;
