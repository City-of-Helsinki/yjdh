import '@testing-library/jest-dom';

import { RenderResult, screen } from '@testing-library/react';
import {
  createAlteration,
  createAlterationApplication,
} from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useAlterationPage from 'benefit/handler/components/applications/alteration/useAlterationPage';
import { ROUTES } from 'benefit/handler/constants';
import {
  ALTERATION_STATE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import React from 'react';

import i18n from '../../../../test/i18n/i18n-test';
import NewAlteration from '../NewAlteration';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock(
  'benefit/handler/components/alteration/AlterationFormContainer',
  () =>
    function MockAlterationFormContainer(): React.ReactElement {
      return <div data-testid="alteration-form-container" />;
    }
);

jest.mock(
  'benefit/handler/components/applications/alteration/useAlterationPage'
);

const mockUseAlterationPage = useAlterationPage as jest.MockedFunction<
  typeof useAlterationPage
>;
type AlterationPageState = ReturnType<typeof useAlterationPage>;

const t = (key: string): string => String(i18n.t(key));

const TEXT = {
  errorPageTitle: 'Palvelussa on valitettavasti tapahtunut virhe',
  pendingAlterationError:
    'Et voi ilmoittaa muutosta työsuhteessa hakemukselle, jolla on käsittelemättömiä muutosilmoituksia jo ennestään.',
  notYetAcceptedError:
    'Et voi ilmoittaa muutosta työsuhteessa tälle hakemukselle, sillä tukea ei ole vielä myönnetty.',
  pageTitle: 'Ilmoita muutoksesta työsuhteessa',
  returnToApplication: 'Palaa hakemukseen',
};

const getErrorPageTitle = (): HTMLElement =>
  screen.getByText(TEXT.errorPageTitle);

const getAlterationFormContainer = (): HTMLElement =>
  screen.getByTestId('alteration-form-container');

const queryAlterationFormContainer = (): HTMLElement | null =>
  screen.queryByTestId('alteration-form-container');

const getPendingAlterationError = (): HTMLElement =>
  screen.getByText(TEXT.pendingAlterationError);

const queryPendingAlterationError = (): HTMLElement | null =>
  screen.queryByText(TEXT.pendingAlterationError);

const getNotYetAcceptedError = (): HTMLElement =>
  screen.getByText(TEXT.notYetAcceptedError);

const getPageTitle = (): HTMLElement => screen.getByText(TEXT.pageTitle);

const queryPageTitle = (): HTMLElement | null =>
  screen.queryByText(TEXT.pageTitle);

const getReturnToApplicationButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: TEXT.returnToApplication,
  });

const createPageState = (
  overrides: Partial<AlterationPageState> = {}
): AlterationPageState =>
  ({
    application: createAlterationApplication({
      status: APPLICATION_STATUSES.ACCEPTED,
    }),
    isLoading: false,
    isError: false,
    id: 'app-123',
    t,
    ...overrides,
  } as AlterationPageState);

const setPageState = (overrides: Partial<AlterationPageState> = {}): void => {
  mockUseAlterationPage.mockReturnValue(createPageState(overrides) as never);
};

const renderSubject = (): RenderResult =>
  renderComponent(<NewAlteration />).renderResult;

