import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import Application from 'shared/types/application-form-data';

import useApplicationFormField from '../useApplicationFormField';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<Application>({
    defaultValues: {
      contact_person_name: 'John Doe',
      hired_without_voucher_assessment: '',
    } as unknown as Application,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('useApplicationFormField', () => {
  it('returns field metadata, value, and sets focus', () => {
    const { result } = renderHook(() => useApplicationFormField('contact_person_name'), { wrapper: Wrapper });

    expect(result.current.fieldName).toBe('contact_person_name');
    expect(result.current.getValue()).toBe('John Doe');
    expect(result.current.watch()).toBe('John Doe');

    act(() => {
      result.current.setValue('Jane Doe');
    });
    expect(result.current.getValue()).toBe('Jane Doe');

    act(() => {
      result.current.clearValue();
    });
    expect(result.current.getValue()).toBe('');
  });

  it('handles custom validation errors and labels', () => {
    const { result } = renderHook(
      () => {
        const formContext = useFormContext<Application>();
        void formContext.formState.errors;
        const field = useApplicationFormField<string>('contact_person_name');
        return {
          field,
          setError: formContext.setError,
        };
      },
      { wrapper: Wrapper }
    );

    expect(result.current.field.hasError()).toBe(false);
    expect(result.current.field.getErrorText()).toBeUndefined();

    act(() => {
      result.current.setError('contact_person_name', { type: 'custom', message: 'Custom Error Message' });
    });
    expect(result.current.field.hasError()).toBe(true);
    expect(result.current.field.getErrorText()).toBe('Custom Error Message');

    act(() => {
      result.current.setError('contact_person_name', { type: 'required' });
    });
    expect(result.current.field.hasError()).toBe(true);
    expect(result.current.field.getErrorText()).toBe('Tieto puuttuu tai on virheellinen');

    act(() => {
      result.current.field.clearErrors();
    });
    expect(result.current.field.hasError()).toBe(false);
  });

  it('returns translation error key for custom fields', () => {
    const { result } = renderHook(
      () => {
        const formContext = useFormContext<Application>();
        void formContext.formState.errors;
        const hiredAssessment = useApplicationFormField<string>('summer_vouchers.0.hired_without_voucher_assessment');
        const contract = useApplicationFormField('summer_vouchers.0.employment_contract');
        return {
          hiredAssessment,
          contract,
          setError: formContext.setError,
        };
      },
      { wrapper: Wrapper }
    );

    act(() => {
      result.current.setError('summer_vouchers.0.hired_without_voucher_assessment', { type: 'required' });
      result.current.setError('summer_vouchers.0.employment_contract', { type: 'required' });
    });

    expect(result.current.hiredAssessment.getErrorText()).toBe('Valitse jokin vaihtoehto');
    expect(result.current.contract.getErrorText()).toBe('Liitä ainakin yksi tiedosto');
  });

  it('triggers validation and sets focus gracefully', async () => {
    const { result } = renderHook(() => useApplicationFormField('contact_person_name'), { wrapper: Wrapper });

    let triggerResult = false;
    await act(async () => {
      triggerResult = await result.current.trigger();
    });
    expect(triggerResult).toBe(true);

    act(() => {
      result.current.setFocus();
    });
  });
});
