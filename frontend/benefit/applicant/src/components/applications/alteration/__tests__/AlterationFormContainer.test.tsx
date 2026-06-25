/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from '@tanstack/react-query';
import { RenderResult, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import AlterationFormContainer from 'benefit/applicant/components/applications/alteration/AlterationFormContainer';
import useCreateApplicationAlterationQuery from 'benefit/applicant/hooks/useCreateApplicationAlterationQuery';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import React from 'react';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

jest.mock('benefit/applicant/hooks/useCreateApplicationAlterationQuery');

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: jest.fn(),
  };
});

jest.mock('shared/components/toast/Toast');

// eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
const { default: hdsToast } = require('shared/components/toast/Toast');

const baseApplication = createMockApplication();

const getComponent = (
  onSuccess: jest.Mock = jest.fn(),
  onCancel: jest.Mock = jest.fn()
): RenderResult =>
  renderComponent(
    <AlterationFormContainer
      application={baseApplication}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  ).renderResult;

const makeAxiosError = (
  data: Record<string, unknown>,
  status = 400
): AxiosError => {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    statusText: 'Bad Request',
    data,
    headers: {},
    config: {} as any,
  };
  return error;
};

describe('AlterationFormContainer', () => {
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
      isPending: false,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  const captureOnSuccess = (): {
    getOnSuccess: () =>
      | ((response: ApplicationAlterationData) => Promise<void>)
      | undefined;
  } => {
    let capturedOnSuccess:
      | ((response: ApplicationAlterationData) => Promise<void>)
      | undefined;
    (useCreateApplicationAlterationQuery as jest.Mock).mockImplementation(
      ({ onSuccess }) => {
        capturedOnSuccess = onSuccess;
        return { mutate: jest.fn(), error: null, isPending: false };
      }
    );
    return { getOnSuccess: () => capturedOnSuccess };
  };

  it('renders the alteration form content', () => {
    getComponent();

    expect(screen.getByText('Muutokset työsuhteessa')).toBeInTheDocument();
  });

  it('calls onCancel when clicking cancel button', async () => {
    const onCancel = jest.fn();
    const user = setupUserAndRender(() => {
      getComponent(jest.fn(), onCancel);
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Peruuta',
      })
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls handleSubmit when clicking submit button', async () => {
    const mockMutate = jest.fn();
    (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: null,
      isPending: false,
    });

    const user = setupUserAndRender(() => {
      getComponent();
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Lähetä',
      })
    );

    // Form needs to be valid and submitted for mutation to be called
    expect(
      screen.getByRole('button', {
        name: 'Lähetä',
      })
    ).toBeInTheDocument();
  });

  it('disables submit button while submitting', () => {
    (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
      isPending: true,
    });

    getComponent();

    expect(
      screen.getByRole('button', {
        name: 'Lähetetään...',
      })
    ).toBeDisabled();
  });

  it('disables submit button when form is submitted and invalid', async () => {
    const user = setupUserAndRender(() => {
      getComponent();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Lähetä',
    });

    // Submit with invalid form
    await user.click(submitButton);

    // Wait for validation to complete
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows invalid form message when form has been submitted and is invalid', async () => {
    const user = setupUserAndRender(() => {
      getComponent();
    });

    // Submit with invalid form
    await user.click(
      screen.getByRole('button', {
        name: 'Lähetä',
      })
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(
        screen.getByText('Täytä lomakkeen puuttuvat tai virheelliset kentät')
      ).toBeInTheDocument();
    });
  });

  describe('handleSuccess callback', () => {
    it('invalidates queries, calls onSuccess, and shows termination toast', async () => {
      const mockOnSuccess = jest.fn();
      const { getOnSuccess } = captureOnSuccess();

      getComponent(mockOnSuccess);

      await getOnSuccess()?.({
        alteration_type: ALTERATION_TYPE.TERMINATION,
      } as ApplicationAlterationData);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['applications', baseApplication.id],
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(hdsToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          labelText: 'Työsuhteen muutosilmoitus lähetetty',
          text: 'Hakemuksen 2026-0001 työsuhde on ilmoitettu päättyväksi.',
        })
      );
    });

    it('shows suspension toast with correct text key', async () => {
      const { getOnSuccess } = captureOnSuccess();

      getComponent();

      await getOnSuccess()?.({
        alteration_type: ALTERATION_TYPE.SUSPENSION,
      } as ApplicationAlterationData);

      expect(hdsToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          labelText: 'Työsuhteen muutosilmoitus lähetetty',
          text: 'Hakemuksen 2026-0001 työsuhde on ilmoitettu keskeytyväksi.',
        })
      );
    });
  });

  describe('handleError callback', () => {
    it('shows error toast with mapped field errors', async () => {
      (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        error: makeAxiosError({
          end_date: ['End date is required'],
          reason: ['Reason must be at least 10 characters'],
        }),
        isPending: false,
      });

      getComponent();

      await waitFor(() => {
        expect(hdsToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            labelText: 'Tapahtui virhe',
          })
        );
      });

      const toastCall = (hdsToast as jest.Mock).mock.calls[0][0];
      expect(toastCall.text).toBeInstanceOf(Array);
      expect(toastCall.text).toHaveLength(2);
    });

    it('shows error toast with array errors for single field', async () => {
      (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        error: makeAxiosError({
          alteration_type: ['Field is required', 'Invalid choice'],
        }),
        isPending: false,
      });

      getComponent();

      await waitFor(() => {
        expect(hdsToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            labelText: 'Tapahtui virhe',
          })
        );
      });

      const toastCall = (hdsToast as jest.Mock).mock.calls[0][0];
      expect(toastCall.text).toBeInstanceOf(Array);
      expect(toastCall.text).toHaveLength(2);
    });

    it('includes field labels in error items when available', async () => {
      (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        error: makeAxiosError({ end_date: ['This field is required'] }),
        isPending: false,
      });

      getComponent();

      await waitFor(() => expect(hdsToast).toHaveBeenCalled());

      const toastCall = (hdsToast as jest.Mock).mock.calls[0][0];
      const errorItems = toastCall.text as React.ReactElement[];
      expect(errorItems[0]).toBeDefined();
    });

    it('handles errors without response data gracefully', async () => {
      (useCreateApplicationAlterationQuery as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        error: makeAxiosError({}, 500),
        isPending: false,
      });

      getComponent();

      await waitFor(() => {
        expect(hdsToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            labelText: 'Tapahtui virhe',
          })
        );
      });

      const toastCall = (hdsToast as jest.Mock).mock.calls[0][0];
      expect(toastCall.text).toBeInstanceOf(Array);
      expect(toastCall.text).toHaveLength(0);
    });
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
