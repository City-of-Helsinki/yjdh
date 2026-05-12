import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useConfirm from 'shared/hooks/useConfirm';
import useGoToPage from 'shared/hooks/useGoToPage';
import { setLeaveConfirmBypassed } from 'shared/hooks/useLeaveConfirm';
import useWizard from 'shared/hooks/useWizard';

import ActionButtons from '../ActionButtons';

type ActionButtonsProps = React.ComponentProps<typeof ActionButtons>;

type FormContextMock = {
  handleSubmit: jest.Mock;
  setError: jest.Mock;
  formState: { isSubmitting: boolean };
};

type WizardMock = {
  isFirstStep: boolean;
  isLastStep: boolean;
  goToPreviousStep: jest.Mock;
  goToNextStep: jest.Mock;
  clearStepHistory: jest.Mock;
  isLoading: boolean;
};

type ApplicationApiMock = {
  updateApplication: jest.Mock;
  sendApplication: jest.Mock;
  deleteApplication: jest.Mock;
  updateApplicationQuery: { isLoading: boolean };
  deleteApplicationQuery: { isLoading: boolean };
};

type TestSetupOptions = {
  props?: Partial<ActionButtonsProps>;
  formContext?: FormContextMock;
  wizard?: WizardMock;
  applicationApi?: ApplicationApiMock;
};

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

jest.mock('kesaseteli/employer/hooks/application/useApplicationApi', () =>
  jest.fn()
);
jest.mock('shared/hooks/useConfirm', () => jest.fn());
jest.mock('shared/hooks/useWizard', () => jest.fn());
jest.mock('shared/hooks/useGoToPage', () => jest.fn());
jest.mock('shared/hooks/useLeaveConfirm', () => ({
  setLeaveConfirmBypassed: jest.fn(),
}));

const getActionButtons = (): {
  cancelButton: HTMLElement;
  nextButton: HTMLElement;
} => ({
  cancelButton: screen.getByRole('button', {
    name: /keskeytä/i,
  }),
  nextButton: screen.getByRole('button', {
    name: /tallenna ja jatka|lähetä hakemus/i,
  }),
});

describe('ActionButtons', () => {
  const mockConfirm = jest.fn();
  const mockDeleteApplication = jest.fn();
  const mockSendApplication = jest.fn();
  const mockGoToPage = jest.fn();
  const mockClearStepHistory = jest.fn();

  const getDefaultFormContext = (): FormContextMock => ({
    handleSubmit: jest.fn(() => jest.fn()),
    setError: jest.fn(),
    formState: { isSubmitting: false },
  });

  const getDefaultWizard = (): WizardMock => ({
    isFirstStep: false,
    isLastStep: false,
    goToPreviousStep: jest.fn(),
    goToNextStep: jest.fn(),
    clearStepHistory: mockClearStepHistory,
    isLoading: false,
  });

  const getDefaultApplicationApi = (): ApplicationApiMock => ({
    updateApplication: jest.fn(),
    sendApplication: mockSendApplication,
    deleteApplication: mockDeleteApplication,
    updateApplicationQuery: { isLoading: false },
    deleteApplicationQuery: { isLoading: false },
  });

  const renderActionButtonsWithProps = (
    props?: Partial<ActionButtonsProps>
  ): {
    user: ReturnType<typeof userEvent.setup>;
    cancelButton: HTMLElement;
    nextButton: HTMLElement;
  } => {
    const user = userEvent.setup();
    renderComponent(<ActionButtons {...props} />);
    return { user, ...getActionButtons() };
  };

  const setupActionButtons = ({
    props,
    formContext,
    wizard,
    applicationApi,
  }: TestSetupOptions = {}): {
    user: ReturnType<typeof userEvent.setup>;
    cancelButton: HTMLElement;
    nextButton: HTMLElement;
  } => {
    (useFormContext as jest.Mock).mockReturnValue(
      formContext ?? getDefaultFormContext()
    );
    (useWizard as jest.Mock).mockReturnValue(wizard ?? getDefaultWizard());
    (useApplicationApi as jest.Mock).mockReturnValue(
      applicationApi ?? getDefaultApplicationApi()
    );

    return renderActionButtonsWithProps(props);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useConfirm as jest.Mock).mockReturnValue({
      confirm: mockConfirm,
    });

    (useGoToPage as jest.Mock).mockReturnValue(mockGoToPage);
  });

  it('shows leave confirmation on cancel and does not delete when user declines', async () => {
    mockConfirm.mockResolvedValue(false);

    const { user, cancelButton } = setupActionButtons();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith({
        header: expect.any(String),
        content: expect.any(String),
        submitButtonLabel: expect.any(String),
        submitButtonVariant: 'danger',
      });
    });

    expect(mockDeleteApplication).not.toHaveBeenCalled();
    expect(setLeaveConfirmBypassed).not.toHaveBeenCalled();
    expect(mockGoToPage).not.toHaveBeenCalled();
  });

  it('deletes application and navigates away when user confirms cancel', async () => {
    mockConfirm.mockResolvedValue(true);
    mockDeleteApplication.mockImplementation((onSuccess: () => void) => {
      onSuccess();
    });

    const { user, cancelButton } = setupActionButtons();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockDeleteApplication).toHaveBeenCalledTimes(1);
    });

    expect(setLeaveConfirmBypassed).toHaveBeenCalledWith(true);
    expect(mockGoToPage).toHaveBeenCalledWith('/');
  });

  it('clears step history when form submission is invalid', async () => {
    const validationErrors = { company_name: { message: 'Required' } };
    const mockHandleSubmit = jest.fn(
      (_onValid: unknown, onInvalid: (errors: unknown) => void) => async () => {
        onInvalid(validationErrors);
      }
    );

    const { user, nextButton } = setupActionButtons({
      formContext: {
        handleSubmit: mockHandleSubmit,
        setError: jest.fn(),
        formState: { isSubmitting: false },
      },
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(mockClearStepHistory).toHaveBeenCalledTimes(1);
    });

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('sends application on last step and runs completion side effects', async () => {
    const onAfterLastStep = jest.fn();
    const validatedApplication: Record<string, string> = {
      company_name: 'Test Company Oy',
    };

    const mockHandleSubmit = jest.fn(
      (onValid: (application: unknown) => Promise<void>) => async () => {
        await onValid(validatedApplication);
      }
    );

    mockSendApplication.mockImplementation(
      (_application: unknown, onSuccess: () => void) => {
        onSuccess();
      }
    );

    const { user, nextButton } = setupActionButtons({
      props: { onAfterLastStep },
      formContext: {
        handleSubmit: mockHandleSubmit,
        setError: jest.fn(),
        formState: { isSubmitting: false },
      },
      wizard: {
        ...getDefaultWizard(),
        isLastStep: true,
      },
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(mockSendApplication).toHaveBeenCalledTimes(1);
    });

    expect(mockSendApplication).toHaveBeenCalledWith(
      validatedApplication,
      expect.any(Function)
    );
    expect(onAfterLastStep).toHaveBeenCalledTimes(1);
    expect(setLeaveConfirmBypassed).toHaveBeenCalledWith(true);
  });
});
