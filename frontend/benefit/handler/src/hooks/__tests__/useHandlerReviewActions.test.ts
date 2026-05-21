import { renderHook } from '@testing-library/react-hooks';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import { useApplicationActions } from 'benefit/handler/hooks/useApplicationActions';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import useUpdateCompanyIndustryCode from 'benefit/handler/hooks/useUpdateCompanyIndustryCode';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

import useHandlerReviewActions from '../useHandlerReviewActions';

jest.mock('benefit/handler/hooks/useUpdateApplicationQuery', () => jest.fn());
jest.mock('benefit/handler/hooks/useUpdateCompanyIndustryCode', () =>
  jest.fn()
);
jest.mock('benefit/handler/hooks/useApplicationActions', () => ({
  useApplicationActions: jest.fn(),
}));
jest.mock(
  'benefit/handler/hooks/applicationHandling/useRouterNavigation',
  () => ({
    useRouterNavigation: jest.fn(),
  })
);
jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));

const buildApplication = (overrides: Partial<Application> = {}): Application =>
  ({
    id: 'app-1',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    company: { id: 'company-1', businessId: '1234567-1', name: 'Test Oy' },
    calculation: {
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      monthlyPay: '2000',
      otherExpenses: '100',
      vacationMoney: '200',
      stateAidMaxPercentage: 50,
      overrideMonthlyBenefitAmount: null,
      overrideMonthlyBenefitAmountComment: '',
    },
    ...overrides,
  } as unknown as Application);

const buildContextValue = (
  handledApplication: HandledAplication | null = null
): AppContextType => ({
  isNavigationVisible: false,
  isFooterVisible: true,
  isSidebarVisible: false,
  layoutBackgroundColor: theme.colors.white,
  handledApplication,
  setIsNavigationVisible: noop,
  setIsFooterVisible: noop,
  setLayoutBackgroundColor: noop,
  setHandledApplication: noop,
  setIsSidebarVisible: noop,
});

const makeWrapper =
  (handledApplication: HandledAplication | null) =>
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      AppContext.Provider,
      { value: buildContextValue(handledApplication) },
      children
    );

