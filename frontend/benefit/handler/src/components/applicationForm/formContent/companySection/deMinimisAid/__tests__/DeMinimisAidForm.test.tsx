import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import DeMinimisContext, {
  DeMinimisContextType,
} from 'benefit/handler/context/DeMinimisContext';
import { DeMinimisAid } from 'benefit-shared/types/application';
import React from 'react';

import DeMinimisAidForm from '../DeMinimisAidForm';

jest.mock('hds-react', () => {
  const actual = jest.requireActual<typeof import('hds-react')>('hds-react');
  const ReactM = jest.requireActual<typeof import('react')>('react');
  return {
    ...actual,
    DateInput: ({
      onChange,
      label,
      id,
      name,
    }: {
      onChange: (value: string) => void;
      label: string;
      id: string;
      name: string;
    }) =>
      ReactM.createElement(
        'div',
        null,
        ReactM.createElement('label', { htmlFor: id }, label),
        ReactM.createElement('input', {
          type: 'text',
          id,
          name,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value),
        })
      ),
  };
});

const buildContextValue = (
  overrides: Partial<DeMinimisContextType> = {}
): DeMinimisContextType => ({
  deMinimisAids: [],
  setDeMinimisAids: jest.fn(),
  unfinishedDeMinimisAidRow: false,
  setUnfinishedDeMinimisAidRow: jest.fn(),
  ...overrides,
});

const renderSubject = (
  data: DeMinimisAid[] = [],
  contextOverrides: Partial<DeMinimisContextType> = {}
): DeMinimisContextType => {
  const contextValue = buildContextValue(contextOverrides);
  renderComponent(
    <DeMinimisContext.Provider value={contextValue}>
      <DeMinimisAidForm data={data} />
    </DeMinimisContext.Provider>
  );
  return contextValue;
};

const getGranterInput = (): HTMLElement =>
  screen.getByLabelText(/Tuen myöntäjä/);
const getAmountInput = (): HTMLElement => screen.getByLabelText(/Tuen määrä/);
const getDateInput = (): HTMLElement =>
  screen.getByLabelText(/Myöntämispäivämäärä/);
const getAddButton = (): HTMLElement =>
  screen.getByRole('button', { name: /Lisää/ });

describe('DeMinimisAidForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields with Finnish labels', () => {
    renderSubject();

    expect(getGranterInput()).toBeInTheDocument();
    expect(getAmountInput()).toBeInTheDocument();
    expect(getDateInput()).toBeInTheDocument();
  });

  it('renders the add button', () => {
    renderSubject();

    expect(getAddButton()).toBeInTheDocument();
  });

  it('disables the add button when fields are empty', () => {
    renderSubject();

    expect(getAddButton()).toBeDisabled();
  });

  it('enables the add button when all fields are filled with valid values', async () => {
    renderSubject();

    await userEvent.type(getGranterInput(), 'Helsinki');
    await userEvent.type(getAmountInput(), '1000');
    await userEvent.type(getDateInput(), '1.1.2024');

    await waitFor(() => {
      expect(getAddButton()).toBeEnabled();
    });
  });

  it('adds a grant to context when the form is submitted', async () => {
    const setDeMinimisAids = jest.fn();
    renderSubject([], { setDeMinimisAids });

    await userEvent.type(getGranterInput(), 'Helsinki');
    await userEvent.type(getAmountInput(), '1000');
    await userEvent.type(getDateInput(), '1.1.2024');
    await waitFor(() => expect(getAddButton()).toBeEnabled());
    await userEvent.click(getAddButton());

    // On submission, setDeMinimisAids is called with a state updater function
    await waitFor(() => {
      const updaterCalls = setDeMinimisAids.mock.calls.filter(
        ([arg]: [unknown]) => typeof arg === 'function'
      );
      expect(updaterCalls).toHaveLength(1);
    });
  });

  it('clears fields after submission', async () => {
    renderSubject();

    await userEvent.type(getGranterInput(), 'Helsinki');
    await userEvent.type(getAmountInput(), '1000');
    await userEvent.type(getDateInput(), '1.1.2024');
    await waitFor(() => expect(getAddButton()).toBeEnabled());
    await userEvent.click(getAddButton());

    await waitFor(() => expect(getGranterInput()).toHaveValue(''));
    expect(getAmountInput()).toHaveValue('');
  });

  it('disables the add button when total grants exceed the maximum', () => {
    const existingGrants: DeMinimisAid[] = [
      { granter: 'A', amount: 300_001, grantedAt: '2024-01-01' },
    ];
    renderSubject(existingGrants, {
      deMinimisAids: existingGrants,
    });

    expect(getAddButton()).toBeDisabled();
  });

  it('marks the row as unfinished when fields are partially filled', async () => {
    const setUnfinishedDeMinimisAidRow = jest.fn();
    renderSubject([], { setUnfinishedDeMinimisAidRow });

    await userEvent.type(getGranterInput(), 'Helsinki');

    expect(setUnfinishedDeMinimisAidRow).toHaveBeenCalledWith(true);
  });
});