describe('NewAlteration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPageState();
  });

  describe('loading state', () => {
    it('renders page loading spinner when isLoading is true', () => {
      setPageState({ isLoading: true });

      renderSubject();

      expect(screen.getByRole('status')).toHaveTextContent('Page is loading');
    });
  });

  describe('error state', () => {
    it('renders error page when isError is true', () => {
      setPageState({ isError: true, application: null });

      renderSubject();

      expect(getErrorPageTitle()).toBeInTheDocument();
    });

    it('renders error page when application is null', () => {
      setPageState({ application: null });

      renderSubject();

      expect(getErrorPageTitle()).toBeInTheDocument();
    });

    it('renders error page when id is empty', () => {
      setPageState({ id: '' });

      renderSubject();

      expect(getErrorPageTitle()).toBeInTheDocument();
    });
  });

  describe('can create alteration', () => {
    it('renders alteration form container when application is accepted and no pending alterations', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [],
      });

      setPageState({ application });

      renderSubject();

      expect(getAlterationFormContainer()).toBeInTheDocument();
    });

    it('renders application header when alteration form is shown', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [],
        applicationNumber: 42,
      });

      setPageState({ application });

      renderSubject();

      expect(screen.getByText('Yritys Oy')).toBeInTheDocument();
    });
  });

  describe('cannot create - pending alteration', () => {
    it('renders error message when alteration with RECEIVED state exists', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [
          createAlteration({
            state: ALTERATION_STATE.RECEIVED,
          }),
        ],
      });

      setPageState({ application });

      renderSubject();

      expect(getPendingAlterationError()).toBeInTheDocument();
      expect(queryAlterationFormContainer()).not.toBeInTheDocument();
    });

    it('renders return to application button when pending alteration exists', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [
          createAlteration({
            state: ALTERATION_STATE.RECEIVED,
          }),
        ],
      });

      setPageState({ application });

      renderSubject();

      expect(getReturnToApplicationButton()).toBeInTheDocument();
    });
  });

  describe('cannot create - not accepted', () => {
    it('renders error message when application status is not ACCEPTED', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.DRAFT,
        alterations: [],
      });

      setPageState({ application });

      renderSubject();

      expect(getNotYetAcceptedError()).toBeInTheDocument();
      expect(queryAlterationFormContainer()).not.toBeInTheDocument();
    });

    it('does not render pending alteration error when application is not accepted', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.DRAFT,
        alterations: [],
      });

      setPageState({ application });

      renderSubject();

      expect(queryPendingAlterationError()).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to application when return button is clicked from pending alteration error', async () => {
      const applicationId = 'app-456';
      const application = createAlterationApplication({
        id: applicationId,
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [
          createAlteration({
            state: ALTERATION_STATE.RECEIVED,
          }),
        ],
      });

      setPageState({ application, id: applicationId });

      const user = setupUserAndRender(() => {
        renderSubject();
      });

      const returnButton = getReturnToApplicationButton();

      await user.click(returnButton);

      expect(mockPush).toHaveBeenCalledWith(
        `${ROUTES.APPLICATION}?id=${applicationId}`
      );
    });

    it('navigates to application when return button is clicked from not accepted error', async () => {
      const applicationId = 'app-789';
      const application = createAlterationApplication({
        id: applicationId,
        status: APPLICATION_STATUSES.DRAFT,
        alterations: [],
      });

      setPageState({ application, id: applicationId });

      const user = setupUserAndRender(() => {
        renderSubject();
      });

      const returnButton = getReturnToApplicationButton();

      await user.click(returnButton);

      expect(mockPush).toHaveBeenCalledWith(
        `${ROUTES.APPLICATION}?id=${applicationId}`
      );
    });
  });

  describe('alteration states', () => {
    it('allows form creation when alteration with HANDLED state exists', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [
          createAlteration({
            state: ALTERATION_STATE.HANDLED,
          }),
        ],
      });

      setPageState({ application });

      renderSubject();

      expect(getAlterationFormContainer()).toBeInTheDocument();
    });

    it('allows form creation when multiple alterations exist but none are RECEIVED', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [
          createAlteration({
            state: ALTERATION_STATE.HANDLED,
          }),
          createAlteration({
            id: 2,
            state: ALTERATION_STATE.HANDLED,
          }),
        ],
      });

      setPageState({ application });

      renderSubject();

      expect(getAlterationFormContainer()).toBeInTheDocument();
    });

    it('prevents form creation when one of multiple alterations is RECEIVED', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
        alterations: [
          createAlteration({
            state: ALTERATION_STATE.HANDLED,
          }),
          createAlteration({
            id: 2,
            state: ALTERATION_STATE.RECEIVED,
          }),
        ],
      });

      setPageState({ application });

      renderSubject();

      expect(queryAlterationFormContainer()).not.toBeInTheDocument();
      expect(getPendingAlterationError()).toBeInTheDocument();
    });
  });

  describe('page title', () => {
    it('renders page title when form creation is not possible', () => {
      const application = createAlterationApplication({
        status: APPLICATION_STATUSES.DRAFT,
        alterations: [],
      });

      setPageState({ application });

      renderSubject();

      expect(getPageTitle()).toBeInTheDocument();
    });

    it('does not render page title when form can be created', () => {
      renderSubject();

      expect(queryPageTitle()).not.toBeInTheDocument();
    });
  });
});
