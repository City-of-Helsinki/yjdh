import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import { createAlterationApplication } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Batch } from 'benefit-shared/types/application';
import i18n from 'i18next';
import React from 'react';

import HandlingApplicationActions from '../HandlingApplicationActions';
import { useHandlingApplicationActions } from '../useHandlingApplicationActions';

jest.mock('../useHandlingApplicationActions');

const t = i18n.t.bind(i18n);

const ACTION_LABELS = {
  done: 'Tee päätösehdotus',
  saveAndClose: 'Tallenna ja sulje',
  close: 'Sulje',
  backToHandling: 'Palauta käsittelyyn',
  handlingPanel: 'Käsittelypaneeli',
  cancelApplication: 'Peruuta hakemus',
} as const;

const getActionButton = (label: string): HTMLElement =>
  screen.getByRole('button', { name: label });

const queryActionButton = (label: string): HTMLElement | null =>
  screen.queryByRole('button', { name: label });

type HandlingActionsHookValue = ReturnType<
  typeof useHandlingApplicationActions
>;

const createHookMockValue = (
  overrides: Partial<HandlingActionsHookValue> = {}
): HandlingActionsHookValue =>
  ({
    t,
    onDone: jest.fn(),
    onDoneConfirmation: jest.fn(),
    onBackToHandling: jest.fn(),
    onSaveAndClose: jest.fn(),
    toggleMessagesDrawerVisibility: jest.fn(),
    openDialog: jest.fn(),
    closeDialog: jest.fn(),
    closeDoneDialog: jest.fn(),
    handleCancel: jest.fn(),
    isMessagesDrawerVisible: false,
    translationsBase: 'common:review.actions',
    isDisabledDoneButton: false,
    isConfirmationModalOpen: false,
    isDoneConfirmationModalOpen: false,
    handledApplication: null,
    ...overrides,
  } as HandlingActionsHookValue);

const createApplicationFixture = (
  overrides: Partial<ReturnType<typeof createAlterationApplication>> = {}
): ReturnType<typeof createAlterationApplication> =>
  createAlterationApplication({
    batch: undefined,
    archived: false,
    ...overrides,
  });

