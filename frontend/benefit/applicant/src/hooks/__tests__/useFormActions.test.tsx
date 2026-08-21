import { renderHook, waitFor } from '@testing-library/react';
import { BENEFIT_TYPES } from 'benefit-shared/constants';
import { Application, ApplicationData } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import React from 'react';

import DeMinimisContext from '../../context/DeMinimisContext';
import useCreateApplicationQuery from '../useCreateApplicationQuery';
import useDeleteApplicationQuery from '../useDeleteApplicationQuery';
import useFormActions from '../useFormActions';
import useUpdateApplicationQuery from '../useUpdateApplicationQuery';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../useCreateApplicationQuery');
jest.mock('../useUpdateApplicationQuery');
jest.mock('../useDeleteApplicationQuery');
jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock('shared/components/toast/Toast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockRouter = {
  query: {},
  replace: jest.fn(),
  push: jest.fn(),
  pathname: '/application',
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseCreateApplicationQuery =
  useCreateApplicationQuery as jest.MockedFunction<
    typeof useCreateApplicationQuery
  >;
const mockUseUpdateApplicationQuery =
  useUpdateApplicationQuery as jest.MockedFunction<
    typeof useUpdateApplicationQuery
  >;
const mockUseDeleteApplicationQuery =
  useDeleteApplicationQuery as jest.MockedFunction<
    typeof useDeleteApplicationQuery
  >;

describe('useFormActions - onQuietSave', () => {
  const mockApplication: Partial<Application> = {
    applicationStep: 'step_1',
    company: { name: 'Test Company' } as unknown as Application['company'],
  };

  const mockCreateApplication = jest.fn();
  const mockUpdateApplication = jest.fn();
  const mockDeleteApplication = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>
    );
    mockUseCreateApplicationQuery.mockReturnValue({
      mutateAsync: mockCreateApplication,
      error: null,
    } as unknown as ReturnType<typeof useCreateApplicationQuery>);
    mockUseUpdateApplicationQuery.mockReturnValue({
      mutateAsync: mockUpdateApplication,
      error: null,
    } as unknown as ReturnType<typeof useUpdateApplicationQuery>);
    mockUseDeleteApplicationQuery.mockReturnValue({
      mutate: mockDeleteApplication,
      error: null,
    } as unknown as ReturnType<typeof useDeleteApplicationQuery>);
  });

  const wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <DeMinimisContext.Provider
      value={{ deMinimisAids: [], setDeMinimisAids: jest.fn() }}
    >
      {children}
    </DeMinimisContext.Provider>
  );

  it('should create a new application and update router with shallow routing when no applicationId exists', async () => {
    const newApplicationId = '12345';
    const mockResult: Partial<ApplicationData> = {
      id: newApplicationId,
      application_number: 1,
      benefit_type: BENEFIT_TYPES.SALARY,
    };

    mockRouter.query = {};
    mockCreateApplication.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFormActions(mockApplication), {
      wrapper,
    });

    const applicationValues: Application = {
      ...mockApplication,
      employee: {
        firstName: 'John',
        lastName: 'Doe',
      },
    } as Application;

    await result.current.onQuietSave(applicationValues);

    await waitFor(() => {
      expect(mockCreateApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          application_step: 'step_1',
          benefit_type: BENEFIT_TYPES.SALARY,
        })
      );
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: '/application',
        query: {
          id: newApplicationId,
        },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should update an existing application without modifying the router', async () => {
    const existingApplicationId = '67890';
    const mockResult: Partial<ApplicationData> = {
      id: existingApplicationId,
      application_number: 2,
      benefit_type: BENEFIT_TYPES.SALARY,
    };

    mockRouter.query = { id: existingApplicationId };
    mockUpdateApplication.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFormActions(mockApplication), {
      wrapper,
    });

    const applicationValues: Application = {
      ...mockApplication,
      id: existingApplicationId,
      employee: {
        firstName: 'Jane',
        lastName: 'Smith',
      },
    } as Application;

    await result.current.onQuietSave(applicationValues);

    await waitFor(() => {
      expect(mockUpdateApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          application_step: 'step_1',
          benefit_type: BENEFIT_TYPES.SALARY,
        })
      );
    });

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should return the created/updated application data on successful save', async () => {
    const mockResult: Partial<ApplicationData> = {
      id: '11111',
      application_number: 3,
      benefit_type: BENEFIT_TYPES.SALARY,
      employee: {
        first_name: 'Test',
        last_name: 'User',
        social_security_number: '',
        employee_language: undefined,
        job_title: '',
        monthly_pay: '',
        vacation_money: '',
        other_expenses: '',
        working_hours: '',
        collective_bargaining_agreement: '',
        is_living_in_helsinki: false,
        commission_amount: '',
        commission_description: '',
      },
    };

    mockRouter.query = { id: '11111' };
    mockUpdateApplication.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFormActions(mockApplication), {
      wrapper,
    });

    const applicationValues: Application = {
      ...mockApplication,
      id: '11111',
    } as Application;

    const saveResult = await result.current.onQuietSave(applicationValues);

    expect(saveResult).toEqual(mockResult);
  });

  it('should return undefined when save operation fails', async () => {
    mockRouter.query = { id: '99999' };
    mockUpdateApplication.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFormActions(mockApplication), {
      wrapper,
    });

    const applicationValues: Application = {
      ...mockApplication,
      id: '99999',
    } as Application;

    const saveResult = await result.current.onQuietSave(applicationValues);

    expect(saveResult).toBeUndefined();
  });

  it('should not update router if application creation succeeds but returns no ID', async () => {
    const mockResult: Partial<ApplicationData> = {
      application_number: 4,
      benefit_type: BENEFIT_TYPES.SALARY,
    };

    mockRouter.query = {};
    mockCreateApplication.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFormActions(mockApplication), {
      wrapper,
    });

    const applicationValues: Application = {
      ...mockApplication,
      employee: {
        firstName: 'No',
        lastName: 'ID',
      },
    } as Application;

    await result.current.onQuietSave(applicationValues);

    await waitFor(() => {
      expect(mockCreateApplication).toHaveBeenCalled();
    });

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
