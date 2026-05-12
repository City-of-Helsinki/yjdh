import { render, screen } from '@testing-library/react';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import DecisionsApplicationList from 'benefit/applicant/components/decisions/DecisionsApplicationList';
import { ROUTES, SUBMITTED_STATUSES } from 'benefit/applicant/constants';
import ApplicationListContext, {
  ApplicationListContextType,
} from 'benefit/applicant/context/ApplicationListContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useRouter } from 'next/router';
import React from 'react';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import i18n from '../../../../test/i18n/i18n-test';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mockPaginatedApplicationListProps: Record<string, unknown> = {};

jest.mock(
  'benefit/applicant/components/applications/applicationList/PaginatedApplicationList',
  () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    function PaginatedApplicationListMock(
      props: Record<string, unknown>
    ): React.ReactNode {
      mockPaginatedApplicationListProps = props;
      return <div data-testid="paginated-application-list" />;
    }
);
jest.mock('benefit/applicant/i18n', () => ({ useTranslation: jest.fn() }));
jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const mockUseTranslation = useTranslation as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const t = i18n.t.bind(i18n);
const sortNewestFirstLabel = 'Uusin ensin';
const sortOldestFirstLabel = 'Vanhin ensin';
const sortNameAscLabel = 'Aakkosjärjestyksessä';
const alterationReminderLabel = 'Muutos työsuhteessa?';
const noDecisionsText =
  'Ei vielä yhtään Helsinki-lisä -hakemusta, joille on tehty päätös.';
const emptyListContext: ApplicationListContextType = { list: [], count: 0 };

const renderDecisionsApplicationList = (
  contextValue: ApplicationListContextType
): ReturnType<typeof render> =>
  render(
    <ApplicationListContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <DecisionsApplicationList />
      </ThemeProvider>
    </ApplicationListContext.Provider>
  );

const renderElementWithContext = (
  element: React.ReactElement,
  contextValue: ApplicationListContextType
): ReturnType<typeof render> =>
  render(
    <ApplicationListContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{element}</ThemeProvider>
    </ApplicationListContext.Provider>
  );

const renderBeforeList = (list: ApplicationListContextType['list']): void => {
  renderDecisionsApplicationList({ list, count: list.length });

  const beforeListElement =
    mockPaginatedApplicationListProps.beforeList as React.ReactElement;
  renderElementWithContext(beforeListElement, { list, count: list.length });
};

const renderNoItemsText = (): void => {
  renderDecisionsApplicationList(emptyListContext);

  const noItemsElement =
    mockPaginatedApplicationListProps.noItemsText as React.ReactElement;
  renderElementWithContext(noItemsElement, emptyListContext);
};

describe('DecisionsApplicationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPaginatedApplicationListProps = {};
    mockUseTranslation.mockReturnValue({ t });
    mockUseRouter.mockReturnValue({
      push: jest.fn(() => Promise.resolve(true)),
    });
  });

  it('renders PaginatedApplicationList with correct status', () => {
    renderDecisionsApplicationList(emptyListContext);

    expect(mockPaginatedApplicationListProps.status).toEqual(
      SUBMITTED_STATUSES
    );
    expect(mockPaginatedApplicationListProps.isArchived).toBe(true);
  });

  it('renders heading with Trans component', () => {
    renderDecisionsApplicationList({
      list: [],
      count: 5,
    });

    expect(mockPaginatedApplicationListProps.heading).toBeDefined();
  });

  it('includes correct sort order options', () => {
    renderDecisionsApplicationList(emptyListContext);

    const orderByOptions =
      mockPaginatedApplicationListProps.orderByOptions as Array<{
        label: string;
        value: string;
      }>;

    expect(orderByOptions).toEqual([
      {
        label: sortNewestFirstLabel,
        value: '-submitted_at',
      },
      {
        label: sortOldestFirstLabel,
        value: 'submitted_at',
      },
      {
        label: sortNameAscLabel,
        value: 'employee_name',
      },
    ]);
  });

  it('shows notification when list contains accepted application', () => {
    renderBeforeList([{ id: '1', status: APPLICATION_STATUSES.ACCEPTED }]);

    expect(screen.getByText(alterationReminderLabel)).toBeInTheDocument();
  });

  it('does not show notification when list does not contain accepted application', () => {
    renderBeforeList([{ id: '1', status: APPLICATION_STATUSES.DRAFT }]);

    expect(screen.queryByText(alterationReminderLabel)).not.toBeInTheDocument();
  });

  it('renders noItemsText with back button', () => {
    renderDecisionsApplicationList(emptyListContext);

    expect(mockPaginatedApplicationListProps.noItemsText).toBeDefined();
  });

  it('navigates to home when back button is clicked', async () => {
    const push = jest.fn(() => Promise.resolve(true));
    mockUseRouter.mockReturnValue({ push });
    const user = setupUserAndRender(() => {
      renderNoItemsText();
    });

    const backButton = screen.getByRole('button', { name: /takaisin/i });
    await user.click(backButton);

    expect(push).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('passes correct noItemsText content structure', () => {
    renderNoItemsText();

    expect(screen.getByText(noDecisionsText)).toBeInTheDocument();
  });
});
