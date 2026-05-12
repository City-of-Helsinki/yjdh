import { screen } from '@testing-library/react';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { ROUTES, SUPPORTED_LANGUAGES } from 'benefit/applicant/constants';
import { useAskem } from 'benefit/applicant/hooks/useAnalytics';
import {
  AHJO_STATUSES,
  ALTERATION_STATE,
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
  BATCH_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

import i18n from '../../../../../test/i18n/i18n-test';
import PageContent from '../PageContent';
import { usePageContent } from '../usePageContent';

function ApplicationFormStep1Mock(): React.ReactElement {
  return React.createElement('div', {
    'data-testid': 'application-form-step-1',
  });
}

function ApplicationFormStep2Mock(): React.ReactElement {
  return React.createElement('div', {
    'data-testid': 'application-form-step-2',
  });
}

function ApplicationFormStep3Mock(): React.ReactElement {
  return React.createElement('div', {
    'data-testid': 'application-form-step-3',
  });
}

function ApplicationFormStep4Mock(): React.ReactElement {
  return React.createElement('div', {
    'data-testid': 'application-form-step-4',
  });
}

function ApplicationFormStep5Mock({
  isReadOnly,
}: {
  isReadOnly?: boolean;
}): React.ReactElement {
  return React.createElement('div', {
    'data-read-only': isReadOnly ? 'true' : 'false',
    'data-testid': 'application-form-step-5',
  });
}

function ApplicationFormStep6Mock(): React.ReactElement {
  return React.createElement('div', {
    'data-testid': 'application-form-step-6',
  });
}

function NoCookieConsentsNotificationMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'no-cookie-consents' });
}

function NotificationViewMock({
  title,
}: {
  title: string;
}): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'notification-view' },
    title
  );
}

function ErrorPageMock({
  title,
  message,
}: {
  title: string;
  message: string;
}): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'error-page' },
    title,
    message
  );
}

type DecisionSummaryDetailItem = {
  key: string;
  accessor: (app: Application) => React.ReactNode;
  showIf?: (app: Application) => boolean;
};

type DecisionSummaryDetailList = Array<DecisionSummaryDetailItem>;

let latestDecisionSummaryDetailList: DecisionSummaryDetailList | undefined;

function DecisionSummaryMock({
  detailList,
  actions,
}: {
  detailList?: DecisionSummaryDetailList;
  actions?: React.ReactNode;
}): React.ReactElement {
  latestDecisionSummaryDetailList = detailList;

  return React.createElement(
    'div',
    { 'data-testid': 'decision-summary' },
    actions
  );
}

function AlterationAccordionItemMock(): React.ReactElement {
  return React.createElement('div', {
    'data-testid': 'alteration-accordion-item',
  });
}

function StatusIconMock(): React.ReactElement {
  return React.createElement('span', { 'data-testid': 'status-icon' });
}

jest.mock('../usePageContent');
jest.mock('benefit/applicant/hooks/useAnalytics', () => ({
  useAskem: jest.fn(),
}));
jest.mock('benefit/applicant/components/Notification/Notification.sc', () => {
  const ReactLocal = jest.requireActual('react');

  return {
    $Notification: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement(
        'div',
        { 'data-testid': 'notification-wrapper' },
        children
      ),
  };
});
jest.mock('benefit/applicant/components/applications/Applications.sc', () => {
  const ReactLocal = jest.requireActual('react');
  const wrap =
    (testId: string, tag = 'div') =>
    ({ children }: { children?: React.ReactNode }) =>
      ReactLocal.createElement(tag, { 'data-testid': testId }, children);

  return {
    $HeaderItem: wrap('header-item'),
    $HeaderRightColumnItem: wrap('header-right-column-item'),
    $PageHeader: wrap('page-header'),
    $PageHeading: wrap('page-heading', 'h1'),
    $PageHeadingApplicant: wrap('page-heading-applicant', 'h2'),
    $PageHeadingHelperText: wrap('page-heading-helper-text'),
    $PageSubHeading: wrap('page-sub-heading'),
    $SpinnerContainer: wrap('spinner-container'),
    $AskemContainer: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement(
        'div',
        { 'data-testid': 'askem-container' },
        children
      ),
    $AskemItem: ({ children }: { children?: React.ReactNode }) =>
      ReactLocal.createElement(
        'div',
        { 'data-testid': 'askem-item' },
        children
      ),
  };
});

