import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Calculation } from 'benefit-shared/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import ReceivedApplicationActions, {
  Props,
} from '../ReceivedApplicationActions';

jest.mock(
  'benefit/handler/hooks/applicationHandling/useRouterNavigation',
  () => ({
    useRouterNavigation: jest.fn(),
  })
);

jest.mock('benefit/handler/hooks/useDetermineAhjoMode', () => ({
  useDetermineAhjoMode: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useUpdateApplicationQuery', () => jest.fn());

const mockUseRouterNavigation = useRouterNavigation as jest.MockedFunction<
  typeof useRouterNavigation
>;
const mockUseDetermineAhjoMode = useDetermineAhjoMode as jest.MockedFunction<
  typeof useDetermineAhjoMode
>;
const mockUseUpdateApplicationQuery =
  useUpdateApplicationQuery as jest.MockedFunction<
    typeof useUpdateApplicationQuery
  >;

describe('ReceivedApplicationActions', () => {
  const navigateBack = jest.fn();
  const mutate = jest.fn();

  const initialProps: Props = {
    application: {},
  };

  const getComponent = (props: Partial<Props> = {}): RenderResult =>
    renderComponent(<ReceivedApplicationActions {...initialProps} {...props} />)
      .renderResult;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouterNavigation.mockReturnValue({
      navigateBack,
    });
    mockUseDetermineAhjoMode.mockReturnValue(false);
    mockUseUpdateApplicationQuery.mockReturnValue({
      mutate,
    } as never);
  });

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('calls navigateBack when close button is clicked', async () => {
    const user = setupUserAndRender(() => {
      getComponent();
    });

    await user.click(screen.getByRole('button', { name: /sulje|close/i }));

    expect(navigateBack).toHaveBeenCalledTimes(1);
  });

  it('updates application with transformed payload when handle is clicked', async () => {
    mockUseDetermineAhjoMode.mockReturnValue(true);

    const user = setupUserAndRender(() => {
      getComponent({
        application: {
          id: 'application-id',
          status: APPLICATION_STATUSES.RECEIVED,
          calculation: {
            monthlyPay: '1000',
            otherExpenses: '100',
            vacationMoney: '50',
            overrideMonthlyBenefitAmount: '25',
          } as Calculation,
        },
      });
    });

    await user.click(screen.getByRole('button', { name: /käsittelyyn/i }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'application-id',
        status: APPLICATION_STATUSES.HANDLING,
        handled_by_ahjo_automation: true,
        calculation: expect.objectContaining({
          monthly_pay: 1000,
          other_expenses: 100,
          vacation_money: 50,
          override_monthly_benefit_amount: 25,
        }),
      })
    );
  });

  it('updates application with undefined calculation when missing', async () => {
    const user = setupUserAndRender(() => {
      getComponent({
        application: {
          id: 'application-id',
          status: APPLICATION_STATUSES.RECEIVED,
        },
      });
    });

    await user.click(screen.getByRole('button', { name: /käsittelyyn/i }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'application-id',
        status: APPLICATION_STATUSES.HANDLING,
        handled_by_ahjo_automation: false,
      })
    );

    const payload = mutate.mock.calls[0][0] as { calculation?: unknown };
    expect(payload.calculation).toBeUndefined();
  });
});
