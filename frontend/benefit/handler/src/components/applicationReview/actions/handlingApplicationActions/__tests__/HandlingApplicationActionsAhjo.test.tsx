import '@testing-library/jest-dom';

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createAlterationApplication } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useDecisionProposalDraftMutation from 'benefit/handler/hooks/applicationHandling/useDecisionProposalDraftMutation';
import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import useCloneApplicationMutation from 'benefit/handler/hooks/useCloneApplicationMutation';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Calculation, Row } from 'benefit-shared/types/application';
import i18n from 'i18next';
import { useRouter } from 'next/router';
import React from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { focusAndScroll } from 'shared/utils/dom.utils';

import HandlingApplicationActionsAhjo from '../HandlingApplicationActionsAhjo';
import { useHandlingApplicationActions } from '../useHandlingApplicationActions';

jest.mock('benefit/handler/hooks/applicationHandling/useRouterNavigation');
jest.mock(
  'benefit/handler/hooks/applicationHandling/useDecisionProposalDraftMutation'
);
jest.mock('benefit/handler/hooks/useCloneApplicationMutation');
jest.mock('../useHandlingApplicationActions');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('shared/components/toast/show-error-toast');
jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
  focusAndScrollToSelector: jest.fn(),
}));

const ACTION_LABELS = {
  close: 'Sulje',
  saveAndClose: 'Tallenna ja sulje',
  handlingPanel: 'Käsittelypaneeli',
  cloneApplication: 'Kopioi hakemus',
  cancelApplication: 'Peruuta hakemus',
  previous: 'Edellinen',
  next: 'Seuraava',
  send: 'Lähetä',
} as const;

const t = i18n.t.bind(i18n);

const getActionButton = (label: string): HTMLElement =>
  screen.getByRole('button', { name: label });

const queryActionButton = (label: string): HTMLElement | null =>
  screen.queryByRole('button', { name: label });

const getDialogs = (): HTMLElement[] => screen.getAllByRole('dialog');

type HandlingActionsHookValue = ReturnType<
  typeof useHandlingApplicationActions
>;

type DraftPayload = {
  reviewStep: number;
  applicationId: string;
};

const mockNavigateBack = jest.fn();
const mockUpdateApplication = jest.fn();
const mockCloneApplication = jest.fn();
const mockPush = jest.fn();
const mockToggleMessagesDrawerVisibility = jest.fn();
const mockOpenDialog = jest.fn();
const mockOnDoneConfirmation = jest.fn();
const originalSentryEnvironment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

const createHandlingApplication = (
  overrides: Partial<ReturnType<typeof createAlterationApplication>> = {}
): ReturnType<typeof createAlterationApplication> =>
  createAlterationApplication({
    status: APPLICATION_STATUSES.HANDLING,
    calculation: { rows: [{ id: 'row-1' } as Row] } as Calculation,
    archived: false,
    ...overrides,
  });

const expectDraftMutationPayload = (
  reviewStep: number,
  applicationId: string
): void => {
  expect(mockUpdateApplication).toHaveBeenCalledWith(
    expect.objectContaining<DraftPayload>({
      reviewStep,
      applicationId,
    })
  );
};

const mockCloneConfirmation = (isConfirmed: boolean): jest.SpyInstance =>
  jest.spyOn(window, 'confirm').mockReturnValue(isConfirmed);

const createHandledApplication = (overrides = {}): Record<string, unknown> => ({
  status: APPLICATION_STATUSES.REJECTED,
  logEntryComment: 'rejection reason',
  decisionMakerId: 'decision-maker',
  signerId: 'signer',
  decisionText: 'Decision text is long enough',
  justificationText: 'Justification text is long enough',
  ...overrides,
});

const createHookMockValue = (
  overrides: Partial<HandlingActionsHookValue> = {}
): HandlingActionsHookValue =>
  ({
    t,
    toggleMessagesDrawerVisibility: mockToggleMessagesDrawerVisibility,
    openDialog: mockOpenDialog,
    closeDialog: jest.fn(),
    closeDoneDialog: jest.fn(),
    handleCancel: jest.fn(),
    isMessagesDrawerVisible: false,
    translationsBase: 'common:review.actions',
    isConfirmationModalOpen: false,
    isDoneConfirmationModalOpen: false,
    handledApplication: createHandledApplication() as never,
    onDoneConfirmation: mockOnDoneConfirmation,
    ...overrides,
  } as HandlingActionsHookValue);

const createStepState = (
  activeStepIndex = 0
): { activeStepIndex: number; steps: Record<string, unknown>[] } => ({
  activeStepIndex,
  steps: [{}, {}, {}],
});

const createDefaultTestApplication = (): ReturnType<
  typeof createHandlingApplication
> => createHandlingApplication({ id: 'app-123' });

