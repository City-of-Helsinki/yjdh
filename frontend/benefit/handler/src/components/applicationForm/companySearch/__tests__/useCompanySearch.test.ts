import { act, renderHook, waitFor } from '@testing-library/react';
import useFormActions from 'benefit/handler/hooks/useFormActions';
import { FinnishBusinessIds as bId } from 'finnish-business-ids';

import { getCompanyData, searchCompanies } from '../companyApi';
import { useCompanySearch } from '../useCompanySearch';

jest.mock('../companyApi', () => ({
  getCompanyData: jest.fn(),
  searchCompanies: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useFormActions', () => jest.fn());

jest.mock('finnish-business-ids', () => ({
  FinnishBusinessIds: { isValidBusinessId: jest.fn() },
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));

const mockGetCompanyData = getCompanyData as jest.MockedFunction<
  typeof getCompanyData
>;
const mockSearchCompanies = searchCompanies as jest.MockedFunction<
  typeof searchCompanies
>;
const mockUseFormActions = useFormActions as jest.MockedFunction<
  typeof useFormActions
>;
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockIsValidBusinessId = bId.isValidBusinessId as jest.MockedFunction<
  typeof bId.isValidBusinessId
>;

// Placeholder id used across tests; validity is fully controlled via the
// mocked isValidBusinessId, so this never needs to be a real business id.
const BUSINESS_ID = '1234567-8';

// getCompany's exposed type is `(searchTerm: string) => void`, but the
// implementation is async; cast so tests can await it to flush state updates.
const callGetCompany = (
  hookResult: ReturnType<typeof useCompanySearch>,
  searchTerm: string
): Promise<void> =>
  hookResult.getCompany(searchTerm) as unknown as Promise<void>;

// onSelectCompany's exposed type is also `() => void`, despite the async
// implementation; cast so tests can await it to flush state updates.
const callOnSelectCompany = (
  hookResult: ReturnType<typeof useCompanySearch>
): Promise<void> => hookResult.onSelectCompany() as unknown as Promise<void>;

describe('useCompanySearch', () => {
  const onCompanySelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidBusinessId.mockReturnValue(false);
    mockUseFormActions.mockReturnValue({
      onCompanySelected,
      onNext: jest.fn(),
      onSubmit: jest.fn(),
      onBack: jest.fn(),
      onSave: jest.fn(),
      onQuietSave: jest.fn(),
      onDelete: jest.fn(),
    });
    onCompanySelected.mockResolvedValue();
  });

  describe('getSuggestions', () => {
    it('resolves an empty array when the search term is too short', async () => {
      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions('ab')).resolves.toEqual([]);
      expect(mockGetCompanyData).not.toHaveBeenCalled();
      expect(mockSearchCompanies).not.toHaveBeenCalled();
    });

    it('formats a single result when the term is a valid business id', async () => {
      mockIsValidBusinessId.mockReturnValue(true);
      mockGetCompanyData.mockResolvedValueOnce({
        id: 'company-1',
        name: 'Yritys Oy',
        business_id: BUSINESS_ID,
      } as never);

      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions(BUSINESS_ID)).resolves.toEqual(
        [{ name: `Yritys Oy <${BUSINESS_ID}>`, business_id: BUSINESS_ID }]
      );
    });

    it('resolves an empty array when business id lookup fails', async () => {
      mockIsValidBusinessId.mockReturnValue(true);
      mockGetCompanyData.mockRejectedValueOnce(new Error('not found'));

      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions(BUSINESS_ID)).resolves.toEqual(
        []
      );
    });

    it('filters and formats results from a name search', async () => {
      mockSearchCompanies.mockResolvedValueOnce([
        { name: 'Yritys Oy', business_id: '1111111-1' },
        { name: 'Toinen Oy', business_id: '2222222-2' },
      ] as never);

      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions('yritys')).resolves.toEqual([
        { name: 'Yritys Oy <1111111-1>', business_id: '1111111-1' },
      ]);
    });

    it('resolves an empty array when the name search has no matches', async () => {
      mockSearchCompanies.mockResolvedValueOnce([
        { name: 'Toinen Oy', business_id: '2222222-2' },
      ] as never);

      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions('yritys')).resolves.toEqual(
        []
      );
    });

    it('resolves an empty array when the name search rejects', async () => {
      mockSearchCompanies.mockRejectedValueOnce(new Error('network error'));

      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions('yritys')).resolves.toEqual(
        []
      );
    });

    it('formats a result without a business_id using an empty string', async () => {
      mockSearchCompanies.mockResolvedValueOnce([
        { name: 'Yritys Oy', business_id: '' },
      ] as never);

      const { result } = renderHook(() => useCompanySearch());

      await expect(result.current.getSuggestions('yritys')).resolves.toEqual([
        { name: 'Yritys Oy', business_id: '' },
      ]);
    });
  });

  describe('getCompany', () => {
    it('does nothing when the search term is too short', async () => {
      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, 'ab');
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockSearchCompanies).not.toHaveBeenCalled();
      expect(mockGetCompanyData).not.toHaveBeenCalled();
    });

    it('creates a draft directly from a "<business id>" suffix match', async () => {
      mockGetCompanyData.mockResolvedValueOnce({
        id: 'company-1',
        name: 'Yritys Oy',
      } as never);

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, `Yritys Oy <${BUSINESS_ID}>`);
      });

      expect(mockGetCompanyData).toHaveBeenCalledWith(BUSINESS_ID);
      expect(onCompanySelected).toHaveBeenCalledWith(
        expect.objectContaining({ createApplicationForCompany: 'company-1' })
      );
    });

    it('creates a draft directly when the whole term is a valid business id', async () => {
      mockIsValidBusinessId.mockReturnValue(true);
      mockGetCompanyData.mockResolvedValueOnce({
        id: 'company-2',
        name: 'Yritys Oy',
      } as never);

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, BUSINESS_ID);
      });

      expect(mockGetCompanyData).toHaveBeenCalledWith(BUSINESS_ID);
      expect(onCompanySelected).toHaveBeenCalledWith(
        expect.objectContaining({ createApplicationForCompany: 'company-2' })
      );
    });

    it('does not create a draft when company data has no id', async () => {
      mockIsValidBusinessId.mockReturnValue(true);
      mockGetCompanyData.mockResolvedValueOnce({ name: 'Yritys Oy' } as never);

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, BUSINESS_ID);
      });

      expect(onCompanySelected).not.toHaveBeenCalled();
    });

    it('sets companies and selects the first result on a successful name search', async () => {
      mockSearchCompanies.mockResolvedValueOnce([
        { name: 'Yritys Oy', business_id: '1111111-1' },
        { name: 'Toinen Oy', business_id: '2222222-2' },
      ] as never);

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, 'yritys');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.companies).toHaveLength(2);
      expect(result.current.selectedCompany).toBe('1111111-1');
      expect(result.current.noResults).toBeNull();
    });

    it('sets a noResults notification when the name search returns nothing', async () => {
      mockSearchCompanies.mockResolvedValueOnce([] as never);

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, 'yritys');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.noResults).toEqual({
        label:
          'common:applications.sections.companySearch.notifications.noResults.label',
        text: 'common:applications.sections.companySearch.notifications.noResults.text',
      });
    });

    it('sets an errorMessage with the axios error text when the name search rejects', async () => {
      mockSearchCompanies.mockRejectedValueOnce({
        message: 'Network Error',
      });

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, 'yritys');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.errorMessage).toEqual({
        label:
          'common:applications.sections.companySearch.notifications.error.label',
        text: 'Network Error',
      });
    });

    it('sets a generic errorMessage when the rejected error has no message', async () => {
      mockSearchCompanies.mockRejectedValueOnce({});

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, 'yritys');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.errorMessage).toEqual({
        label:
          'common:applications.sections.companySearch.notifications.error.label',
        text: 'common:applications.sections.companySearch.notifications.error.text',
      });
    });

    it('sets an errorMessage when creating a draft from the selected company fails', async () => {
      mockIsValidBusinessId.mockReturnValue(true);
      mockGetCompanyData.mockResolvedValueOnce({
        id: 'company-1',
        name: 'Yritys Oy',
      } as never);
      onCompanySelected.mockRejectedValueOnce({ message: 'Draft failed' });

      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callGetCompany(result.current, BUSINESS_ID);
      });

      await waitFor(() => {
        expect(result.current.errorMessage).toEqual({
          label:
            'common:applications.sections.companySearch.notifications.error.label',
          text: 'Draft failed',
        });
      });
    });
  });

  describe('onCompanyChange / onSelectCompany', () => {
    it('updates the selected company', () => {
      const { result } = renderHook(() => useCompanySearch());

      act(() => {
        result.current.onCompanyChange('1111111-1');
      });

      expect(result.current.selectedCompany).toBe('1111111-1');
    });

    it('creates a draft for the selected company and clears companies', async () => {
      mockGetCompanyData.mockResolvedValueOnce({
        id: 'company-1',
        name: 'Yritys Oy',
      } as never);

      const { result } = renderHook(() => useCompanySearch());

      act(() => {
        result.current.onCompanyChange(BUSINESS_ID);
      });

      await act(async () => {
        await callOnSelectCompany(result.current);
      });

      expect(mockGetCompanyData).toHaveBeenCalledWith(BUSINESS_ID);
      expect(onCompanySelected).toHaveBeenCalledWith(
        expect.objectContaining({ createApplicationForCompany: 'company-1' })
      );
      expect(result.current.companies).toEqual([]);
    });

    it('does nothing when no company is selected', async () => {
      const { result } = renderHook(() => useCompanySearch());

      await act(async () => {
        await callOnSelectCompany(result.current);
      });

      expect(mockGetCompanyData).not.toHaveBeenCalled();
      expect(result.current.companies).toEqual([]);
    });
  });
});
