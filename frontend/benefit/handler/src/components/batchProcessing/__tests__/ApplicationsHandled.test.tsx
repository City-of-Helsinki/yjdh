import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import i18n from 'i18next';
import React from 'react';

import ApplicationsHandled from '../ApplicationsHandled';

jest.mock(
  'react-loading-skeleton',
  () =>
    function MockSkeleton(): JSX.Element {
      return <div data-testid="loading-skeleton" />;
    }
);

jest.mock('benefit/handler/hooks/useApplicationToBatch', () => jest.fn());
jest.mock('../useApplicationsHandled', () => ({
  useApplicationsHandled: jest.fn(),
}));

const mockUseApplicationsHandled = jest.requireMock('../useApplicationsHandled')
  .useApplicationsHandled as jest.Mock;
const mockUseAddToBatchQuery = jest.requireMock(
  'benefit/handler/hooks/useApplicationToBatch'
);

const mutate = jest.fn();
const status = APPLICATION_STATUSES.ACCEPTED;
const translationsBase = 'common:applications.list';

const mockRows = [
  {
    id: 'app-1',
    companyName: 'Company One',
    companyId: '1234567-8',
    applicationNum: 1,
    employeeName: 'Employee One',
    handledAt: '1.1.2026',
  },
  {
    id: 'app-2',
    companyName: 'Company Two',
    companyId: '2345678-9',
    applicationNum: 2,
    employeeName: 'Employee Two',
    handledAt: '2.1.2026',
  },
] as never;

const t = (key: string, options?: { count?: number }): string =>
  String(i18n.t(key, options as never));

const addToBatchText = 'Lisää valitut koontiin';
const selectedTwoText = 'Valittu 2 hakemusta';
const headingRegex = /myönteiset\s+päätökset/i;
const headingWithCountText = 'Myönteiset päätökset (2)';
const emptyAcceptedText = 'Ei yhtään käsiteltyä myönteistä hakemusta.';

const setHandledHook = ({
  shouldShowSkeleton = false,
  shouldHideList = false,
  list = mockRows,
}: {
  shouldShowSkeleton?: boolean;
  shouldHideList?: boolean;
  list?: typeof mockRows;
} = {}): void => {
  mockUseApplicationsHandled.mockReturnValue({
    t,
    list,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader: (id: string): string => `header.${id}`,
  });
};

const renderSubject = (): void => {
  renderComponent(<ApplicationsHandled status={status} />);
};

const getAddToBatchButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: addToBatchText,
  });

const clickSelectAllRows = async (
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  await user.click(
    screen.getByRole('button', { name: 'Valitse kaikki rivit' })
  );
};

describe('ApplicationsHandled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setHandledHook();
    mockUseAddToBatchQuery.mockReturnValue({
      isSuccess: false,
      mutate,
    } as never);
  });

  it('renders loading skeleton state', () => {
    setHandledHook({ shouldShowSkeleton: true });

    renderSubject();

    expect(
      screen.getByRole('heading', {
        name: headingRegex,
      })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(2);
  });

  it('renders empty state when list should be hidden', () => {
    setHandledHook({ shouldHideList: true, list: [] as never });

    renderSubject();

    expect(screen.getByText(emptyAcceptedText)).toBeInTheDocument();
  });

  it('shows table and keeps add to batch disabled when no rows selected', () => {
    renderSubject();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Company One')).toBeInTheDocument();
    expect(screen.getByText(headingWithCountText)).toBeInTheDocument();
    expect(getAddToBatchButton()).toBeDisabled();
  });

  it('enables add to batch, shows singular count and submits selected row ids', async () => {
    const user = setupUserAndRender(() => renderSubject());
    await clickSelectAllRows(user);

    expect(screen.getByText(selectedTwoText)).toBeInTheDocument();

    await user.click(getAddToBatchButton());

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({
      applicationIds: expect.arrayContaining(['app-1', 'app-2']),
      status,
    });
  });

  it('resets selected rows after successful batch creation', async () => {
    function TriggerWrapper(): JSX.Element {
      const [isSuccess, setIsSuccess] = React.useState(false);
      mockUseAddToBatchQuery.mockReturnValue({
        isSuccess,
        mutate,
      } as never);

      return (
        <>
          <button
            type="button"
            data-testid="trigger-success"
            onClick={() => setIsSuccess(true)}
          >
            trigger-success
          </button>
          <ApplicationsHandled status={status} />
        </>
      );
    }

    const user = setupUserAndRender(() => renderComponent(<TriggerWrapper />));
    await clickSelectAllRows(user);

    expect(screen.getByText(selectedTwoText)).toBeInTheDocument();
    expect(getAddToBatchButton()).toBeEnabled();

    await user.click(screen.getByTestId('trigger-success'));

    await waitFor(() => {
      expect(screen.queryByText(selectedTwoText)).not.toBeInTheDocument();
    });

    expect(getAddToBatchButton()).toBeDisabled();
  });
});
