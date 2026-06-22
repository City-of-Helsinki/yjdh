import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import useGetEmploymentErrors from '../useGetEmploymentErrors';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      summer_vouchers: [{ employee_name: 'John' }],
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('useGetEmploymentErrors', () => {
  it('returns errors for the specific index', () => {
    const { result, rerender } = renderHook(
      () => {
        const formContext = useFormContext();
        void formContext.formState.errors; // Register proxy listener
        return {
          errors: useGetEmploymentErrors(0),
          setError: formContext.setError,
        };
      },
      { wrapper: Wrapper }
    );
    expect(result.current.errors).toBeUndefined();

    act(() => {
      result.current.setError('summer_vouchers.0.employee_name', {
        type: 'required',
        message: 'Name is required',
      });
    });
    rerender();

    expect(result.current.errors.employee_name).toEqual(
      expect.objectContaining({ type: 'required', message: 'Name is required' })
    );
  });
});
