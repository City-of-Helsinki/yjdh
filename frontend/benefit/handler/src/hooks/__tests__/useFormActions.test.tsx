import { renderHook } from '@testing-library/react';
import { ROUTES } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { Application } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  PAY_SUBSIDY_GRANTED,
  PAY_SUBSIDY_OPTIONS,
} from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import * as React from 'react';
import hdsToast from 'shared/components/toast/Toast';

import { useRouterNavigation } from '../applicationHandling/useRouterNavigation';
import useFormActions from '../useFormActions';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockCreateApplication = jest.fn();
const mockUpdateApplication = jest.fn();
const mockDeleteApplication = jest.fn();
const mockNavigateBack = jest.fn();

let mockCreateError: unknown = null;
let mockUpdateError: unknown = null;
let mockDeleteError: unknown = null;
let mockIsFormActionNew = true;

// Mock all external dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));
jest.mock('shared/components/toast/Toast', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('shared/utils/date.utils', () => ({
  parseDate: jest.fn((value: string) => value),
  convertToBackendDateFormat: jest.fn((value: string) => `backend:${value}`),
}));
jest.mock('shared/utils/string.utils', () => ({
  getNumberValue: jest.fn(Number),
  stringToFloatValue: jest.fn((value: string | undefined) =>
    value ? Number(value) : null
  ),
}));
jest.mock('shared/utils/application.utils', () => ({
  getFullName: jest.fn((first?: string, last?: string) =>
    [first, last].filter(Boolean).join(' ')
  ),
}));
jest.mock('snakecase-keys', () => ({
  __esModule: true,
  default: jest.fn((value: unknown) => value),
}));
jest.mock('camelcase-keys', () => ({
  __esModule: true,
  default: jest.fn((value: unknown) => value),
}));
jest.mock('../useApplicationFormContext', () => ({
  useApplicationFormContext: () => ({
    isFormActionNew: mockIsFormActionNew,
  }),
}));
jest.mock('../useCreateApplicationQuery', () => ({
  __esModule: true,
  default: () => ({
    mutateAsync: mockCreateApplication,
    error: mockCreateError,
  }),
}));
jest.mock('../useDeleteApplicationQuery', () => ({
  __esModule: true,
  default: () => ({
    mutate: mockDeleteApplication,
    error: mockDeleteError,
  }),
}));
jest.mock('../useUpdateApplicationQuery', () => ({
  __esModule: true,
  default: () => ({
    mutateAsync: mockUpdateApplication,
    error: mockUpdateError,
  }),
}));
jest.mock('../applicationHandling/useRouterNavigation', () => ({
  useRouterNavigation: jest.fn(() => ({
    navigateBack: mockNavigateBack,
  })),
}));

const createContextWrapper =
  (deMinimisAids: DeMinimisAid[] = []) =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <DeMinimisContext.Provider
        value={{
          deMinimisAids,
          setDeMinimisAids: () => {},
          unfinishedDeMinimisAidRow: false,
          setUnfinishedDeMinimisAidRow: () => {},
        }}
      >
        {children}
      </DeMinimisContext.Provider>
    );