describe('HandlingApplicationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useHandlingApplicationActions as jest.Mock).mockReturnValue(
      createHookMockValue()
    );
  });

  describe('Rendering', () => {
    it('renders with data-testid when provided', () => {
      const application = createAlterationApplication();
      renderComponent(
        <HandlingApplicationActions
          application={application}
          data-testid="custom-testid"
        />
      );

      expect(screen.getByTestId('custom-testid')).toBeInTheDocument();
    });
  });

  describe('Button rendering by application status', () => {
    it('renders done button when status is HANDLING', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      const mockHookValue = createHookMockValue();
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        mockHookValue
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      const doneButton = getActionButton(ACTION_LABELS.done);
      expect(doneButton).toBeInTheDocument();
    });

    it('does not render done button when status is not HANDLING', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.ACCEPTED,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(queryActionButton(ACTION_LABELS.done)).not.toBeInTheDocument();
    });

    it('renders saveAndContinue button when status is HANDLING', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(getActionButton(ACTION_LABELS.saveAndClose)).toBeInTheDocument();
    });

    it('renders close button when status is not HANDLING', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.ACCEPTED,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(getActionButton(ACTION_LABELS.close)).toBeInTheDocument();
    });
  });

  describe('Back to handling button', () => {
    it.each([APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED])(
      'renders backToHandling button when status is %s and not batch or archived',
      (status) => {
        const application = createApplicationFixture({
          status,
        });
        (useHandlingApplicationActions as jest.Mock).mockReturnValue(
          createHookMockValue()
        );

        renderComponent(
          <HandlingApplicationActions application={application} />
        );

        expect(
          getActionButton(ACTION_LABELS.backToHandling)
        ).toBeInTheDocument();
      }
    );

    it('does not render backToHandling button when application is batch', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.ACCEPTED,
        batch: { id: '1' } as Batch,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(
        queryActionButton(ACTION_LABELS.backToHandling)
      ).not.toBeInTheDocument();
    });

    it('does not render backToHandling button when application is archived', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.ACCEPTED,
        archived: true,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(
        queryActionButton(ACTION_LABELS.backToHandling)
      ).not.toBeInTheDocument();
    });
  });

  describe('Handling panel button', () => {
    it('renders handling panel button', () => {
      const application = createApplicationFixture();
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(getActionButton(ACTION_LABELS.handlingPanel)).toBeInTheDocument();
    });

    it('calls toggleMessagesDrawerVisibility when handling panel button is clicked', async () => {
      const mockToggle = jest.fn();
      const application = createApplicationFixture();
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ toggleMessagesDrawerVisibility: mockToggle })
      );

      const user = setupUserAndRender(() =>
        renderComponent(
          <HandlingApplicationActions application={application} />
        )
      );

      const button = getActionButton(ACTION_LABELS.handlingPanel);
      await user.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancel button', () => {
    it('renders cancel button when status is not CANCELLED and not batch or archived', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(
        getActionButton(ACTION_LABELS.cancelApplication)
      ).toBeInTheDocument();
    });

    it('does not render cancel button when status is CANCELLED', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.CANCELLED,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(
        queryActionButton(ACTION_LABELS.cancelApplication)
      ).not.toBeInTheDocument();
    });

    it('does not render cancel button when application is batch', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
        batch: { id: '1' } as Batch,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(
        queryActionButton(ACTION_LABELS.cancelApplication)
      ).not.toBeInTheDocument();
    });

    it('does not render cancel button when application is archived', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
        archived: true,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue()
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      expect(
        queryActionButton(ACTION_LABELS.cancelApplication)
      ).not.toBeInTheDocument();
    });

    it('calls openDialog when cancel button is clicked', async () => {
      const mockOpenDialog = jest.fn();
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ openDialog: mockOpenDialog })
      );

      const user = setupUserAndRender(() =>
        renderComponent(
          <HandlingApplicationActions application={application} />
        )
      );

      const button = getActionButton(ACTION_LABELS.cancelApplication);
      await user.click(button);

      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe('Save and close button', () => {
    it('calls onSaveAndClose when save and close button is clicked', async () => {
      const mockSaveAndClose = jest.fn();
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ onSaveAndClose: mockSaveAndClose })
      );

      const user = setupUserAndRender(() =>
        renderComponent(
          <HandlingApplicationActions application={application} />
        )
      );

      const button = getActionButton(ACTION_LABELS.saveAndClose);
      await user.click(button);

      expect(mockSaveAndClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Done button', () => {
    it('is disabled when isDisabledDoneButton is true', () => {
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ isDisabledDoneButton: true })
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      const button = getActionButton(ACTION_LABELS.done);
      expect(button).toBeDisabled();
    });

    it('calls onDoneConfirmation when done button is clicked', async () => {
      const mockOnDoneConfirmation = jest.fn();
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.HANDLING,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ onDoneConfirmation: mockOnDoneConfirmation })
      );

      const user = setupUserAndRender(() =>
        renderComponent(
          <HandlingApplicationActions application={application} />
        )
      );

      const button = getActionButton(ACTION_LABELS.done);
      await user.click(button);

      expect(mockOnDoneConfirmation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancel modal', () => {
    it.each([
      {
        isOpen: true,
        testName: 'renders cancel modal when isConfirmationModalOpen is true',
      },
      {
        isOpen: false,
        testName:
          'does not render cancel modal when isConfirmationModalOpen is false',
      },
    ])('$testName', ({ isOpen }) => {
      const application = createApplicationFixture();
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ isConfirmationModalOpen: isOpen })
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      if (isOpen) {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }
    });
  });

  describe('Done confirmation modal', () => {
    it.each([
      {
        isOpen: true,
        testName: 'renders done modal when isDoneConfirmationModalOpen is true',
      },
      {
        isOpen: false,
        testName:
          'does not render done modal when isDoneConfirmationModalOpen is false',
      },
    ])('$testName', ({ isOpen }) => {
      const application = createApplicationFixture();
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ isDoneConfirmationModalOpen: isOpen })
      );

      renderComponent(<HandlingApplicationActions application={application} />);

      if (isOpen) {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }
    });
  });

  describe('Back to handling button behavior', () => {
    it('calls onBackToHandling when back to handling button is clicked', async () => {
      const mockOnBackToHandling = jest.fn();
      const application = createApplicationFixture({
        status: APPLICATION_STATUSES.ACCEPTED,
      });
      (useHandlingApplicationActions as jest.Mock).mockReturnValue(
        createHookMockValue({ onBackToHandling: mockOnBackToHandling })
      );

      const user = setupUserAndRender(() =>
        renderComponent(
          <HandlingApplicationActions application={application} />
        )
      );

      const button = getActionButton(ACTION_LABELS.backToHandling);
      await user.click(button);

      expect(mockOnBackToHandling).toHaveBeenCalledTimes(1);
    });
  });
});
