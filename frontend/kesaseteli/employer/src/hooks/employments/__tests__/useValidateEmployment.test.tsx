import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useValidateEmployment from '../useValidateEmployment';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      summer_vouchers: [{ employee_name: 'John' }],
    },
  });
  return (
    <FormProvider {...methods}>
      <input {...methods.register('summer_vouchers.0.employee_name')} />
      {children}
    </FormProvider>
  );
};

describe('useValidateEmployment', () => {
  it('triggers validation and calls onSuccess when valid', async () => {
    const mockOnSuccess = jest.fn();
    const { result } = renderHook(
      () => useValidateEmployment(0, { onSuccess: mockOnSuccess }),
      { wrapper: Wrapper }
    );
    await act(async () => {
      await result.current();
    });
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
});