describe('useHandlerReviewActions', () => {
  const mockMutate = jest.fn();
  const mockUpdateCompanyMutate = jest.fn();
  const mockUpdateStatus = jest.fn();
  const mockNavigateBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateApplicationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: null,
    });
    (useUpdateCompanyIndustryCode as jest.Mock).mockReturnValue({
      mutate: mockUpdateCompanyMutate,
    });
    (useApplicationActions as jest.Mock).mockReturnValue({
      updateStatus: mockUpdateStatus,
    });
    (useRouterNavigation as jest.Mock).mockReturnValue({
      navigateBack: mockNavigateBack,
    });
  });

  it('returns all expected actions', () => {
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(null) }
    );

    expect(result.current.onCalculateEmployment).toBeDefined();
    expect(result.current.onSaveAndClose).toBeDefined();
    expect(result.current.onDone).toBeDefined();
    expect(result.current.onCancel).toBeDefined();
    expect(result.current.calculateSalaryBenefit).toBeDefined();
  });

  it('onSaveAndClose calls navigateBack', () => {
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(null) }
    );

    result.current.onSaveAndClose();

    expect(mockNavigateBack).toHaveBeenCalled();
  });

  it('onCancel calls updateStatus with the cancelled application status', () => {
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(null) }
    );

    const cancelledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.CANCELLED,
      logEntryComment: 'test reason',
    };

    result.current.onCancel(cancelledApplication);

    expect(mockUpdateStatus).toHaveBeenCalledWith(
      APPLICATION_STATUSES.CANCELLED,
      'test reason',
      false
    );
  });

  it('onCancel does nothing when status is missing', () => {
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(null) }
    );

    result.current.onCancel({});

    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('onDone calls updateStatus directly when grantedAsDeMinimisAid is false', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: false,
    };
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(handledApplication) }
    );

    result.current.onDone();

    expect(mockUpdateStatus).toHaveBeenCalledWith(
      APPLICATION_STATUSES.ACCEPTED,
      undefined,
      false
    );
    expect(mockUpdateCompanyMutate).not.toHaveBeenCalled();
  });

  it('onDone calls updateCompanyIndustryCode.mutate when grantedAsDeMinimisAid is true with industryCode', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCode: '62010',
      industryDescription: 'Computer programming',
    };
    const application = buildApplication();
    const { result } = renderHook(() => useHandlerReviewActions(application), {
      wrapper: makeWrapper(handledApplication),
    });

    result.current.onDone();

    expect(mockUpdateCompanyMutate).toHaveBeenCalledWith(
      {
        companyId: 'company-1',
        industryCode: '62010',
        industry: 'Computer programming',
      },
      { onSuccess: expect.any(Function) }
    );
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('onDone does nothing when handledApplication has no status', () => {
    const handledApplication: HandledAplication = {};
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(handledApplication) }
    );

    result.current.onDone();

    expect(mockUpdateStatus).not.toHaveBeenCalled();
    expect(mockUpdateCompanyMutate).not.toHaveBeenCalled();
  });

  it('calculateSalaryBenefit calls updateApplicationQuery.mutate', () => {
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(null) }
    );

    result.current.calculateSalaryBenefit({
      startDate: '01.01.2026',
      endDate: '30.06.2026',
      monthlyPay: '2000',
      otherExpenses: '100',
      vacationMoney: '200',
      stateAidMaxPercentage: 50,
      overrideMonthlyBenefitAmount: null,
      overrideMonthlyBenefitAmountComment: '',
      paySubsidies: [],
      trainingCompensations: [],
    });

    expect(mockMutate).toHaveBeenCalled();
  });

  it('onCalculateEmployment calls updateApplicationQuery.mutate', () => {
    const { result } = renderHook(
      () => useHandlerReviewActions(buildApplication()),
      { wrapper: makeWrapper(null) }
    );

    result.current.onCalculateEmployment({
      startDate: '01.01.2026',
      endDate: '30.06.2026',
      monthlyPay: '2000',
      otherExpenses: '100',
      vacationMoney: '200',
      stateAidMaxPercentage: 50,
      overrideMonthlyBenefitAmount: null,
      overrideMonthlyBenefitAmountComment: '',
      paySubsidies: [],
      trainingCompensations: [],
    });

    expect(mockMutate).toHaveBeenCalled();
  });

  it('setCalculationErrors receives 400 error data on client error', () => {
    const mockSetCalculationErrors = jest.fn();
    const errorResponse = {
      response: {
        status: 422,
        data: { calculation: { start_date: ['This field is required.'] } },
      },
    };
    (useUpdateApplicationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: errorResponse,
    });

    renderHook(
      () =>
        useHandlerReviewActions(buildApplication(), mockSetCalculationErrors),
      { wrapper: makeWrapper(null) }
    );

    expect(mockSetCalculationErrors).toHaveBeenCalledWith(
      expect.objectContaining({
        calculation: expect.any(Object),
      })
    );
  });

  it('setCalculationErrors receives generic error on server error (500)', () => {
    const mockSetCalculationErrors = jest.fn();
    const errorResponse = {
      response: { status: 500, data: {} },
    };
    (useUpdateApplicationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: errorResponse,
    });

    renderHook(
      () =>
        useHandlerReviewActions(buildApplication(), mockSetCalculationErrors),
      { wrapper: makeWrapper(null) }
    );

    expect(mockSetCalculationErrors).toHaveBeenCalledWith(
      expect.objectContaining({ calculation: expect.any(Object) })
    );
  });

  it('setCalculationErrors is cleared when there is no error', () => {
    const mockSetCalculationErrors = jest.fn();
    (useUpdateApplicationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: null,
    });

    renderHook(
      () =>
        useHandlerReviewActions(buildApplication(), mockSetCalculationErrors),
      { wrapper: makeWrapper(null) }
    );

    expect(mockSetCalculationErrors).toHaveBeenCalledWith(null);
  });
});
