import {
  act,
  renderHook,
  RenderHookResult,
} from '@testing-library/react-hooks';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useCreateApplicationQuery from 'benefit/applicant/hooks/useCreateApplicationQuery';
import useDeleteApplicationQuery from 'benefit/applicant/hooks/useDeleteApplicationQuery';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { BENEFIT_TYPES, PAY_SUBSIDY_GRANTED } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import React from 'react';

import useFormActions from '../useFormActions';

const createApplication = jest.fn();
const updateApplication = jest.fn();
const deleteApplication = jest.fn();
const routerPush = jest.fn();
const routerReplace = jest.fn();

jest.mock('benefit/applicant/hooks/useCreateApplicationQuery', () => jest.fn());
jest.mock('benefit/applicant/hooks/useUpdateApplicationQuery', () => jest.fn());
jest.mock('benefit/applicant/hooks/useDeleteApplicationQuery', () => jest.fn());

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>): string =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('shared/components/toast/Toast', () => jest.fn());

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

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

type WrapperProps = {
  children: React.ReactNode;
};

type UseFormActionsResult = ReturnType<typeof useFormActions>;

type TestApplicationOverrides = Partial<Application> & {
  companyNumberOfEmployees?: string | number | '' | null;
};

const baseApplication = {
  id: 'application-id',
  applicationStep: 'step_1',
} as Partial<Application>;

const getWrapper =
  (): React.FC<WrapperProps> =>
  ({ children }) =>
    (
      <DeMinimisContext.Provider
        value={{
          deMinimisAids: [],
          setDeMinimisAids: jest.fn(),
        }}
      >
        {children}
      </DeMinimisContext.Provider>
    );

const renderUseFormActions = (
  application: Partial<Application> = baseApplication
): RenderHookResult<WrapperProps, UseFormActionsResult> =>
  renderHook<WrapperProps, UseFormActionsResult>(
    () => useFormActions(application),
    {
      wrapper: getWrapper(),
    }
  );

const getCurrentValues = (
  overrides: TestApplicationOverrides = {}
): Application =>
  ({
    id: 'application-id',
    applicationStep: 'step_1',
    companyNumberOfEmployees: '10',
    companyBusinessBrief: 'Company business brief',
    associationHasBusinessActivities: true,
    coOperationNegotiations: false,
    paySubsidyGranted: PAY_SUBSIDY_GRANTED.NOT_GRANTED,
    ...overrides,
  } as unknown as Application);

describe('useFormActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    createApplication.mockResolvedValue({
      id: 'created-application-id',
      application_number: 123,
    });

    updateApplication.mockResolvedValue({
      id: 'updated-application-id',
      application_number: 456,
    });

    mockUseRouter.mockReturnValue({
      query: {
        id: 'application-id',
      },
      push: routerPush,
      replace: routerReplace,
    } as unknown as ReturnType<typeof useRouter>);

    mockUseCreateApplicationQuery.mockReturnValue({
      mutateAsync: createApplication,
      error: null,
    } as ReturnType<typeof useCreateApplicationQuery>);

    mockUseUpdateApplicationQuery.mockReturnValue({
      mutateAsync: updateApplication,
      error: null,
    } as ReturnType<typeof useUpdateApplicationQuery>);

    mockUseDeleteApplicationQuery.mockReturnValue({
      mutate: deleteApplication,
      error: null,
    } as ReturnType<typeof useDeleteApplicationQuery>);
  });

  it('converts companyNumberOfEmployees string to number when saving', async () => {
    const { result } = renderUseFormActions();

    await act(async () => {
      await result.current.onSave(
        getCurrentValues({
          companyNumberOfEmployees: '25',
        })
      );
    });

    expect(updateApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        company_number_of_employees: 25,
      })
    );
  });

  it('converts empty companyNumberOfEmployees to null when saving', async () => {
    const { result } = renderUseFormActions();

    await act(async () => {
      await result.current.onSave(
        getCurrentValues({
          companyNumberOfEmployees: '',
        })
      );
    });

    expect(updateApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        company_number_of_employees: null,
      })
    );
  });

  it('passes companyBusinessBrief unchanged when saving', async () => {
    const { result } = renderUseFormActions();

    await act(async () => {
      await result.current.onSave(
        getCurrentValues({
          companyBusinessBrief: 'We provide testing services.',
        })
      );
    });

    expect(updateApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        company_business_brief: 'We provide testing services.',
      })
    );
  });

  it('passes associationHasBusinessActivities true when saving', async () => {
    const { result } = renderUseFormActions();

    await act(async () => {
      await result.current.onSave(
        getCurrentValues({
          associationHasBusinessActivities: true,
        })
      );
    });

    expect(updateApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        association_has_business_activities: true,
      })
    );
  });

  it('passes associationHasBusinessActivities false and keeps salary benefit type when saving', async () => {
    const { result } = renderUseFormActions();

    await act(async () => {
      await result.current.onSave(
        getCurrentValues({
          associationHasBusinessActivities: false,
          companyNumberOfEmployees: '0',
          companyBusinessBrief: 'Association without business activities.',
        })
      );
    });

    expect(updateApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        association_has_business_activities: false,
        company_number_of_employees: 0,
        company_business_brief: 'Association without business activities.',
        benefit_type: BENEFIT_TYPES.SALARY,
      })
    );
  });
});
