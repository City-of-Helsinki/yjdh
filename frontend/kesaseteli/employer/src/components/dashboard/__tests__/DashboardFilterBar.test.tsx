import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardFilterBar from 'kesaseteli/employer/components/dashboard/DashboardFilterBar';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

type Props = {
  showOnlyMine?: boolean;
  onToggle?: () => void;
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
}: Props = {}): {
  onToggle: () => void;
} => {
  renderComponent(
    <DashboardFilterBar showOnlyMine={showOnlyMine} onToggle={onToggle} />
  );
  return { onToggle };
};

const setup = (
  props: Props = {}
): {
  user: ReturnType<typeof userEvent.setup>;
  onToggle: () => void;
} => {
  const user = userEvent.setup();
  const { onToggle } = renderSubject(props);
  return { user, onToggle };
};

describe('DashboardFilterBar', () => {
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

  it('calls onToggle when toggle is clicked', async () => {
    const onToggle = jest.fn();
    const { user } = setup({ onToggle });

    await user.click(getFilterToggleButton());

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders tooltip content when tooltip trigger is activated', async () => {
    const { user } = setup();

    await user.click(getTooltipButton());

    expect(await findTooltipContent()).toBeInTheDocument();
  });
});
