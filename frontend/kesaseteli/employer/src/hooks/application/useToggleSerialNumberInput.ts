import { TextInputProps } from 'kesaseteli/employer/components/application/form/TextInput';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import React from 'react';
import useToggle from 'shared/hooks/useToggle';
import Employment, { EmploymentExceptionReason } from 'shared/types/employment';

const useToggleSerialNumberInput = (
  index: number
): [boolean, (value: string) => void] => {
  const getId = React.useCallback(
    (field: keyof Employment): TextInputProps['id'] =>
      `summer_vouchers.${index}.${field}`,
    [index]
  );

  const { getValue: getReason } =
    useApplicationFormField<EmploymentExceptionReason>(
      getId('summer_voucher_exception_reason')
    );
  const { clearValue: clearSerialNumber } = useApplicationFormField<string>(
    getId('summer_voucher_serial_number')
  );

  const [showInput, toggleShowInput] = useToggle(getReason() === '9th_grader');

  const toggleShowSerialNumberInput = React.useCallback(
    (value: string) => {
      toggleShowInput();
      if (value === 'born_2004') {
        clearSerialNumber();
      }
    },
    [toggleShowInput, clearSerialNumber]
  );

  return [showInput, toggleShowSerialNumberInput];
};

export default useToggleSerialNumberInput;