jest.mock('hds-react', () => {
  const ReactLocal = jest.requireActual('react');

  return {
    Button: ({
      children,
      disabled,
      onClick,
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      onClick?: () => void;
    }) =>
      ReactLocal.createElement(
        'button',
        { disabled, onClick, type: 'button' },
        children
      ),
    ButtonPresetTheme: {
      Coat: 'Coat',
    },
    IconInfoCircleFill: () =>
      ReactLocal.createElement('span', { 'data-testid': 'info-icon' }),
    LoadingSpinner: () =>
      ReactLocal.createElement('div', { 'data-testid': 'loading-spinner' }),
    Stepper: ({
      selectedStep,
      steps,
    }: {
      selectedStep: number;
      steps: Array<unknown>;
    }) =>
      ReactLocal.createElement('div', {
        'data-selected-step': selectedStep,
        'data-step-count': steps.length,
        'data-testid': 'stepper',
      }),
  };
});

jest.mock(
  'benefit/applicant/components/applications/alteration/AlterationAccordionItem',
  () => AlterationAccordionItemMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step1/ApplicationFormStep1',
  () => ApplicationFormStep1Mock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step2/ApplicationFormStep2',
  () => ApplicationFormStep2Mock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step3/ApplicationFormStep3',
  () => ApplicationFormStep3Mock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step4/ApplicationFormStep4',
  () => ApplicationFormStep4Mock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step5/ApplicationFormStep5',
  () => ApplicationFormStep5Mock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step6/ApplicationFormStep6',
  () => ApplicationFormStep6Mock
);
jest.mock(
  'benefit/applicant/components/cookieConsent/NoCookieConsentsNotification',
  () => NoCookieConsentsNotificationMock
);
jest.mock(
  'benefit/applicant/components/notificationView/NotificationView',
  () => NotificationViewMock
);
jest.mock(
  'benefit/applicant/components/errorPage/ErrorPage',
  () => ErrorPageMock
);
jest.mock(
  'benefit-shared/components/decisionSummary/DecisionSummary',
  () => DecisionSummaryMock
);
jest.mock(
  'benefit-shared/components/statusIcon/StatusIcon',
  () => StatusIconMock
);

const mockUsePageContent = usePageContent as jest.Mock;
const mockUseAskem = useAskem as jest.Mock;

const t = i18n.t.bind(i18n);

const baseApplication = createMockApplication({
  id: 'application-123',
  status: APPLICATION_STATUSES.DRAFT,
  createdAt: '2026-05-01T12:00:00Z',
  modifiedAt: '2026-05-02T12:30:00Z',
  submittedAt: '2026-05-02T12:30:00Z',
  applicationNumber: 2_026_001,
  applicationStep: '1',
  employee: {
    firstName: 'Matti',
    lastName: 'Meikäläinen',
  },
  alterations: [],
});

const baseSteps = [
  { label: 'Työnantaja', state: 'available' },
  { label: 'Työllistettävä', state: 'disabled' },
  { label: 'Liitteet', state: 'disabled' },
  { label: 'Valtuutus', state: 'disabled' },
  { label: 'Yhteenveto', state: 'disabled' },
  { label: 'Lähetä', state: 'disabled' },
];

const baseRouter = {
  isReady: true,
  locale: SUPPORTED_LANGUAGES.FI,
  push: jest.fn(() => Promise.resolve(true)),
  query: { id: 'application-123' },
};

const createHookReturn = (
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  t,
  id: 'application-123',
  steps: baseSteps,
  currentStep: 1,
  isError: false,
  isLoading: false,
  isReadOnly: false,
  isSubmittedApplication: false,
  setIsSubmittedApplication: jest.fn(),
  isResubmission: false,
  setIsResubmission: jest.fn(),
  ...overrides,
  application: {
    ...baseApplication,
    ...(overrides.application as Record<string, unknown> | undefined),
  },
});

const renderPage = (
  hookOverrides: Record<string, unknown> = {},
  routerOverrides: Record<string, unknown> = {}
): ReturnType<typeof renderComponent> => {
  const routerValue = {
    ...baseRouter,
    ...routerOverrides,
    query:
      (routerOverrides.query as
        | Record<string, string | string[]>
        | undefined) ?? baseRouter.query,
  };

  mockUsePageContent.mockReturnValue(createHookReturn(hookOverrides));

  return renderComponent(<PageContent />, routerValue);
};

const acceptedDecisionSummaryApplication = {
  status: APPLICATION_STATUSES.ACCEPTED,
  handledByAhjoAutomation: true,
  ahjoCaseId: 'case-123',
  ahjoStatus: AHJO_STATUSES.DETAILS_RECEIVED,
};

