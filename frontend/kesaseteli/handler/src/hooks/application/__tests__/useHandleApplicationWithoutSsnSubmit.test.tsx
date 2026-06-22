import { act, renderHook } from '@testing-library/react';
import { fakeCreatedYouthApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import mockRouter from 'next-router-mock';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import useHandleApplicationWithoutSsnSubmit from '../useHandleApplicationWithoutSsnSubmit';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseErrorHandler = useErrorHandler as jest.Mock;
const mockErrorHandler = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('useHandleApplicationWithoutSsnSubmit', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
    mockUseErrorHandler.mockReturnValue(mockErrorHandler);
    jest.clearAllMocks();
  });

  it('handles success correctly with mock integrations', () => {
    const originalEnv = process.env.NEXT_PUBLIC_MOCK_FLAG;
    process.env.NEXT_PUBLIC_MOCK_FLAG = '1';
    try {
      const { result } = renderHook(
        () => useHandleApplicationWithoutSsnSubmit(),
        {
          wrapper: Wrapper,
        }
      );

      const application = fakeCreatedYouthApplication({
        id: 'uuid-123',
        status: 'submitted',
      });

      act(() => {
        result.current.handleSaveSuccess(application);
      });

      expect(mockRouter.asPath).toBe('/fi/thankyou?id=uuid-123');
      expect(result.current.submitError).toBeUndefined();
    } finally {
      process.env.NEXT_PUBLIC_MOCK_FLAG = originalEnv;
    }
  });

  it('handles success correctly with real integrations', () => {
    const originalEnv = process.env.NEXT_PUBLIC_MOCK_FLAG;
    process.env.NEXT_PUBLIC_MOCK_FLAG = '0';
    try {
      const { result } = renderHook(
        () => useHandleApplicationWithoutSsnSubmit(),
        {
          wrapper: Wrapper,
        }
      );

      const application = fakeCreatedYouthApplication({
        id: 'uuid-123',
        status: 'submitted',
      });

      act(() => {
        result.current.handleSaveSuccess(application);
      });

      expect(mockRouter.asPath).toBe('/fi/thankyou');
      expect(result.current.submitError).toBeUndefined();
    } finally {
      process.env.NEXT_PUBLIC_MOCK_FLAG = originalEnv;
    }
  });

  it('handles validation error response correctly', () => {
    const { result } = renderHook(
      () => useHandleApplicationWithoutSsnSubmit(),
      {
        wrapper: Wrapper,
      }
    );

    const mockValidationError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          first_name: ['Tieto puuttuu'],
        },
      },
    };

    act(() => {
      result.current.handleErrorResponse(mockValidationError);
    });

    expect(result.current.submitError).toEqual({
      type: 'validation_error',
      errorFields: ['first_name'],
    });
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it('handles generic error response correctly', () => {
    const { result } = renderHook(
      () => useHandleApplicationWithoutSsnSubmit(),
      {
        wrapper: Wrapper,
      }
    );

    const error = new Error('Some unexpected error');

    act(() => {
      result.current.handleErrorResponse(error);
    });

    expect(mockErrorHandler).toHaveBeenCalledWith(error);
    expect(result.current.submitError).toBeUndefined();
  });
});
