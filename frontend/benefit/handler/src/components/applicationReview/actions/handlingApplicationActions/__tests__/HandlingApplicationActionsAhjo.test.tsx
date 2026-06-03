import { fireEvent, RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { useHandlingApplicationActions } from 'benefit/handler/components/applicationReview/actions/handlingApplicationActions/useHandlingApplicationActions';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import useDecisionProposalDraftMutation from 'benefit/handler/hooks/applicationHandling/useDecisionProposalDraftMutation';
import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import useCloneApplicationMutation from 'benefit/handler/hooks/useCloneApplicationMutation';
import useUpdateCompanyIndustryCode from 'benefit/handler/hooks/useUpdateCompanyIndustryCode';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import React from 'react';
import theme from 'shared/styles/theme';

import HandlingApplicationActionsAhjo, {
  Props,
} from '../HandlingApplicationActionsAhjo';

jest.mock(
  'benefit/handler/components/applicationReview/actions/handlingApplicationActions/useHandlingApplicationActions',
  () => ({
    useHandlingApplicationActions: jest.fn(),
  })
);
jest.mock(
  'benefit/handler/hooks/applicationHandling/useRouterNavigation',
  () => ({
    useRouterNavigation: jest.fn(),
  })
);
jest.mock(
  'benefit/handler/hooks/applicationHandling/useDecisionProposalDraftMutation',
  () => jest.fn()
);
jest.mock('benefit/handler/hooks/useCloneApplicationMutation', () => jest.fn());
jest.mock('benefit/handler/hooks/useUpdateCompanyIndustryCode', () =>
  jest.fn()
);
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

function MockEditAction(): JSX.Element {
  return <span />;
}
function MockSidebar(): JSX.Element {
  return <span />;
}

jest.mock(
  'benefit/handler/components/applicationReview/actions/editAction/EditAction',
  () => MockEditAction
);
jest.mock('benefit/handler/components/sidebar/Sidebar', () => MockSidebar);
jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
  focusAndScrollToSelector: jest.fn(),
}));

const buildApplication = (overrides: Partial<Application> = {}): Application =>
  ({
    id: 'app-1',
    status: APPLICATION_STATUSES.HANDLING,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    company: {
      id: 'company-1',
      businessId: '1234567-1',
      name: 'Test Oy',
      industryCode: '',
    },
    calculation: { rows: [{ id: 'row-1' }] },
    ...overrides,
  } as unknown as Application);

const buildContextValue = (
  handledApplication: HandledAplication | null = null,
  setHandledApplication: React.Dispatch<
    React.SetStateAction<HandledAplication | null>
  > = noop
): AppContextType => ({
  isNavigationVisible: false,
  isFooterVisible: true,
  isSidebarVisible: false,
  layoutBackgroundColor: theme.colors.white,
  handledApplication,
  setIsNavigationVisible: noop,
  setIsFooterVisible: noop,
  setLayoutBackgroundColor: noop,
  setHandledApplication,
  setIsSidebarVisible: noop,
});

// A fully valid handledApplication (all step 1 + step 2 fields valid)
const validHandledApplication: HandledAplication = {
  status: APPLICATION_STATUSES.ACCEPTED,
  grantedAsDeMinimisAid: false,
  decisionMakerId: 'dm-1',
  signerId: 'signer-1',
  decisionText: 'Decision text that is long enough',
  justificationText: 'Justification text that is long enough',
};

type MakeComponentOptions = {
  props?: Partial<Props>;
  handledApplication?: HandledAplication | null;
  setHandledApplication?: React.Dispatch<
    React.SetStateAction<HandledAplication | null>
  >;
};

const makeComponent = ({
  props = {},
  handledApplication = validHandledApplication,
  setHandledApplication = noop,
}: MakeComponentOptions = {}): RenderResult => {
  const defaultStepState = {
    activeStepIndex: 0,
    steps: [1, 2, 3] as unknown as Props['stepState']['steps'],
  };
  const defaultProps: Props = {
    application: buildApplication(),
    stepperDispatch: jest.fn(),
    stepState: defaultStepState,
    isRecalculationRequired: false,
    isCalculationsErrors: false,
    isApplicationReadOnly: false,
  };

  return renderComponent(
    <AppContext.Provider
      value={buildContextValue(handledApplication, setHandledApplication)}
    >
      <HandlingApplicationActionsAhjo {...defaultProps} {...props} />
    </AppContext.Provider>
  ).renderResult;
};

