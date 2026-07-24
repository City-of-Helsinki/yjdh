import { act, renderHook } from '@testing-library/react-hooks';
import useSearchApplicationQuery from 'benefit/handler/hooks/useSearchApplicationQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';

import {
  DECISION_RANGE,
  prepareSearchData,
  SUBSIDY_IN_EFFECT,
  useApplicationsArchive,
} from '../useApplicationsArchive';

jest.mock('benefit/handler/hooks/useSearchApplicationQuery', () => jest.fn());
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseSearchApplicationQuery =
  useSearchApplicationQuery as jest.MockedFunction<
    typeof useSearchApplicationQuery
  >;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

const makeApplication = (
  overrides: Partial<ApplicationData> = {}
): ApplicationData =>
  ({
    application_step: 'handling',
    employee: {
      first_name: 'Matti',
      last_name: 'Meikalainen',
    },
    bases: [],
    use_alternative_address: false,
    archived: true,
    de_minimis_aid_set: [],
    training_compensations: [],
    company_contact_person_first_name: '',
    company_contact_person_last_name: '',
    talpa_status: '',
    ahjo_case_id: '',
    alterations: [],
    ...overrides,
  } as ApplicationData);

describe('useApplicationsArchive', () => {
  const mutate = jest.fn();
  const t = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({ t } as never);
    mockUseSearchApplicationQuery.mockReturnValue({
      data: {
        q: '',
        matches: [],
        filter: '',
        search_mode: '',
        count: 0,
      },
      isLoading: false,
      error: null,
      mutate,
    } as never);
  });

  describe('prepareSearchData', () => {
    it('sorts applications by handled date and maps accepted application fields', () => {
      const prepared = prepareSearchData([
        makeApplication({
          id: 'older',
          handled_at: '2024-01-15',
          application_number: 11,
          status: APPLICATION_STATUSES.ACCEPTED,
          company: {
            name: 'Old Company',
            business_id: '1111111-1',
          } as never,
          employee: {
            first_name: 'Matti',
            last_name: 'Meikalainen',
          } as never,
          calculation: {
            end_date: '2024-05-31',
          } as never,
          alterations: [{ id: 'alt-1' }] as never,
        }),
        makeApplication({
          id: 'newer',
          handled_at: '2024-02-15',
          application_number: 22,
          status: APPLICATION_STATUSES.REJECTED,
        }),
      ]);

      expect(prepared).toEqual([
        expect.objectContaining({
          id: 'newer',
          handledAt: '15.2.2024',
          applicationNum: 22,
          employeeName: 'Meikalainen, Matti',
          companyName: '-',
          companyId: '-',
          calculationEndDate: '-',
        }),
        expect.objectContaining({
          id: 'older',
          handledAt: '15.1.2024',
          applicationNum: 11,
          employeeName: 'Meikalainen, Matti',
          companyName: 'Old Company',
          companyId: '1111111-1',
          calculationEndDate: '31.5.2024',
          alterations: [{ id: 'alt-1' }],
        }),
      ]);
    });

    it('returns fallbacks for missing data and includes calculation end date for archival status', () => {
      const prepared = prepareSearchData([
        makeApplication({
          id: 'archival',
          status: APPLICATION_STATUSES.ARCHIVAL,
          handled_at: undefined,
          employee: {
            first_name: undefined,
            last_name: undefined,
          } as never,
          company: undefined,
          calculation: {
            end_date: '2024-08-01',
          } as never,
        }),
      ]);

      expect(prepared).toEqual([
        expect.objectContaining({
          id: 'archival',
          employeeName: '-',
          companyName: '-',
          companyId: '-',
          handledAt: '-',
          calculationEndDate: '1.8.2024',
        }),
      ]);
    });
  });

  it('passes archive search filters to the query hook and exposes submitSearch', () => {
    const { result } = renderHook(() =>
      useApplicationsArchive(
        'yritys',
        true,
        true,
        SUBSIDY_IN_EFFECT.RANGE_NOW,
        DECISION_RANGE.RANGE_THREE_YEARS,
        '42'
      )
    );

    expect(mockUseSearchApplicationQuery).toHaveBeenCalledWith(
      true,
      true,
      SUBSIDY_IN_EFFECT.RANGE_NOW,
      DECISION_RANGE.RANGE_THREE_YEARS,
      '42'
    );
    expect(result.current.t).toBe(t);

    act(() => {
      result.current.submitSearch('updated', { limit: 30, offset: 60 });
    });

    expect(mutate).toHaveBeenCalledWith({
      q: 'updated',
      limit: 30,
      offset: 60,
    });
  });

  it('passes undefined for optional filters when they are not selected', () => {
    renderHook(() => useApplicationsArchive('', true, true, null, null, null));

    expect(mockUseSearchApplicationQuery).toHaveBeenCalledWith(
      true,
      true,
      undefined,
      undefined,
      undefined
    );
  });

  it.each([
    [
      'an error exists',
      {
        data: {
          q: '',
          matches: [{ id: '1' }],
          filter: '',
          search_mode: '',
          count: 1,
        },
        isLoading: false,
        error: new Error('boom'),
      },
      true,
    ],
    [
      'search finished with no matches',
      {
        data: {
          q: '',
          matches: [],
          filter: '',
          search_mode: '',
          count: 0,
        },
        isLoading: false,
        error: null,
      },
      true,
    ],
    [
      'search is still loading',
      {
        data: {
          q: '',
          matches: [],
          filter: '',
          search_mode: '',
          count: 0,
        },
        isLoading: true,
        error: null,
      },
      false,
    ],
    [
      'search returns matches',
      {
        data: {
          q: '',
          matches: [makeApplication({ id: '1' })],
          filter: '',
          search_mode: '',
          count: 1,
        },
        isLoading: false,
        error: null,
      },
      false,
    ],
  ])('sets shouldHideList correctly when %s', (_description, queryResult, expected) => {
    mockUseSearchApplicationQuery.mockReturnValue({
      ...queryResult,
      mutate,
    } as never);

    const { result } = renderHook(() =>
      useApplicationsArchive('', true, true, null, null)
    );

    expect(result.current.shouldHideList).toBe(expected);
  });
});