const renderReadOnlyAcceptedDecisionSummary = (
  applicationOverrides: Record<string, unknown> = {}
): void => {
  renderPage({
    isReadOnly: true,
    application: {
      ...acceptedDecisionSummaryApplication,
      ...applicationOverrides,
    },
  });
};

const renderEditableApplication = (
  applicationOverrides: Record<string, unknown> = {},
  hookOverrides: Record<string, unknown> = {}
): void => {
  renderPage({
    isReadOnly: false,
    isSubmittedApplication: false,
    ...hookOverrides,
    application: {
      status: APPLICATION_STATUSES.DRAFT,
      ...applicationOverrides,
    },
  });
};

const expectDocumentTitle = (
  expectedTitle: string,
  hookOverrides: Record<string, unknown> = {},
  routerOverrides: Record<string, unknown> = {}
): void => {
  renderPage(hookOverrides, routerOverrides);
  expect(document.title).toBe(expectedTitle);
};

const findDecisionSummaryDetailItem = (
  key: string
): DecisionSummaryDetailItem | undefined =>
  latestDecisionSummaryDetailList?.find((item) => item.key === key);

describe('PageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestDecisionSummaryDetailList = undefined;
    mockUsePageContent.mockReturnValue(createHookReturn());
    mockUseAskem.mockReturnValue(false);
  });

  it('renders loading spinner while page content is loading', () => {
    renderPage({ isLoading: true });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error page when hook reports an error', () => {
    renderPage({ isError: true });

    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });

  it('renders submitted notification and no-cookie notification for finnish locale when Askem is unavailable', () => {
    renderPage({ isSubmittedApplication: true });

    expect(screen.getByTestId('notification-view')).toHaveTextContent(
      'Helsinki-lisä -hakemus on lähetetty'
    );
    expect(screen.getByTestId('no-cookie-consents')).toBeInTheDocument();
  });

  it('renders resubmission notification and Askem container when Askem is available', () => {
    mockUseAskem.mockReturnValue(true);
    renderPage({
      isSubmittedApplication: true,
      isResubmission: true,
    });

    expect(screen.getByTestId('notification-view')).toHaveTextContent(
      'Helsinki-lisä -hakemuksen muutos on lähetetty'
    );
    expect(screen.getByTestId('askem-container')).toBeInTheDocument();
    expect(screen.queryByTestId('no-cookie-consents')).not.toBeInTheDocument();
  });

  it('renders decision summary and navigates to alteration route from read-only accepted application', async () => {
    const push = jest.fn(() => Promise.resolve(true));
    const user = setupUserAndRender(() =>
      renderPage(
        {
          isReadOnly: true,
          application: {
            status: APPLICATION_STATUSES.ACCEPTED,
            handledByAhjoAutomation: true,
            ahjoCaseId: 'case-123',
            ahjoStatus: AHJO_STATUSES.DETAILS_RECEIVED,
          },
        },
        { push }
      )
    );

    expect(screen.getByTestId('decision-summary')).toBeInTheDocument();
    expect(screen.getByTestId('application-form-step-5')).toHaveAttribute(
      'data-read-only',
      'true'
    );

    await user.click(
      screen.getByRole('button', { name: 'Ilmoita työsuhteen muutoksesta' })
    );

    expect(push).toHaveBeenCalledWith(
      `${ROUTES.APPLICATION_ALTERATION}?id=application-123`
    );
  });

  it('disables report alteration button when a handled termination exists', () => {
    renderPage({
      isReadOnly: true,
      application: {
        status: APPLICATION_STATUSES.ACCEPTED,
        handledByAhjoAutomation: false,
        batchStatus: BATCH_STATUSES.COMPLETED,
        alterations: [
          {
            alterationType: ALTERATION_TYPE.TERMINATION,
            state: ALTERATION_STATE.HANDLED,
          },
        ],
      },
    });

    expect(
      screen.getByRole('button', { name: 'Ilmoita työsuhteen muutoksesta' })
    ).toBeDisabled();
  });

  it('includes decision detail benefit amount with monetary visibility and formatted accessor', () => {
    renderReadOnlyAcceptedDecisionSummary({
      calculatedBenefitAmount: '1234.56',
    });

    const benefitAmountItem = findDecisionSummaryDetailItem('benefitAmount');

    expect(benefitAmountItem).toBeDefined();
    expect(
      benefitAmountItem?.showIf?.({
        ...baseApplication,
        status: APPLICATION_STATUSES.ACCEPTED,
      } as Application)
    ).toBe(true);
    expect(
      benefitAmountItem?.accessor({
        ...baseApplication,
        calculatedBenefitAmount: 1234.56,
      })
    ).toBe(formatFloatToEvenEuros(1234.56));
  });

  it('includes decision detail benefit period with monetary visibility and formatted accessor', () => {
    renderReadOnlyAcceptedDecisionSummary({
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });

    const benefitPeriodItem = findDecisionSummaryDetailItem('benefitPeriod');

    expect(benefitPeriodItem).toBeDefined();
    expect(
      benefitPeriodItem?.showIf?.({
        ...baseApplication,
        status: APPLICATION_STATUSES.ACCEPTED,
      } as Application)
    ).toBe(true);
    expect(
      benefitPeriodItem?.accessor({
        ...baseApplication,
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      } as Application)
    ).toBe(
      `${convertToUIDateFormat('2026-01-01')} – ${convertToUIDateFormat(
        '2026-03-31'
      )}`
    );
  });

  it('includes decision detail decision date with formatted accessor', () => {
    renderReadOnlyAcceptedDecisionSummary({
      ahjoDecisionDate: '2026-04-15',
    });

    const decisionDateItem = findDecisionSummaryDetailItem('decisionDate');

    expect(decisionDateItem).toBeDefined();
    expect(
      decisionDateItem?.accessor({
        ...baseApplication,
        ahjoDecisionDate: '2026-04-15',
      } as Application)
    ).toBe(convertToUIDateFormat('2026-04-15'));
  });

  it('includes decision detail extra details with de minimis visibility and translated accessor', () => {
    renderReadOnlyAcceptedDecisionSummary({
      isGrantedAsDeMinimisAid: true,
    });

    const extraDetailsItem = findDecisionSummaryDetailItem('extraDetails');

    expect(extraDetailsItem).toBeDefined();
    expect(
      extraDetailsItem?.showIf?.({
        ...baseApplication,
        status: APPLICATION_STATUSES.ACCEPTED,
        isGrantedAsDeMinimisAid: true,
      } as Application)
    ).toBe(true);
    expect(extraDetailsItem?.accessor(baseApplication)).toBe(
      'Tuki on myönnetty de minimis -tukena'
    );
  });

  it('renders error page when submitted application is accessed in non-submitted edit flow', () => {
    renderEditableApplication({
      status: APPLICATION_STATUSES.RECEIVED,
    });

    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });

  it.each([
    {
      currentStep: 1,
      expectedForm: 'application-form-step-1',
      expectedHelper: 'Kaikki *-merkityt kohdat ovat pakollisia',
    },
    {
      currentStep: 5,
      expectedForm: 'application-form-step-5',
      expectedHelper: 'Ole hyvä ja tarkista hakemus ennen lähetystä.',
    },
    {
      currentStep: 6,
      expectedForm: 'application-form-step-6',
      expectedHelper: null,
    },
  ])(
    'renders editable step $currentStep content correctly',
    ({ currentStep, expectedForm, expectedHelper }) => {
      renderEditableApplication(
        {},
        {
          currentStep,
        }
      );

      expect(screen.getByTestId(expectedForm)).toBeInTheDocument();
      expect(screen.getByTestId('stepper')).toHaveAttribute(
        'data-selected-step',
        String(currentStep - 1)
      );

      if (expectedHelper) {
        expect(screen.getByText(expectedHelper)).toBeInTheDocument();
      }
    }
  );

  it.each([
    {
      hookOverrides: { isReadOnly: true },
      routerOverrides: { query: { id: 'application-123' } },
      expectedTitle: 'Helsinki-lisä - Hakemus - Tarkastele hakemusta',
    },
    {
      hookOverrides: { isReadOnly: false },
      routerOverrides: { query: { id: 'application-123' } },
      expectedTitle: 'Helsinki-lisä - Hakemus - Muokkaa hakemusta',
    },
    {
      hookOverrides: { id: '' },
      routerOverrides: { query: {} },
      expectedTitle: 'Helsinki-lisä - Hakemus - Luo uusi',
    },
  ])(
    'sets document title to $expectedTitle',
    ({ hookOverrides, routerOverrides, expectedTitle }) => {
      expectDocumentTitle(expectedTitle, hookOverrides, routerOverrides);
    }
  );
});
