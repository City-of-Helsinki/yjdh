import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import React from 'react';

import i18n from '../../../../../test/i18n/i18n-test';
import CompanySearch from '../CompanySearch';
import { useCompanySearch } from '../useCompanySearch';

jest.mock('../useCompanySearch', () => ({
  useCompanySearch: jest.fn(),
}));

type CompanySearchHookResult = ReturnType<typeof useCompanySearch>;

const mockUseCompanySearch = useCompanySearch as jest.MockedFunction<
  typeof useCompanySearch
>;

const getCompany = jest.fn();
const getSuggestions = jest.fn().mockResolvedValue([]);
const onCompanyChange = jest.fn();
const onSelectCompany = jest.fn();
const t = i18n.t.bind(i18n) as CompanySearchHookResult['t'];

const createCompany = (
  overrides: Partial<{ business_id: string; name: string }> = {}
): { business_id: string; name: string } => ({
  business_id: '1234567-8',
  name: 'Yritys Oy',
  ...overrides,
});

const baseHookResult: CompanySearchHookResult = {
  companies: [],
  errorMessage: null,
  getCompany,
  getSuggestions,
  isLoading: false,
  noResults: null,
  onCompanyChange,
  onSelectCompany,
  selectedCompany: null,
  t,
  translationsBase: 'common:applications.sections',
};

const renderSubject = (
  overrides: Partial<CompanySearchHookResult> = {}
): void => {
  mockUseCompanySearch.mockReturnValue({
    ...baseHookResult,
    ...overrides,
  });

  renderComponent(<CompanySearch />);
};

const getSearchInput = (): HTMLElement =>
  screen.getByRole('combobox', {
    name: 'Kirjoita yrityksen tai yhteisön nimi tai Y-tunnus',
  });

describe('CompanySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders heading and search input before any results are shown', () => {
    renderSubject();

    expect(
      screen.getByRole('heading', { name: 'Etsi yritys tai yhteisö' })
    ).toBeInTheDocument();
    expect(getSearchInput()).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Valitse' })
    ).not.toBeInTheDocument();
  });

  it('forwards search actions to hook callbacks', async () => {
    renderSubject();

    await userEvent.type(getSearchInput(), 'Yritys Oy');
    await waitFor(() => {
      expect(getSuggestions).toHaveBeenLastCalledWith('Yritys Oy');
    });

    await userEvent.type(getSearchInput(), '{enter}');

    expect(getCompany).toHaveBeenCalledWith('Yritys Oy');
  });

  it('renders suggestions using mapped Search options', async () => {
    getSuggestions.mockResolvedValueOnce([
      { business_id: '1234567-8', name: 'Yritys Oy' },
    ]);

    renderSubject();

    await userEvent.type(getSearchInput(), 'Yritys');

    await waitFor(() => {
      expect(getSuggestions).toHaveBeenLastCalledWith('Yritys');
    });

    expect(
      screen.getByRole('option', { name: /yritys\s+oy/i })
    ).toBeInTheDocument();
  });

  it('renders company options and forwards company selection actions', async () => {
    const firstCompany = createCompany();
    const secondCompany = createCompany({
      business_id: '2345678-9',
      name: 'Toinen Yritys Oy',
    });

    renderSubject({
      companies: [firstCompany, secondCompany],
      selectedCompany: firstCompany.business_id,
    });

    expect(
      screen.getByRole('radio', {
        name: 'Yritys Oy <1234567-8>',
      })
    ).toBeChecked();

    await userEvent.click(
      screen.getByRole('radio', {
        name: 'Toinen Yritys Oy <2345678-9>',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Valitse' }));

    expect(onCompanyChange).toHaveBeenCalledWith('2345678-9');
    expect(onSelectCompany).toHaveBeenCalled();
  });

  it('renders error and no results notifications from hook state', () => {
    renderSubject({
      errorMessage: {
        label: 'Tapahtui virhe',
        text: 'Ole hyvä ja kokeile uudelleen myöhemmin.',
      },
      noResults: {
        label: 'Ei hakutuloksia',
        text: 'Kokeile toista hakusanaa tai kokonaista Y-tunnusta.',
      },
    });

    expect(screen.getByText('Tapahtui virhe')).toBeInTheDocument();
    expect(
      screen.getByText('Ole hyvä ja kokeile uudelleen myöhemmin.')
    ).toBeInTheDocument();
    expect(screen.getByText('Ei hakutuloksia')).toBeInTheDocument();
    expect(
      screen.getByText('Kokeile toista hakusanaa tai kokonaista Y-tunnusta.')
    ).toBeInTheDocument();
  });

  it('renders loading spinner while company search is loading', () => {
    renderSubject({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Ladataan');
  });
});
