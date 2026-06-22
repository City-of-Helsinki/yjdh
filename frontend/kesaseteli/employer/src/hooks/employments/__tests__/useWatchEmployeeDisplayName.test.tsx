import { renderHook } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useWatchEmployeeDisplayName from '../useWatchEmployeeDisplayName';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      summer_vouchers: [{ employee_name: 'John Doe' }, { employee_name: '' }],
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('useWatchEmployeeDisplayName', () => {
  it('returns employee name if present', () => {
    const { result } = renderHook(() => useWatchEmployeeDisplayName(0), {
      wrapper: Wrapper,
    });
    expect(result.current).toBe('John Doe');
  });

  it('returns default heading if name is empty', () => {
    const { result } = renderHook(() => useWatchEmployeeDisplayName(1), {
      wrapper: Wrapper,
    });
    expect(result.current).toBe('application.step2.employment #2');
  });
});
