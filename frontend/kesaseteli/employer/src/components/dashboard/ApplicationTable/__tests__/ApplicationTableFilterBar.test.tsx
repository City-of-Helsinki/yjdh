import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import ApplicationTable from '..';
import ApplicationTableFilterBar from '../ApplicationTableFilterBar';

jest.mock('kesaseteli/employer/hooks/backend/useApplicationsQuery', () =>
  jest.fn()
);

type Props = {
  showOnlyMine?: boolean;
  onToggle?: () => void;
  selectedYear?: string;
  onChangeYear?: (year: string) => void;
};

const getFilterToggleButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: /omat hakemukset( -suodatin)?/i,
  });

const getTooltipButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: /avaa hakemukset-suodattimen ohjeistus/i,
  });

const findTooltipContent = (): Promise<HTMLElement> =>
  screen.findByText(/näytä vain omat hakemukset/i);

const renderSubject = ({
  showOnlyMine = false,
  onToggle = jest.fn(),
  selectedYear = '2026',
  onChangeYear = jest.fn(),
}: Omit<Props, 'availableYears'> = {}): {
  onToggle: () => void;
  onChangeYear: (year: string) => void;
} => {
  // Years are now static (PROGRAMME_START_YEAR to current year); mock only
  // needs to satisfy the paginated query used by ApplicationTable.
  (useApplicationsQuery as jest.Mock).mockReturnValue({
    data: { count: 0, results: [] },
    isLoading: false,
    error: null,
  });

  renderComponent(
    <ApplicationTable
      defaultShowOnlyMine={showOnlyMine}
      onToggleOnlyMine={onToggle}
      defaultSelectedYear={selectedYear}
      onChangeYear={onChangeYear}
    >
      <ApplicationTableFilterBar />
    </ApplicationTable>
  );
  return { onToggle, onChangeYear };
};

const setup = (
  props: Props = {}
): {
  user: ReturnType<typeof userEvent.setup>;
  onToggle: () => void;
  onChangeYear: (year: string) => void;
} => {
  const user = userEvent.setup();
  const { onToggle, onChangeYear } = renderSubject(props);
  return { user, onToggle, onChangeYear };
};

describe('ApplicationTableFilterBar', () => {
  it('renders the filter toggle and tooltip trigger', () => {
    renderSubject();

    expect(getFilterToggleButton()).toBeInTheDocument();
    expect(getTooltipButton()).toBeInTheDocument();
  });

  it('reflects unchecked state when showOnlyMine is false', () => {
    renderSubject({ showOnlyMine: false });

    expect(getFilterToggleButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects checked state when showOnlyMine is true', () => {
    renderSubject({ showOnlyMine: true });

    expect(getFilterToggleButton()).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles the filter checked state internally and calls callback when toggle is clicked', async () => {
    const onToggle = jest.fn();
    const { user } = setup({ onToggle });

    const toggle = getFilterToggleButton();
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders tooltip content when tooltip trigger is activated', async () => {
    const { user } = setup();

    await user.click(getTooltipButton());

    expect(await findTooltipContent()).toBeInTheDocument();
  });

  it('updates the year filter internally and triggers onChangeYear when an option is selected', async () => {
    const onChangeYear = jest.fn();
    const { user } = setup({ onChangeYear });

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveTextContent('2026');

    await user.click(combobox);
    const option = await screen.findByRole('option', { name: '2025' });
    await user.click(option);

    expect(combobox).toHaveTextContent('2025');
    expect(onChangeYear).toHaveBeenCalledTimes(1);
    expect(onChangeYear).toHaveBeenCalledWith('2025');
  });
});