describe('useFormActions', () => {
  const mockApplicationFormData: Partial<Application> = {
    id: '456',
    status: APPLICATION_STATUSES.DRAFT,
    startDate: '01.01.2024',
    endDate: '31.12.2024',
    paperApplicationDate: '01.06.2024',
    companyNumberOfEmployees: '',
    employee: {
      monthlyPay: '2000',
      vacationMoney: '500',
      otherExpenses: '100',
      workingHours: '37.5',
      commissionAmount: '100',
      firstName: 'Mia',
      lastName: 'Tester',
    },
    calculation: {
      stateAidMaxPercentage: 50,
      overrideMonthlyBenefitAmount: '1200',
    } as Application['calculation'],
    paySubsidies: [],
    trainingCompensations: [],
    paySubsidyGranted: PAY_SUBSIDY_GRANTED.GRANTED,
    apprenticeshipProgram: false,
    applicantTermsInEffect: {
      id: 'terms-1',
      applicantConsents: [{ id: 'consent-1' }],
    } as Application['applicantTermsInEffect'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateError = null;
    mockUpdateError = null;
    mockDeleteError = null;
    mockIsFormActionNew = true;

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    mockCreateApplication.mockResolvedValue({
      id: 'new-id',
      application_number: 1,
      employee: { first_name: 'Mia', last_name: 'Tester' },
    });
    mockUpdateApplication.mockResolvedValue({
      id: 'existing-id',
      application_number: 2,
      employee: { first_name: 'Mia', last_name: 'Tester' },
    });
    mockNavigateBack.mockResolvedValue(null);
  });

  it('should expose all action methods', () => {
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(result.current).toBeDefined();
    expect(result.current.onNext).toBeDefined();
    expect(result.current.onSubmit).toBeDefined();
    expect(result.current.onBack).toBeDefined();
    expect(result.current.onSave).toBeDefined();
    expect(result.current.onQuietSave).toBeDefined();
    expect(result.current.onDelete).toBeDefined();
    expect(result.current.onCompanySelected).toBeDefined();
  });

  it('should call create and complete step on onNext when form action is new', async () => {
    const dispatchStep = jest.fn();

    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper([{ id: 'aid-1' }]) }
    );

    await result.current.onNext(
      mockApplicationFormData as Application,
      dispatchStep,
      2,
      '',
      mockApplicationFormData as Application
    );

    expect(mockCreateApplication).toHaveBeenCalled();
    expect(dispatchStep).toHaveBeenCalledWith({
      type: 'completeStep',
      payload: 2,
    });
    expect(mockReplace).toHaveBeenCalledWith({ query: { id: 'new-id' } });
  });

  it('should call update and push update route on onNext when not new', async () => {
    mockIsFormActionNew = false;
    const dispatchStep = jest.fn();

    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    await result.current.onNext(
      mockApplicationFormData as Application,
      dispatchStep,
      1,
      'app-1',
      mockApplicationFormData as Application
    );

    expect(mockUpdateApplication).toHaveBeenCalled();
    expect(dispatchStep).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      `${ROUTES.APPLICATION}?id=app-1&action=update`
    );
  });

  it('should call update on onBack', async () => {
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    await result.current.onBack();

    expect(mockUpdateApplication).toHaveBeenCalled();
  });

  it('should call update, show success toast, and navigate back on onSave', async () => {
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    await result.current.onSave(
      mockApplicationFormData as Application,
      'existing-id'
    );

    expect(mockUpdateApplication).toHaveBeenCalled();
    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        labelText: 'common:notifications.applicationSaved.label',
      })
    );
    expect(mockNavigateBack).toHaveBeenCalled();
  });

  it('should create on onQuietSave when id is missing', async () => {
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    await result.current.onQuietSave(
      mockApplicationFormData as Application,
      ''
    );

    expect(mockCreateApplication).toHaveBeenCalled();
  });

  it('should delete and redirect on onDelete success', async () => {
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    result.current.onDelete('app-delete-1');

    expect(mockDeleteApplication).toHaveBeenCalledWith(
      'app-delete-1',
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );

    const { onSuccess } = mockDeleteApplication.mock.calls[0][1] as {
      onSuccess: () => Promise<void>;
    };
    await onSuccess();

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        labelText: 'common:notifications.applicationDeleted.label',
      })
    );
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should create and append id on onCompanySelected', async () => {
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    await result.current.onCompanySelected(mockApplicationFormData);

    expect(mockCreateApplication).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith({ query: { id: 'new-id' } });
  });

  it('should normalize values on onSubmit and default pay subsidy when undefined', async () => {
    const appWithNull: Partial<Application> = {
      ...mockApplicationFormData,
      paySubsidyGranted: null,
      companyNumberOfEmployees: '',
      paySubsidies: [{} as NonNullable<Application['paySubsidies']>[number]],
      trainingCompensations: [
        { id: 'tc-1' } as NonNullable<
          Application['trainingCompensations']
        >[number],
      ],
    };

    const { result } = renderHook(
      () => useFormActions(appWithNull, mockApplicationFormData),
      { wrapper: createContextWrapper([{ id: 'aid-1' }]) }
    );

    await result.current.onSubmit(appWithNull as Application, '');

    const submittedPayload = mockCreateApplication.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(submittedPayload.status).toBe(APPLICATION_STATUSES.RECEIVED);
    expect(submittedPayload.paySubsidyGranted).toBe(
      PAY_SUBSIDY_GRANTED.NOT_GRANTED
    );
    expect(submittedPayload.paySubsidyPercent).toBeNull();
    expect(submittedPayload.companyNumberOfEmployees).toBeNull();
    expect(submittedPayload.deMinimisAid).toBe(true);
    expect(submittedPayload.deMinimisAidSet).toEqual([{ id: 'aid-1' }]);
    expect(submittedPayload.startDate).toBe('backend:01.01.2024');
    expect(submittedPayload.endDate).toBe('backend:31.12.2024');
    expect(submittedPayload.paperApplicationDate).toBe('backend:01.06.2024');
    expect(submittedPayload.approveTerms).toEqual({
      terms: 'terms-1',
      selectedApplicantConsents: ['consent-1'],
    });
  });

  it('should set pay subsidies override when subsidy selection changes to granted', async () => {
    const changedValues: Partial<Application> = {
      ...mockApplicationFormData,
      paySubsidyGranted: PAY_SUBSIDY_GRANTED.GRANTED,
      apprenticeshipProgram: false,
      paySubsidies: [],
    };

    const { result } = renderHook(
      () =>
        useFormActions(changedValues, {
          ...changedValues,
          paySubsidyGranted: PAY_SUBSIDY_GRANTED.NOT_GRANTED,
        }),
      { wrapper: createContextWrapper() }
    );

    await result.current.onSave(changedValues as Application, 'existing-id');

    const savedPayload = mockUpdateApplication.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(savedPayload.paySubsidyPercent).toBe(PAY_SUBSIDY_OPTIONS[0]);
    expect(savedPayload.paySubsidies).toHaveLength(1);
  });

  it('should clear training compensations when apprenticeship is false', async () => {
    const appWithProgram: Partial<Application> = {
      ...mockApplicationFormData,
      apprenticeshipProgram: false,
      trainingCompensations: [
        { id: 'tc-1' } as NonNullable<
          Application['trainingCompensations']
        >[number],
      ],
    };

    const { result } = renderHook(
      () => useFormActions(appWithProgram, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    await result.current.onSave(appWithProgram as Application, 'existing-id');

    const savedPayload = mockUpdateApplication.mock.calls[0][0] as Application;
    expect(savedPayload.trainingCompensations).toEqual([]);
  });

  it('should show generic error toast when API error response is HTML string', () => {
    mockUpdateError = { response: { data: '<html>Error</html>' } };

    renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        labelText: 'common:error.generic.label',
        text: 'common:error.generic.text',
      })
    );
  });

  it('should show validation error content toast for object error response', () => {
    mockUpdateError = {
      response: {
        data: {
          employee: { first_name: ['Missing first name'] },
          approveTerms: true,
          fieldA: ['Error A'],
        },
      },
    };

    renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        labelText: 'common:error.generic.label',
      })
    );
  });

  it('should render mixed validation error values without crashing', () => {
    mockUpdateError = {
      response: {
        data: {
          employee: {
            first_name: ['Missing', 'Required'],
            metadata: { code: 123, active: true },
          },
          objectField: { reason: 'invalid' },
          listField: [1, 2],
        },
      },
    };

    renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    );
  });

  it('should handle employee validation fallback when employee error is not object', () => {
    mockUpdateError = {
      response: {
        data: {
          employee: 'invalid employee payload',
          anotherField: ['x'],
        },
      },
    };

    renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    );
  });

  it('should render unresolved error if error content generation throws', () => {
    (camelcaseKeys as unknown as jest.Mock)
      .mockImplementationOnce((value: unknown) => value)
      .mockImplementationOnce(() => {
        throw new Error('boom');
      });

    mockUpdateError = {
      response: {
        data: {
          employee: { first_name: ['bad'] },
        },
      },
    };

    renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    );
  });

  it('should return undefined on onNext when update throws', async () => {
    mockUpdateApplication.mockRejectedValueOnce(new Error('next failed'));
    const dispatchStep = jest.fn();
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    const output = await result.current.onNext(
      mockApplicationFormData as Application,
      dispatchStep,
      1,
      'app-1',
      mockApplicationFormData as Application
    );

    expect(output).toBeUndefined();
  });

  it('should return undefined on onBack when update throws', async () => {
    mockUpdateApplication.mockRejectedValueOnce(new Error('back failed'));
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    const output = await result.current.onBack();

    expect(output).toBeUndefined();
  });

  it('should return undefined on onQuietSave when create throws', async () => {
    mockCreateApplication.mockRejectedValueOnce(new Error('quiet failed'));
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    const output = await result.current.onQuietSave(
      mockApplicationFormData as Application,
      ''
    );

    expect(output).toBeUndefined();
  });

  it('should return undefined on onSave when update throws', async () => {
    mockUpdateApplication.mockRejectedValueOnce(new Error('save failed'));
    const { result } = renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    const output = await result.current.onSave(
      mockApplicationFormData as Application,
      'existing-id'
    );

    expect(output).toBeUndefined();
  });

  it('should initialize router navigation with application status', () => {
    renderHook(
      () => useFormActions(mockApplicationFormData, mockApplicationFormData),
      { wrapper: createContextWrapper() }
    );

    expect(useRouterNavigation).toHaveBeenCalledWith(
      APPLICATION_STATUSES.DRAFT
    );
  });
});
