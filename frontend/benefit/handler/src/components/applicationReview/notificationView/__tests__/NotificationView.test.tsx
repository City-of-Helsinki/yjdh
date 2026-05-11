import '@testing-library/jest-dom';

import { RenderResult, screen, waitFor } from '@testing-library/react';
import { createAlterationApplication } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { useDetermineAhjoMode as useDetermineAhjoModeImpl } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { Application } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import NotificationView from '../NotificationView';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('benefit/handler/hooks/useDetermineAhjoMode', () => ({
  useDetermineAhjoMode: jest.fn(() => false),
}));

const useDetermineAhjoMode = jest.mocked(useDetermineAhjoModeImpl);

const TEXT = {
  acceptedTitle: 'Hakemusta on puollettu',
  rejectedTitle: 'Hakemusta ei puollettu',
  cancelledTitle: 'Hakemus on peruttu',
  errorTitle: 'Tapahtui tuntematon virhe',
  ahjoMessage:
    'Voit seuraavaksi viedä hakemuksen Ahjoon virallista päätöskäsittelyä varten.',
  ahjoButtonLabel: 'Aloita hakemuksen vieminen ahjoon',
  homeButton: 'Palaa etusivulle',
  decisionProposalTitle: 'Päätösehdotus on lähetetty Ahjoon',
  decisionProposalText: 'Päätös hyväksytään Ahjossa.',
  applicationNumberLabel: 'Hakemusnumero',
};

type RenderOptions = {
  data?: ReturnType<typeof createAlterationApplication> | null;
  isNewAhjoMode?: boolean;
  handleSetHandledApplication?: jest.Mock;
};

const createData = (
  overrides: Parameters<typeof createAlterationApplication>[0] = {}
): ReturnType<typeof createAlterationApplication> =>
  createAlterationApplication({
    status: APPLICATION_STATUSES.ACCEPTED,
    ...overrides,
  });

const renderSubject = (options: RenderOptions = {}): RenderResult => {
  const {
    data = createData(),
    isNewAhjoMode = false,
    handleSetHandledApplication = jest.fn(),
  } = options;

  useDetermineAhjoMode.mockReturnValue(isNewAhjoMode);

  const contextValue = {
    isNavigationVisible: true,
    isFooterVisible: true,
    isSidebarVisible: false,
    layoutBackgroundColor: '#fff',
    handledApplication: null,
    setIsNavigationVisible: jest.fn(),
    setIsFooterVisible: jest.fn(),
    setLayoutBackgroundColor: jest.fn(),
    setHandledApplication: handleSetHandledApplication,
    setIsSidebarVisible: jest.fn(),
  };

  return renderComponent(
    <AppContext.Provider value={contextValue}>
      <NotificationView data={data as Application} />
    </AppContext.Provider>
  ).renderResult;
};

const getHomeButton = (): HTMLElement =>
  screen.getByRole('button', { name: TEXT.homeButton });

const queryHomeButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: TEXT.homeButton });

const getAhjoButton = (): HTMLElement =>
  screen.getByRole('button', { name: TEXT.ahjoButtonLabel });

const queryAhjoButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: TEXT.ahjoButtonLabel });

const getApplicationNumberLink = (applicationNumber: number): HTMLElement =>
  screen.getByRole('link', { name: applicationNumber.toString() });

