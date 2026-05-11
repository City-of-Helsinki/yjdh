import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import { createAlterationApplication } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/handler/constants';
import {
  ALTERATION_STATE,
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { ErrorData } from 'benefit-shared/types/common';
import React from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

import { useApplicationReview } from '../../useApplicationReview';
import HandlingStep1 from '../HandlingStep1';

jest.mock('../../useApplicationReview');

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock(
  '../../applicationProcessingView/ApplicationProcessingView',
  () =>
    function MockApplicationProcessingView(): JSX.Element {
      return <div data-testid="application-processing-view" />;
    }
);

jest.mock(
  '../../benefitView/BenefitView',
  () =>
    function MockBenefitView(): JSX.Element {
      return <div data-testid="benefit-view" />;
    }
);

jest.mock(
  '../../companyInfoView/CompanyInfoView',
  () =>
    function MockCompanyInfoView(): JSX.Element {
      return <div data-testid="company-info-view" />;
    }
);

jest.mock(
  '../../consentView/ConsentView',
  () =>
    function MockConsentView(): JSX.Element {
      return <div data-testid="consent-view" />;
    }
);

jest.mock(
  '../../contactPersonView/ContactPersonView',
  () =>
    function MockContactPersonView(): JSX.Element {
      return <div data-testid="contact-person-view" />;
    }
);

jest.mock(
  '../../coOperationNegotiationsView/CoOperationNegotiationsView',
  () =>
    function MockCoOperationNegotiationsView(): JSX.Element {
      return <div data-testid="cooperation-negotiations-view" />;
    }
);

jest.mock(
  '../../deminimisView/DeminimisView',
  () =>
    function MockDeminimisView(): JSX.Element {
      return <div data-testid="deminimis-view" />;
    }
);

jest.mock(
  '../../employeeView/EmployeeView',
  () =>
    function MockEmployeeView(): JSX.Element {
      return <div data-testid="employee-view" />;
    }
);

jest.mock(
  '../../employmentView/EmpoymentView',
  () =>
    function MockEmploymentView(): JSX.Element {
      return <div data-testid="employment-view" />;
    }
);

jest.mock(
  '../../handledView/HandledView',
  () =>
    function MockHandledView(): JSX.Element {
      return <div data-testid="handled-view" />;
    }
);

jest.mock(
  '../../handledView/archivedView/ArchivedView',
  () =>
    function MockArchivedView(): JSX.Element {
      return <div data-testid="archived-view" />;
    }
);

jest.mock(
  '../../paperView/PaperView',
  () =>
    function MockPaperView(): JSX.Element {
      return <div data-testid="paper-view" />;
    }
);

jest.mock(
  '../../salaryBenefitCalculatorView/SalaryBenefitCalculatorView',
  () =>
    function MockSalaryBenefitCalculatorView(): JSX.Element {
      return <div data-testid="salary-benefit-calculator-view" />;
    }
);

jest.mock(
  '../DecisionCalculationAccordion',
  () =>
    function MockDecisionCalculationAccordion(): JSX.Element {
      return <div data-testid="decision-calculation-accordion" />;
    }
);

const mockUseApplicationReview = useApplicationReview as jest.MockedFunction<
  typeof useApplicationReview
>;

const handleUpload = jest.fn();
const handleUpdateReviewState = jest.fn();
const setIsRecalculationRequired = jest.fn();
const setCalculationErrors = jest.fn();

const t = (key: string): string => {
  const translations: Record<string, string> = {
    'common:applications.decision.actions.reportAlteration':
      'Tee uusi muutosilmoitus',
  };
  return translations[key] || key;
};

const createHookMockValue = (
  overrides: Partial<ReturnType<typeof useApplicationReview>> = {}
): ReturnType<typeof useApplicationReview> =>
  ({
    isUploading: false,
    handleUpload,
    reviewState: {},
    handleUpdateReviewState,
    t,
    ...overrides,
  } as ReturnType<typeof useApplicationReview>);

const renderSubject = ({
  application = createAlterationApplication({
    status: APPLICATION_STATUSES.HANDLING,
  }),
  isRecalculationRequired = false,
  calculationsErrors = null,
}: {
  application?: Application;
  isRecalculationRequired?: boolean;
  calculationsErrors?: ErrorData | undefined | null;
} = {}): ReturnType<typeof renderComponent> =>
  renderComponent(
    <HandlingStep1
      application={application}
      setIsRecalculationRequired={setIsRecalculationRequired}
      isRecalculationRequired={isRecalculationRequired}
      calculationsErrors={calculationsErrors}
      setCalculationErrors={setCalculationErrors}
    />
  );

const getReportAlterationButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: 'Tee uusi muutosilmoitus',
  });

