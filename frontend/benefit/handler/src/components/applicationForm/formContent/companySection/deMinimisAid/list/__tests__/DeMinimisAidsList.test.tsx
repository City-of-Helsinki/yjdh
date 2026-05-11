import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { MAX_DEMINIMIS_AID_TOTAL_AMOUNT } from 'benefit/handler/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import React from 'react';

import i18n from '../../../../../../../../test/i18n/i18n-test';
import DeMinimisAidsList from '../DeMinimisAidsList';
import { useDeminimisAidsList } from '../useDeminimisAidsList';

jest.mock('../useDeminimisAidsList');

const mockUseDeminimisAidsList = useDeminimisAidsList as jest.Mock;

const t = i18n.t.bind(i18n);

const grants: DeMinimisAid[] = [
  {
    [DE_MINIMIS_AID_KEYS.GRANTER]: 'City of Helsinki',
    [DE_MINIMIS_AID_KEYS.AMOUNT]: 1234.5,
    [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '2024-01-15',
  },
  {
    [DE_MINIMIS_AID_KEYS.GRANTER]: 'Business Finland',
    [DE_MINIMIS_AID_KEYS.AMOUNT]: 2000,
    [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '2023-12-01',
  },
];

const baseHookReturn = {
  grants,
  t,
  translationsBase: 'common:applications.sections',
  handleRemove: jest.fn(),
  language: 'fi',
};

const setupHook = (overrides = {}): void => {
  mockUseDeminimisAidsList.mockReturnValue({
    ...baseHookReturn,
    ...overrides,
  });
};

const renderSubject = (): ReturnType<typeof renderComponent> =>
  renderComponent(<DeMinimisAidsList />);

describe('DeMinimisAidsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
  });

  it('renders one row per de minimis aid with grant data', () => {
    renderSubject();

    expect(screen.getByText('City of Helsinki')).toBeInTheDocument();
    expect(screen.getByText('Business Finland')).toBeInTheDocument();
    expect(screen.getByText('1234,5 €')).toBeInTheDocument();
    expect(screen.getByText('2000 €')).toBeInTheDocument();
    expect(screen.getByText('15.1.2024')).toBeInTheDocument();
    expect(screen.getByText('1.12.2023')).toBeInTheDocument();
  });

  it('calls handleRemove with row index when remove button is clicked', async () => {
    const handleRemove = jest.fn();
    setupHook({ handleRemove });

    renderSubject();

    await userEvent.click(screen.getAllByRole('button', { name: 'Poista' })[1]);

    expect(handleRemove).toHaveBeenCalledWith(1);
  });

  it('does not show max amount notification when total is at the limit', () => {
    setupHook({
      grants: [
        {
          [DE_MINIMIS_AID_KEYS.GRANTER]: 'A',
          [DE_MINIMIS_AID_KEYS.AMOUNT]: MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
          [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '2024-01-01',
        },
      ],
    });

    renderSubject();

    expect(
      screen.queryByText('Enimmäismäärä ylitetty')
    ).not.toBeInTheDocument();
  });

  it('shows max amount notification when total exceeds the limit', () => {
    setupHook({
      grants: [
        {
          [DE_MINIMIS_AID_KEYS.GRANTER]: 'A',
          [DE_MINIMIS_AID_KEYS.AMOUNT]: MAX_DEMINIMIS_AID_TOTAL_AMOUNT + 1,
          [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '2024-01-01',
        },
      ],
    });

    renderSubject();

    expect(screen.getByText('Enimmäismäärä ylitetty')).toBeInTheDocument();
    expect(
      screen.getByText(/De minimis-tuen enimmäismäärä on ylitetty./)
    ).toBeInTheDocument();
    expect(document.body).toHaveTextContent(
      `${MAX_DEMINIMIS_AID_TOTAL_AMOUNT.toLocaleString('fi').replaceAll(
        '\u00A0',
        ' '
      )} euroa`
    );
  });
});
