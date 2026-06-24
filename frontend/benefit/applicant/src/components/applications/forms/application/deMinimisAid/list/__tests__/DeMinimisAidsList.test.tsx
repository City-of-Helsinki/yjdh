import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import DeMinimisAidsList from 'benefit/applicant/components/applications/forms/application/deMinimisAid/list/DeMinimisAidsList';
import { MAX_DEMINIMIS_AID_TOTAL_AMOUNT } from 'benefit/applicant/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import React from 'react';

import i18n from '../../../../../../../../test/i18n/i18n-test';
import { useDeminimisAidsList } from '../useDeminimisAidsList';

jest.mock(
  'benefit/applicant/components/applications/forms/application/deMinimisAid/list/useDeminimisAidsList'
);

const mockUseDeminimisAidsList = useDeminimisAidsList as jest.Mock;

const deMinimisAidMaxAmountLabelText = 'Enimmäismäärä ylitetty';
const deMinimisAidMaxAmountContentStart =
  'De minimis -tuen enimmäismäärä on ylitetty.';

const t = i18n.t.bind(i18n);

const grants = [
  {
    id: 1,
    [DE_MINIMIS_AID_KEYS.GRANTER]: 'City of Helsinki',
    [DE_MINIMIS_AID_KEYS.AMOUNT]: '1234.5',
    [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '2024-01-15',
  },
  {
    id: 2,
    [DE_MINIMIS_AID_KEYS.GRANTER]: 'Business Finland',
    [DE_MINIMIS_AID_KEYS.AMOUNT]: '2000',
    [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '2023-12-01',
  },
];

const baseHookReturn = {
  grants,
  t,
  translationsBase: 'common:applications.sections.company',
  handleRemove: jest.fn(),
  deMinimisTotal: jest.fn(() => 0),
  language: 'fi',
};

const setupHook = (overrides = {}): void => {
  mockUseDeminimisAidsList.mockReturnValue({
    ...baseHookReturn,
    ...overrides,
  });
};

const renderList = (): ReturnType<typeof renderComponent> =>
  renderComponent(<DeMinimisAidsList />);

describe('DeMinimisAidsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
  });

  it('renders one row per de minimis aid', () => {
    renderList();

    expect(screen.getAllByTestId('deminimis-row')).toHaveLength(2);
  });

  it('renders grant data with formatted amount and date', () => {
    renderList();

    [
      'City of Helsinki',
      'Business Finland',
      '1234,5 €',
      '2000 €',
      '15.1.2024',
      '1.12.2023',
    ].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('calls handleRemove with row index when remove button is clicked', async () => {
    const handleRemove = jest.fn();
    setupHook({ handleRemove });
    const user = setupUserAndRender(() => {
      renderList();
    });

    await user.click(screen.getByTestId('deminimis-remove-1'));

    expect(handleRemove).toHaveBeenCalledWith(1);
  });

  it('does not show max-amount notification when total is within limit', () => {
    setupHook({
      deMinimisTotal: jest.fn(() => MAX_DEMINIMIS_AID_TOTAL_AMOUNT),
    });

    renderList();

    expect(
      screen.queryByTestId('deminimis-maxed-notification')
    ).not.toBeInTheDocument();
  });

  it('shows max-amount notification when total exceeds limit', () => {
    setupHook({
      deMinimisTotal: jest.fn(() => MAX_DEMINIMIS_AID_TOTAL_AMOUNT + 1),
    });

    renderList();

    expect(
      screen.getByTestId('deminimis-maxed-notification')
    ).toBeInTheDocument();
    const notification = screen.getByTestId('deminimis-maxed-notification');
    const amountWithAnyWhitespace =
      MAX_DEMINIMIS_AID_TOTAL_AMOUNT.toLocaleString('fi').replace(
        /\s/u,
        String.raw`\s`
      );

    expect(
      screen.getByText(deMinimisAidMaxAmountLabelText)
    ).toBeInTheDocument();
    expect(notification).toHaveTextContent(deMinimisAidMaxAmountContentStart);
    expect(notification).toHaveTextContent(
      new RegExp(`${amountWithAnyWhitespace} euroa`)
    );
  });
});