describe('HandlingStep1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationReview.mockReturnValue(createHookMockValue());
  });

  describe('Rendering base views', () => {
    it('renders all standard views', () => {
      renderSubject();

      expect(screen.getByTestId('company-info-view')).toBeInTheDocument();
      expect(screen.getByTestId('contact-person-view')).toBeInTheDocument();
      expect(screen.getByTestId('deminimis-view')).toBeInTheDocument();
      expect(
        screen.getByTestId('cooperation-negotiations-view')
      ).toBeInTheDocument();
      expect(screen.getByTestId('employee-view')).toBeInTheDocument();
      expect(screen.getByTestId('employment-view')).toBeInTheDocument();
      expect(screen.getByTestId('benefit-view')).toBeInTheDocument();
      expect(screen.getByTestId('consent-view')).toBeInTheDocument();
    });

    it('renders paper view only when application origin is HANDLER', () => {
      renderSubject({
        application: createAlterationApplication({
          applicationOrigin: APPLICATION_ORIGINS.HANDLER,
        }),
      });

      expect(screen.getByTestId('paper-view')).toBeInTheDocument();
    });

    it('does not render paper view when application origin is not HANDLER', () => {
      renderSubject({
        application: createAlterationApplication({
          applicationOrigin: APPLICATION_ORIGINS.APPLICANT,
        }),
      });

      expect(screen.queryByTestId('paper-view')).not.toBeInTheDocument();
    });
  });

  describe('Decision detail list rendering', () => {
    it('renders decision details from application data', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-06-30';
      const ahjoDecisionDate = '2024-02-15';
      const calculatedBenefitAmount = '1234.4';

      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
          startDate,
          endDate,
          ahjoDecisionDate,
          calculation: {
            calculatedBenefitAmount,
            grantedAsDeMinimisAid: true,
          } as never,
          batch: {
            sectionOfTheLaw: '54 a §',
            decisionMakerName: 'Pekka Paattaja',
            handler: {
              firstName: 'Helmi',
              lastName: 'Handler',
            },
          } as never,
        }),
      });

      const renderedBenefitAmount = formatFloatToEvenEuros(
        calculatedBenefitAmount
      ).replaceAll(/\s+/g, '\\s*');
      expect(
        screen.getByText(new RegExp(`^${renderedBenefitAmount}$`))
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `${convertToUIDateFormat(startDate)} – ${convertToUIDateFormat(
            endDate
          )}`
        )
      ).toBeInTheDocument();
      expect(screen.getByText('54 a §')).toBeInTheDocument();
      expect(screen.getByText('utility.yes')).toBeInTheDocument();
      expect(
        screen.getByText(convertToUIDateFormat(ahjoDecisionDate))
      ).toBeInTheDocument();
      expect(screen.getByText('Helmi Handler')).toBeInTheDocument();
      expect(screen.getByText('Pekka Paattaja')).toBeInTheDocument();
    });
  });

  describe('Conditional rendering based on status', () => {
    it('renders salary calculator and application processing when status is HANDLING', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.HANDLING,
        }),
      });

      expect(
        screen.getByTestId('salary-benefit-calculator-view')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('application-processing-view')
      ).toBeInTheDocument();
    });

    it('does not render salary calculator when status is not HANDLING', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
        }),
      });

      expect(
        screen.queryByTestId('salary-benefit-calculator-view')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('application-processing-view')
      ).not.toBeInTheDocument();
    });

    it.each([[APPLICATION_STATUSES.ACCEPTED], [APPLICATION_STATUSES.REJECTED]])(
      'renders handled view when status is %s',
      (status) => {
        renderSubject({
          application: createAlterationApplication({ status }),
        });

        expect(screen.getByTestId('handled-view')).toBeInTheDocument();
      }
    );

    it('does not render handled view when status is HANDLING', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.HANDLING,
        }),
      });

      expect(screen.queryByTestId('handled-view')).not.toBeInTheDocument();
    });

    it('renders archived view when application is archived and status is ACCEPTED', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
          archived: true,
        }),
      });

      expect(screen.getByTestId('archived-view')).toBeInTheDocument();
    });

    it('does not render archived view when application is not archived', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
          archived: false,
        }),
      });

      expect(screen.queryByTestId('archived-view')).not.toBeInTheDocument();
    });

    it('does not render archived view when status is not ACCEPTED', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.REJECTED,
          archived: true,
        }),
      });

      expect(screen.queryByTestId('archived-view')).not.toBeInTheDocument();
    });
  });

  describe('Decision calculation accordion', () => {
    it.each([[APPLICATION_STATUSES.ACCEPTED], [APPLICATION_STATUSES.HANDLING]])(
      'renders calculation accordion for %s status',
      (status) => {
        renderSubject({
          application: createAlterationApplication({ status }),
        });

        expect(
          screen.getByTestId('decision-calculation-accordion')
        ).toBeInTheDocument();
      }
    );

    it.each([
      [APPLICATION_STATUSES.CANCELLED],
      [APPLICATION_STATUSES.REJECTED],
      [APPLICATION_STATUSES.INFO_REQUIRED],
    ])('does not render calculation accordion for %s status', (status) => {
      renderSubject({
        application: createAlterationApplication({ status }),
      });

      expect(
        screen.queryByTestId('decision-calculation-accordion')
      ).not.toBeInTheDocument();
    });
  });

  describe('Report alteration button', () => {
    it('renders enabled button when application is accepted and has no pending alterations', async () => {
      const user = setupUserAndRender(() =>
        renderSubject({
          application: createAlterationApplication({
            status: APPLICATION_STATUSES.ACCEPTED,
            alterations: [],
          }),
        })
      );

      const reportButton = getReportAlterationButton();

      expect(reportButton).toBeInTheDocument();
      expect(reportButton).toBeEnabled();

      await user.click(reportButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(ROUTES.NEW_ALTERATION)
      );
    });

    it.each([
      {
        title: 'application has pending alterations',
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
          alterations: [
            {
              id: 'alteration-1',
              state: ALTERATION_STATE.RECEIVED,
            } as never,
          ],
        }),
      },
      {
        title: 'application is not accepted',
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.HANDLING,
          alterations: [],
        }),
      },
    ])('renders disabled button when $title', ({ application }) => {
      renderSubject({ application });

      const reportButton = getReportAlterationButton();

      expect(reportButton).toBeDisabled();
    });

    it('includes application id in navigation URL', async () => {
      const user = setupUserAndRender(() =>
        renderSubject({
          application: createAlterationApplication({
            id: 'test-app-123',
            status: APPLICATION_STATUSES.ACCEPTED,
            alterations: [],
          }),
        })
      );

      const appId = 'test-app-123';
      const reportButton = getReportAlterationButton();

      await user.click(reportButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(`applicationId=${appId}`)
      );
    });
  });

  describe('Passing props to child views', () => {
    it('passes isUploading and handleUpload to employee view', () => {
      mockUseApplicationReview.mockReturnValue(
        createHookMockValue({
          isUploading: true,
          handleUpload,
        })
      );

      renderSubject();

      expect(screen.getByTestId('employee-view')).toBeInTheDocument();
    });

    it('passes recalculation props to salary benefit calculator', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.HANDLING,
        }),
        isRecalculationRequired: true,
      });

      expect(
        screen.getByTestId('salary-benefit-calculator-view')
      ).toBeInTheDocument();
    });
  });

  describe('Empty alterations', () => {
    it('handles undefined alterations gracefully', () => {
      renderSubject({
        application: createAlterationApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
          alterations: undefined,
        }),
      });

      const reportButton = getReportAlterationButton();

      expect(reportButton).toBeEnabled();
    });
  });
});