describe('HandlingApplicationActionsAhjo', () => {
  const mockMutate = jest.fn();
  const mockNavigateBack = jest.fn();
  const mockOnDoneConfirmation = jest.fn();

  const setupHookMocks = (
    handledApplication: HandledAplication = validHandledApplication
  ): void => {
    (useHandlingApplicationActions as jest.Mock).mockReturnValue({
      t: (key: string): string => key,
      toggleMessagesDrawerVisibility: jest.fn(),
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
      closeDoneDialog: jest.fn(),
      handleCancel: jest.fn(),
      isMessagesDrawerVisible: false,
      translationsBase: 'common:review.actions',
      isConfirmationModalOpen: false,
      isDoneConfirmationModalOpen: false,
      handledApplication,
      setHandledApplication: noop,
      onDoneConfirmation: mockOnDoneConfirmation,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    setupHookMocks();

    (useRouterNavigation as jest.Mock).mockReturnValue({
      navigateBack: mockNavigateBack,
    });
    (useDecisionProposalDraftMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      data: null,
      isError: false,
    });
    (useCloneApplicationMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      data: null,
    });
    (useUpdateCompanyIndustryCode as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
    });
    (useRouter as jest.Mock).mockReturnValue({ query: {}, push: jest.fn() });
  });

  it('renders without crashing', () => {
    makeComponent();
    expect(screen.getByText('common:review.actions.close')).toBeInTheDocument();
  });

  it('renders Next button when application is in HANDLING status', () => {
    makeComponent();
    expect(screen.getByText('common:utility.next')).toBeInTheDocument();
  });

  it('does not render Next button when application is not in HANDLING status', () => {
    makeComponent({
      props: {
        application: buildApplication({
          status: APPLICATION_STATUSES.RECEIVED,
        }),
      },
    });
    expect(screen.queryByText('common:utility.next')).not.toBeInTheDocument();
  });

  it('clicking Next calls updateApplication (mutate) when step 0 validation passes', () => {
    makeComponent();
    fireEvent.click(screen.getByText('common:utility.next'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('clicking Next is blocked when status is missing (step 0 validation fails)', () => {
    const noStatus: HandledAplication = {
      ...validHandledApplication,
      status: undefined,
    };
    setupHookMocks(noStatus);
    makeComponent({ handledApplication: noStatus });
    fireEvent.click(screen.getByText('common:utility.next'));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('step 2 fields (decisionText) do NOT block at step 0', () => {
    const shortDecisionText: HandledAplication = {
      ...validHandledApplication,
      decisionText: 'short', // < 10 chars, invalid for step 2
      justificationText: 'short',
    };
    setupHookMocks(shortDecisionText);
    makeComponent({
      props: {
        stepState: {
          activeStepIndex: 0,
          steps: [1, 2, 3] as unknown as Props['stepState']['steps'],
        },
      },
      handledApplication: shortDecisionText,
    });
    fireEvent.click(screen.getByText('common:utility.next'));
    // Step 0 should pass because step2 fields are only validated at step > 0
    expect(mockMutate).toHaveBeenCalled();
  });

  it('step 2 fields (decisionText) block at step 1', () => {
    const shortDecisionText: HandledAplication = {
      ...validHandledApplication,
      decisionText: 'short',
      justificationText: 'short',
    };
    setupHookMocks(shortDecisionText);
    makeComponent({
      props: {
        stepState: {
          activeStepIndex: 1,
          steps: [1, 2, 3] as unknown as Props['stepState']['steps'],
        },
      },
      handledApplication: shortDecisionText,
    });
    fireEvent.click(screen.getByText('common:utility.next'));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('step 2 fields (empty signerId) block at step 1', () => {
    const emptySignerId: HandledAplication = {
      ...validHandledApplication,
      signerId: '',
      decisionMakerId: '',
    };
    setupHookMocks(emptySignerId);
    makeComponent({
      props: {
        stepState: {
          activeStepIndex: 1,
          steps: [1, 2, 3] as unknown as Props['stepState']['steps'],
        },
      },
      handledApplication: emptySignerId,
    });
    fireEvent.click(screen.getByText('common:utility.next'));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('all valid fields at step 1 allow proceeding', () => {
    makeComponent({
      props: {
        stepState: {
          activeStepIndex: 1,
          steps: [1, 2, 3] as unknown as Props['stepState']['steps'],
        },
      },
    });
    fireEvent.click(screen.getByText('common:utility.next'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('industryCode is required when grantedAsDeMinimisAid is true and no company industryCode', () => {
    const deMinimisNoCode: HandledAplication = {
      ...validHandledApplication,
      grantedAsDeMinimisAid: true,
      industryCode: '',
    };
    setupHookMocks(deMinimisNoCode);
    makeComponent({
      handledApplication: deMinimisNoCode,
    });
    fireEvent.click(screen.getByText('common:utility.next'));
    // industryCode missing → errorStep1 = true → mutate NOT called
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('industryCode is not required when company already has an industryCode', () => {
    const deMinimisWithCompanyCode: HandledAplication = {
      ...validHandledApplication,
      grantedAsDeMinimisAid: true,
      industryCode: '',
    };
    setupHookMocks(deMinimisWithCompanyCode);
    makeComponent({
      props: {
        application: buildApplication({
          company: {
            id: 'c1',
            businessId: '123',
            name: 'Oy',
            industryCode: '62010',
          } as Application['company'],
        }),
      },
      handledApplication: deMinimisWithCompanyCode,
    });
    fireEvent.click(screen.getByText('common:utility.next'));
    // Company already has industryCode → not missing → mutate called
    expect(mockMutate).toHaveBeenCalled();
  });
});