describe('NotificationView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  type OldAhjoStatusCase = {
    status: APPLICATION_STATUSES;
    title: string;
    applicationNumber: number;
    messageTemplate: (num: number) => string;
    tabQuery?: number;
    hasAhjoButtons: boolean;
  };

  const oldAhjoCases: OldAhjoStatusCase[] = [
    {
      status: APPLICATION_STATUSES.ACCEPTED,
      title: TEXT.acceptedTitle,
      applicationNumber: 123,
      messageTemplate: (num) =>
        `Hakemus ${num} on siirretty myönteisten hakemusten jonoon.`,
      tabQuery: 4,
      hasAhjoButtons: true,
    },
    {
      status: APPLICATION_STATUSES.REJECTED,
      title: TEXT.rejectedTitle,
      applicationNumber: 456,
      messageTemplate: (num) =>
        `Hakemus ${num} on siirretty kielteisten hakemusten jonoon.`,
      tabQuery: 5,
      hasAhjoButtons: true,
    },
    {
      status: APPLICATION_STATUSES.CANCELLED,
      title: TEXT.cancelledTitle,
      applicationNumber: 789,
      messageTemplate: (num) => `Hakemus ${num} on peruutettu onnistuneesti.`,
      hasAhjoButtons: false,
    },
  ];

  oldAhjoCases.forEach(
    ({
      status,
      title,
      applicationNumber,
      messageTemplate,
      tabQuery,
      hasAhjoButtons,
    }) => {
      describe(`old ahjo mode - ${status} status`, () => {
        it('renders title', () => {
          const data = createData({ status });

          renderSubject({ data, isNewAhjoMode: false });

          expect(screen.getByText(title)).toBeInTheDocument();
        });

        it('renders message with application number', () => {
          const data = createData({
            status,
            applicationNumber,
          });

          renderSubject({ data, isNewAhjoMode: false });

          expect(
            screen.getByText(messageTemplate(applicationNumber))
          ).toBeInTheDocument();
        });

        if (hasAhjoButtons) {
          it('renders ahjo message and buttons', () => {
            const data = createData({ status });

            renderSubject({ data, isNewAhjoMode: false });

            expect(screen.getByText(TEXT.ahjoMessage)).toBeInTheDocument();
            expect(getHomeButton()).toBeInTheDocument();
            expect(getAhjoButton()).toBeInTheDocument();
          });

          it('navigates with correct tab when ahjo button is clicked', async () => {
            const user = setupUserAndRender(() =>
              renderSubject({
                data: createData({ status }),
                isNewAhjoMode: false,
              })
            );

            const ahjoButton = getAhjoButton();

            await user.click(ahjoButton);

            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith({
                pathname: ROUTES.HOME,
                query: { tab: tabQuery },
              });
            });
          });

          it('navigates to home when home button is clicked', async () => {
            const user = setupUserAndRender(() =>
              renderSubject({
                data: createData({ status }),
                isNewAhjoMode: false,
              })
            );

            const homeButton = getHomeButton();

            await user.click(homeButton);

            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith(ROUTES.HOME);
            });
          });
        } else {
          it('does not render buttons', () => {
            const data = createData({ status });

            renderSubject({ data, isNewAhjoMode: false });

            expect(queryHomeButton()).not.toBeInTheDocument();
            expect(queryAhjoButton()).not.toBeInTheDocument();
          });
        }
      });
    }
  );

  describe('new ahjo mode', () => {
    const newAhjoData = createData({
      applicationNumber: 100,
      ahjoCaseId: 'AHJO-123-2024',
    });

    it('renders decision proposal UI elements', () => {
      renderSubject({ data: newAhjoData, isNewAhjoMode: true });

      expect(screen.getByText(TEXT.decisionProposalTitle)).toBeInTheDocument();
      expect(screen.getByText(TEXT.decisionProposalText)).toBeInTheDocument();
    });

    it('renders application number with link', () => {
      const applicationNumber = 200;
      const data = createData({
        id: 'app-id-123',
        applicationNumber,
        ahjoCaseId: 'AHJO-456-2024',
      });

      renderSubject({ data, isNewAhjoMode: true });

      const link = getApplicationNumberLink(applicationNumber);

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        'href',
        `${ROUTES.APPLICATION}?id=app-id-123`
      );
    });

    it('renders ahjo case id', () => {
      const ahjoCaseId = 'AHJO-789-2024';
      renderSubject({
        data: createData({ ahjoCaseId }),
        isNewAhjoMode: true,
      });

      expect(
        screen.getByText((content) => content.includes(ahjoCaseId))
      ).toBeInTheDocument();
    });

    it('renders only home button', () => {
      renderSubject({ data: newAhjoData, isNewAhjoMode: true });

      expect(getHomeButton()).toBeInTheDocument();
      expect(queryAhjoButton()).not.toBeInTheDocument();
    });

    it('navigates to home when button clicked', async () => {
      const user = setupUserAndRender(() =>
        renderSubject({ data: newAhjoData, isNewAhjoMode: true })
      );

      await user.click(getHomeButton());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(ROUTES.HOME);
      });
    });
  });
});