const renderSubject = ({
  application = createHandlingApplication(),
  stepState = createStepState(0),
  stepperDispatch = jest.fn(),
  isRecalculationRequired = false,
  isCalculationsErrors = false,
  isApplicationReadOnly = false,
}: {
  application?: ReturnType<typeof createAlterationApplication>;
  stepState?: ReturnType<typeof createStepState>;
  stepperDispatch?: jest.Mock;
  isRecalculationRequired?: boolean;
  isCalculationsErrors?: boolean;
  isApplicationReadOnly?: boolean;
} = {}): ReturnType<typeof renderComponent> =>
  renderComponent(
    <HandlingApplicationActionsAhjo
      application={application}
      stepState={stepState as never}
      stepperDispatch={stepperDispatch}
      isRecalculationRequired={isRecalculationRequired}
      isCalculationsErrors={isCalculationsErrors}
      isApplicationReadOnly={isApplicationReadOnly}
    />,
    {
      push: mockPush,
      query: {},
    }
  );

describe('HandlingApplicationActionsAhjo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'development';

    (useHandlingApplicationActions as jest.Mock).mockReturnValue(
      createHookMockValue()
    );
    (useRouterNavigation as jest.Mock).mockReturnValue({
      navigateBack: mockNavigateBack,
    });
    (useDecisionProposalDraftMutation as jest.Mock).mockReturnValue({
      data: null,
      mutate: mockUpdateApplication,
      isError: false,
    });
    (useCloneApplicationMutation as jest.Mock).mockReturnValue({
      data: null,
      mutate: mockCloneApplication,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: {},
    });
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = originalSentryEnvironment;
  });

  it('renders base action buttons', () => {
    renderSubject();

    expect(getActionButton(ACTION_LABELS.close)).toBeInTheDocument();
    expect(getActionButton(ACTION_LABELS.saveAndClose)).toBeInTheDocument();
    expect(getActionButton(ACTION_LABELS.handlingPanel)).toBeInTheDocument();
  });

  it('calls navigateBack when close is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getActionButton(ACTION_LABELS.close));

    expect(mockNavigateBack).toHaveBeenCalledTimes(1);
  });

  it('calls toggleMessagesDrawerVisibility when handling panel is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getActionButton(ACTION_LABELS.handlingPanel));

    expect(mockToggleMessagesDrawerVisibility).toHaveBeenCalledTimes(1);
  });

  it('calls cloneApplication when clone is confirmed', async () => {
    const confirmSpy = mockCloneConfirmation(true);
    const application = createHandlingApplication({
      id: 'clone-id-1',
    });

    const user = setupUserAndRender(() => renderSubject({ application }));

    await user.click(getActionButton(ACTION_LABELS.cloneApplication));

    expect(confirmSpy).toHaveBeenCalledWith(
      'Haluatko varmasti kloonata tämän hakemuksen?'
    );
    expect(mockCloneApplication).toHaveBeenCalledWith('clone-id-1');
    confirmSpy.mockRestore();
  });

  it('does not call cloneApplication when clone confirmation is rejected', async () => {
    const confirmSpy = mockCloneConfirmation(false);

    const user = setupUserAndRender(() =>
      renderSubject({
        application: createHandlingApplication({
          id: 'clone-id-2',
        }),
      })
    );

    await user.click(getActionButton(ACTION_LABELS.cloneApplication));

    expect(mockCloneApplication).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('navigates to cloned application when clonedData.id exists', async () => {
    (useCloneApplicationMutation as jest.Mock).mockReturnValue({
      data: { id: 'cloned-app-123' },
      mutate: mockCloneApplication,
    });

    renderSubject();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/application?id=cloned-app-123');
    });
  });

  it('dispatches completeStep when draft mutation data contains review_step', async () => {
    const stepperDispatch = jest.fn();

    (useDecisionProposalDraftMutation as jest.Mock).mockReturnValue({
      data: { review_step: 4 },
      mutate: mockUpdateApplication,
      isError: false,
    });

    renderSubject({ stepperDispatch });

    await waitFor(() => {
      expect(stepperDispatch).toHaveBeenCalledWith({
        type: 'completeStep',
        payload: 2,
      });
    });
  });

  it('calls updateApplication from save and close with current review step', async () => {
    const application = createDefaultTestApplication();

    const user = setupUserAndRender(() => renderSubject({ application }));

    await user.click(getActionButton(ACTION_LABELS.saveAndClose));

    expectDraftMutationPayload(1, 'app-123');
  });

  it('navigates back after save and close when mutation review step matches current step', async () => {
    const application = createDefaultTestApplication();

    (useDecisionProposalDraftMutation as jest.Mock).mockReturnValue({
      data: { review_step: 1 },
      mutate: mockUpdateApplication,
      isError: false,
    });

    const user = setupUserAndRender(() => renderSubject({ application }));

    await user.click(getActionButton(ACTION_LABELS.saveAndClose));

    await waitFor(() => {
      expect(mockNavigateBack).toHaveBeenCalledTimes(1);
    });
  });

  it('shows calculation error and blocks save when recalculation is required', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ isRecalculationRequired: true })
    );

    await user.click(getActionButton(ACTION_LABELS.saveAndClose));

    expect(focusAndScroll).toHaveBeenCalledWith('endDate');
    expect(showErrorToast).toHaveBeenCalledTimes(1);
    expect(mockUpdateApplication).not.toHaveBeenCalled();
  });

  it('shows cancel button and calls openDialog when clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getActionButton(ACTION_LABELS.cancelApplication));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
  });

  it('does not show cancel button for ACCEPTED status', () => {
    renderSubject({
      application: createHandlingApplication({
        status: APPLICATION_STATUSES.ACCEPTED,
      }),
    });

    expect(
      queryActionButton(ACTION_LABELS.cancelApplication)
    ).not.toBeInTheDocument();
  });

  it('disables cancel button for read-only application without ahjoCaseId', () => {
    renderSubject({
      isApplicationReadOnly: true,
      application: createHandlingApplication({
        ahjoCaseId: undefined,
      }),
    });

    expect(getActionButton(ACTION_LABELS.cancelApplication)).toBeDisabled();
  });

  it('shows previous button on step > 0 and calls updateApplication on click', async () => {
    const application = createDefaultTestApplication();

    const user = setupUserAndRender(() =>
      renderSubject({
        application,
        stepState: createStepState(1),
      })
    );

    await user.click(getActionButton(ACTION_LABELS.previous));

    expectDraftMutationPayload(1, 'app-123');
  });

  it('calls updateApplication with next review step when next is clicked on non-final step', async () => {
    const application = createDefaultTestApplication();

    const user = setupUserAndRender(() =>
      renderSubject({
        application,
        stepState: createStepState(0),
      })
    );

    await user.click(getActionButton(ACTION_LABELS.next));

    expectDraftMutationPayload(2, 'app-123');
  });

  it('filters out step2 validation fields when validating from first step', async () => {
    (useHandlingApplicationActions as jest.Mock).mockReturnValue(
      createHookMockValue({
        handledApplication: null,
      })
    );

    renderSubject({
      application: createHandlingApplication({
        id: 'app-step-1',
      }),
    });

    fireEvent.click(getActionButton(ACTION_LABELS.next));

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalled();
    });

    const toastMessages = (showErrorToast as jest.Mock).mock.calls.map(
      (call) => call[1]
    );

    expect(toastMessages).toContain('Puoltotieto puuttuu');
    expect(toastMessages).not.toContain('Päätös ei voi olla tyhjä');
    expect(toastMessages).not.toContain(
      'Päätöksen perustelu ei voi olla tyhjä'
    );
    expect(toastMessages).not.toContain('Allekirjoittaja puuttuu');
    expect(toastMessages).not.toContain('Päättäjän rooli puuttuu');
    expect(mockUpdateApplication).not.toHaveBeenCalled();
  });

  it('calls onDoneConfirmation when send is clicked on final step', async () => {
    const application = createHandlingApplication();

    (useHandlingApplicationActions as jest.Mock).mockReturnValue(
      createHookMockValue({
        handledApplication: createHandledApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
        }) as never,
      })
    );

    const user = setupUserAndRender(() =>
      renderSubject({
        application,
        stepState: createStepState(2),
      })
    );

    await user.click(getActionButton(ACTION_LABELS.send));

    expect(mockOnDoneConfirmation).toHaveBeenCalledTimes(1);
  });

  it.each([APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED])(
    'sets router query action to submit and pushes router on final step for %s status',
    async (status) => {
      renderSubject({
        application: createHandlingApplication({
          status,
        }),
        stepState: createStepState(2),
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.objectContaining({ action: 'submit' }),
          })
        );
      });
    }
  );

  it('submits done confirmation modal via onSubmit and updates application with finish step', async () => {
    const application = createHandlingApplication({
      id: 'app-999',
    });

    (useHandlingApplicationActions as jest.Mock).mockReturnValue(
      createHookMockValue({
        isDoneConfirmationModalOpen: true,
        handledApplication: createHandledApplication({
          status: APPLICATION_STATUSES.ACCEPTED,
        }) as never,
      })
    );

    const user = setupUserAndRender(() =>
      renderSubject({
        application,
        stepState: createStepState(2),
      })
    );

    await user.click(screen.getByTestId('submit'));

    expect(mockUpdateApplication).toHaveBeenCalledWith(
      expect.objectContaining<DraftPayload>({
        reviewStep: 4,
        applicationId: 'app-999',
      })
    );
  });

  it('renders confirmation modals based on hook state', () => {
    (useHandlingApplicationActions as jest.Mock).mockReturnValue(
      createHookMockValue({
        isConfirmationModalOpen: true,
        isDoneConfirmationModalOpen: true,
      })
    );

    renderSubject();

    expect(getDialogs()).toHaveLength(2);
  });
});
