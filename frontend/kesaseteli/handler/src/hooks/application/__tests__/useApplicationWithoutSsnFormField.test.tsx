import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import useApplicationWithoutSsnFormField from '../useApplicationWithoutSsnFormField';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      firstName: 'John',
      language: '',
    },
  });
  return (
    <FormProvider {...methods}>
      <input {...methods.register('firstName')} />
      <input {...methods.register('language')} />
      {children}
    </FormProvider>
  );
};

describe('useApplicationWithoutSsnFormField', () => {
  it('should return form field handlers and handle updates', () => {
    const { result } = renderHook(
      () => useApplicationWithoutSsnFormField<string>('firstName'),
      { wrapper: Wrapper }
    );

    expect(result.current.fieldName).toBe('firstName');
    expect(result.current.defaultLabel).toBe('Etunimi');
    expect(result.current.getValue()).toBe('John');

    act(() => {
      result.current.setValue('Jane');
    });
    expect(result.current.getValue()).toBe('Jane');

    act(() => {
      result.current.clearValue();
    });
    expect(result.current.getValue()).toBe('');

    act(() => {
      result.current.watch();
    });

    expect(result.current.hasError()).toBe(false);
    expect(result.current.getError()).toBeUndefined();
    expect(result.current.getErrorText()).toBeUndefined();

    // Verify trigger and setFocus can be invoked
    act(() => {
      void result.current.trigger();
      result.current.setFocus();
    });
  });

  it('handles field errors correctly', () => {
    const { result, rerender } = renderHook(
      () => {
        const formContext = useFormContext();
        void formContext.formState.errors;
        return useApplicationWithoutSsnFormField<string>('firstName');
      },
      { wrapper: Wrapper }
    );

    act(() => {
      result.current.setError({ type: 'required', message: 'Tieto puuttuu' });
    });
    rerender();

    expect(result.current.hasError()).toBe(true);
    expect(result.current.getError()?.type).toBe('required');
    expect(result.current.getErrorText()).toBe('Tieto puuttuu');

    act(() => {
      result.current.clearErrors();
    });
    rerender();
    expect(result.current.hasError()).toBe(false);
  });

  it('resolves error texts without error message for language field', () => {
    const { result, rerender } = renderHook(
      () => {
        const formContext = useFormContext();
        void formContext.formState.errors;
        return useApplicationWithoutSsnFormField<string>('language');
      },
      { wrapper: Wrapper }
    );

    act(() => {
      result.current.setError({ type: 'required' });
    });
    rerender();

    expect(result.current.getErrorText()).toBe('Valitse jokin vaihtoehto');
  });

  describe('resolves error texts without error message for other fields', () => {
    it.each([
      {
        field: 'firstName',
        type: 'required',
        expected: 'Tieto puuttuu tai on virheellinen',
      },
      {
        field: 'email',
        type: 'pattern',
        expected: 'Syöttämäsi tieto on virheellistä muotoa',
      },
      {
        field: 'phoneNumber',
        type: 'maxLength',
        expected: 'Syöttämäsi tieto on liian pitkä',
      },
      {
        field: 'nonVtjBirthdate',
        type: 'validate',
        expected: 'Syöttämäsi tieto on virheellistä muotoa',
      },
    ] as const)(
      'returns correct error text for field "$field" and error type "$type"',
      ({ field, type, expected }) => {
        const { result, rerender } = renderHook(
          () => {
            const formContext = useFormContext();
            void formContext.formState.errors;
            return useApplicationWithoutSsnFormField<string>(field);
          },
          { wrapper: Wrapper }
        );

        act(() => {
          result.current.setError({ type });
        });
        rerender();

        expect(result.current.getErrorText()).toBe(expected);
      }
    );
  });
});
