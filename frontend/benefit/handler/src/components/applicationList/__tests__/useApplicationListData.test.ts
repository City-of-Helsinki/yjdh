import { renderHook } from '@testing-library/react';
import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import { getFullName } from 'shared/utils/application.utils';
import {
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';

import { useApplicationListData } from '../useApplicationListData';

jest.mock('benefit/handler/hooks/useApplicationsQuery', () => jest.fn());
jest.mock('benefit/handler/hooks/useDetermineAhjoMode', () => ({
  useDetermineAhjoMode: jest.fn(),
}));
jest.mock('shared/utils/application.utils', () => ({
  getFullName: jest.fn(),
}));
jest.mock('shared/utils/date.utils', () => ({
  convertToUIDateFormat: jest.fn(),
  convertToUIDateAndTimeFormat: jest.fn(),
}));

const mockedUseApplicationsQuery = useApplicationsQuery as jest.Mock;
const mockedUseDetermineAhjoMode = useDetermineAhjoMode as jest.Mock;
const mockedGetFullName = getFullName as jest.Mock;
const mockedConvertToUIDateFormat = convertToUIDateFormat as jest.Mock;
const mockedConvertToUIDateAndTimeFormat =
  convertToUIDateAndTimeFormat as jest.Mock;

const buildApplication = (
  overrides: Partial<ApplicationData> = {}
): ApplicationData =>
  ({
    id: 'app-1',
    status: APPLICATION_STATUSES.RECEIVED,
    company: { name: 'Acme Oy', business_id: '1234567-8' },
    employee: { first_name: 'Matti', last_name: 'Meikäläinen' },
    submitted_at: '2024-01-01',
    modified_at: '2024-01-02',
    application_number: 1,
    calculation: undefined,
    additional_information_needed_by: undefined,
    unread_messages_count: undefined,
    batch: undefined,
    talpa_status: undefined,
    ahjo_case_id: undefined,
    application_origin: undefined,
    handled_by_ahjo_automation: false,
    handled_at: undefined,
    ahjo_error: undefined,
    first_instalment: undefined,
    second_instalment: undefined,
    alterations: undefined,
    ...overrides,
  } as unknown as ApplicationData);

describe('useApplicationListData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFullName.mockImplementation((first?: string, last?: string) =>
      [first, last].filter(Boolean).join(' ')
    );
    mockedConvertToUIDateFormat.mockImplementation((date?: string) =>
      date ? `UI:${date}` : ''
    );
    mockedConvertToUIDateAndTimeFormat.mockImplementation((date?: string) =>
      date ? `UIDT:${date}` : ''
    );
    mockedUseDetermineAhjoMode.mockReturnValue(false);
  });

  it.each([
    [true, false, undefined, 'loading'],
    [false, true, new Error('failed'), 'error'],
    [false, true, undefined, 'empty data'],
  ])(
    'returns shouldShowSkeleton=%s, shouldHideList=%s when %s',
    (shouldShow, shouldHide, error, scenario) => {
      const data = scenario === 'empty data' ? [] : undefined;
      mockedUseApplicationsQuery.mockReturnValue({
        data,
        isLoading: scenario === 'loading',
        error,
      });

      const { result } = renderHook(() =>
        useApplicationListData([APPLICATION_STATUSES.RECEIVED])
      );

      expect(result.current.shouldShowSkeleton).toBe(shouldShow);
      expect(result.current.shouldHideList).toBe(shouldHide);
      expect(result.current.list).toEqual([]);
    }
  );

  it('does not hide the list when data is present', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [buildApplication()],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([APPLICATION_STATUSES.RECEIVED])
    );

    expect(result.current.shouldHideList).toBe(false);
    expect(result.current.list).toHaveLength(1);
  });

  it('transforms ApplicationData into ApplicationListItemData with expected fields', () => {
    const application = buildApplication({
      calculation: {
        handler_details: { first_name: 'Hanna', last_name: 'Handler' },
        calculated_benefit_amount: '250.00',
      },
      additional_information_needed_by: '2024-02-01',
      unread_messages_count: 3,
      batch: { decision_date: '2024-03-01' },
      talpa_status: 'not_sent_to_talpa',
      ahjo_case_id: 'AHJO-1',
      application_origin: 'handler',
      handled_by_ahjo_automation: true,
      handled_at: '2024-04-01',
      ahjo_error: { error_from_ahjo: 'oops' },
      first_instalment: { amount: 100 },
      second_instalment: { amount: 150 },
      alterations: [{ id: 'alt-1' }],
    } as never);

    mockedUseApplicationsQuery.mockReturnValue({
      data: [application],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([APPLICATION_STATUSES.RECEIVED])
    );

    const [item] = result.current.list;

    expect(item.id).toBe('app-1');
    expect(item.companyName).toBe('Acme Oy');
    expect(item.companyId).toBe('1234567-8');
    expect(item.employeeName).toBe('Matti Meikäläinen');
    expect(item.submittedAt).toBe('UI:2024-01-01');
    expect(item.modifiedAt).toBe('UIDT:2024-01-02');
    expect(item.additionalInformationNeededBy).toBe('UI:2024-02-01');
    expect(item.applicationNum).toBe(1);
    expect(item.handlerName).toBe('Hanna H.');
    expect(item.unreadMessagesCount).toBe(3);
    expect(item.batch).toEqual({ decision_date: '2024-03-01' });
    expect(item.applicationOrigin).toBe('handler');
    expect(item.talpaStatus).toBe('not_sent_to_talpa');
    expect(item.ahjoCaseId).toBe('AHJO-1');
    expect(item.handledByAhjoAutomation).toBe(true);
    expect(item.handledAt).toBe('UI:2024-04-01');
    expect(item.ahjoError).toEqual({ errorFromAhjo: 'oops' });
    expect(item.decisionDate).toBe('UI:2024-03-01');
    expect(item.calculatedBenefitAmount).toBe('250.00');
    expect(item.firstInstalment).toEqual({ amount: 100 });
    expect(item.secondInstalment).toEqual({ amount: 150 });
    expect(item.alterations).toEqual([{ id: 'alt-1' }]);
  });

  it('applies default fallback values for missing fields', () => {
    const application = buildApplication({
      id: undefined,
      company: undefined,
      employee: undefined,
      submitted_at: undefined,
      modified_at: undefined,
      additional_information_needed_by: undefined,
      calculation: undefined,
      unread_messages_count: undefined,
      batch: undefined,
      handled_at: undefined,
      ahjo_error: undefined,
      first_instalment: undefined,
      second_instalment: undefined,
      alterations: undefined,
    } as never);

    mockedUseApplicationsQuery.mockReturnValue({
      data: [application],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([APPLICATION_STATUSES.RECEIVED])
    );

    const [item] = result.current.list;

    expect(item.id).toBe('');
    expect(item.companyName).toBe('-');
    expect(item.companyId).toBe('-');
    expect(item.employeeName).toBe('-');
    expect(item.submittedAt).toBe('-');
    expect(item.modifiedAt).toBe('-');
    expect(item.additionalInformationNeededBy).toBe('-');
    expect(item.handlerName).toBe('-');
    expect(item.unreadMessagesCount).toBe(0);
    expect(item.batch).toBeUndefined();
    expect(item.handledAt).toBe('-');
    expect(item.ahjoError).toBeUndefined();
    expect(item.decisionDate).toBe('-');
    expect(item.calculatedBenefitAmount).toBe('0');
    expect(item.firstInstalment).toBeUndefined();
    expect(item.secondInstalment).toBeUndefined();
    expect(item.alterations).toEqual([]);
  });

  it.each([
    [APPLICATION_STATUSES.DRAFT, false],
    [APPLICATION_STATUSES.DRAFT, true],
    [APPLICATION_STATUSES.RECEIVED, false],
    [APPLICATION_STATUSES.RECEIVED, true],
  ])(
    'always includes %s applications regardless of ahjo mode (%s)',
    (status, isNewAhjoMode) => {
      mockedUseDetermineAhjoMode.mockReturnValue(isNewAhjoMode);
      mockedUseApplicationsQuery.mockReturnValue({
        data: [buildApplication({ status })],
        isLoading: false,
        error: undefined,
      });

      const { result } = renderHook(() => useApplicationListData([status]));

      expect(result.current.list).toHaveLength(1);
    }
  );

  it('filters out applications with no status', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [buildApplication({ status: undefined })],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([APPLICATION_STATUSES.RECEIVED])
    );

    expect(result.current.list).toHaveLength(0);
  });

  it('in old ahjo mode, includes handling/accepted/rejected applications only when not automated by ahjo', () => {
    mockedUseDetermineAhjoMode.mockReturnValue(false);
    mockedUseApplicationsQuery.mockReturnValue({
      data: [
        buildApplication({
          id: 'manual',
          status: APPLICATION_STATUSES.HANDLING,
          handled_by_ahjo_automation: false,
        }),
        buildApplication({
          id: 'automated',
          status: APPLICATION_STATUSES.ACCEPTED,
          handled_by_ahjo_automation: true,
        }),
      ],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([
        APPLICATION_STATUSES.HANDLING,
        APPLICATION_STATUSES.ACCEPTED,
      ])
    );

    expect(result.current.list.map((item) => item.id)).toEqual(['manual']);
  });

  it('in new ahjo mode, includes handling/accepted/rejected applications only when automated by ahjo', () => {
    mockedUseDetermineAhjoMode.mockReturnValue(true);
    mockedUseApplicationsQuery.mockReturnValue({
      data: [
        buildApplication({
          id: 'manual',
          status: APPLICATION_STATUSES.HANDLING,
          handled_by_ahjo_automation: false,
        }),
        buildApplication({
          id: 'automated',
          status: APPLICATION_STATUSES.REJECTED,
          handled_by_ahjo_automation: true,
        }),
      ],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([
        APPLICATION_STATUSES.HANDLING,
        APPLICATION_STATUSES.REJECTED,
      ])
    );

    expect(result.current.list.map((item) => item.id)).toEqual(['automated']);
  });

  it('excludes applications with statuses outside of the known filter groups', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [
        buildApplication({
          id: 'cancelled',
          status: APPLICATION_STATUSES.CANCELLED,
        }),
      ],
      isLoading: false,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useApplicationListData([APPLICATION_STATUSES.CANCELLED])
    );

    expect(result.current.list).toHaveLength(0);
  });

  it('passes excludeBatched parameter through to useApplicationsQuery', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    });

    renderHook(() =>
      useApplicationListData([APPLICATION_STATUSES.RECEIVED], true)
    );

    expect(mockedUseApplicationsQuery).toHaveBeenCalledWith(
      [APPLICATION_STATUSES.RECEIVED],
      '-submitted_at',
      true
    );
  });

  it('calls useApplicationsQuery with undefined excludeBatched when not provided', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    });

    renderHook(() => useApplicationListData([APPLICATION_STATUSES.RECEIVED]));

    expect(mockedUseApplicationsQuery).toHaveBeenCalledWith(
      [APPLICATION_STATUSES.RECEIVED],
      '-submitted_at',
      undefined
    );
  });
});
